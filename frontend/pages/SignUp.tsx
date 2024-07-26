import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { collection, query as firestoreQuery, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../services/firestore.js';
import { useAuth } from '../context/authContext.js';
import Toast from 'react-native-toast-message';
import collegesData from '../services/UScolleges.json';
import colors from '../styles.js';

type RootStackParamList = {
    LogIn: undefined;
    Home: undefined;
};

const SignUp = () => {
    const [input, setInput] = useState({
        email: "",
        username: "",
        schoolName: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [suggestionsList, setSuggestionsList] = useState([]);
    const [query, setQuery] = useState("");
    const dropdownController = useRef(null);
    const searchRef = useRef(null);

    const { setLoggedInUser } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleChange = (name: string, value: string) => {
        setInput({ ...input, [name]: value });
    }

    const isEmailUnique = async (email: string) => {
        const usersRef = collection(db, 'users');
        const q = firestoreQuery(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    }

    const isUsernameUnique = async (username: string) => {
        const usersRef = collection(db, 'users');
        const q = firestoreQuery(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    };

    const doPasswordsMatch = () => {
        return input.password === input.confirmPassword;
    }

    const asyncSignUp = async () => {
        setLoading(true);
        try {
            if (!await isEmailUnique(input.email)) {
                Toast.show({
                    type: 'error',
                    text1: 'Email Unavailable',
                    text2: 'This email address is already in use. Please choose another one.'
                });
                return;
            }
            if (!await isUsernameUnique(input.username)) {
                Toast.show({
                    type: 'error',
                    text1: 'Username Unavailable',
                    text2: 'This username is unavailable. Please choose another one.'
                });
                setLoading(false);
                return;
            }
            if (!doPasswordsMatch()) {
                Toast.show({
                    type: 'error',
                    text1: 'Passwords Do Not Match',
                    text2: 'Please ensure both passwords match.'
                });
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
            setLoggedInUser({
                ...userCredential.user,
                username: input.username,
                schoolName: input.schoolName,
            });

            const userRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userRef, {
                id: userCredential.user.uid,
                email: input.email,
                displayName: input.username,
                schoolName: input.schoolName,
                password: input.password,
                submissions: [],
                likesCount: 0,
            });

            Toast.show({
                type: 'success',
                text1: 'Sign Up Successful',
                text2: 'You have successfully signed up!'
            });

            navigation.navigate('Home');

        } catch (e) {
            console.error(e);
            Toast.show({
                type: 'error',
                text1: 'Sign Up Error',
                text2: 'An error occurred during sign up. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    }

    const getSuggestions = useCallback(async (q: string) => {
        const filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 3) {
            setSuggestionsList([]);
            return;
        }
        setLoading(true);
        const items = collegesData;
        const suggestions = items
            .filter(item => item.title.toLowerCase().includes(filterToken))
            .map(item => ({
                id: item.id,
                title: item.title,
            }));
        setSuggestionsList(suggestions);
        setLoading(false);
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome!</Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={input.email}
                        onChangeText={(text) => handleChange('email', text)}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={input.username}
                        onChangeText={(text) => handleChange('username', text)}
                        autoCapitalize="none"
                    />
                    <AutocompleteDropdown
                        ref={searchRef}
                        controller={(controller) => {
                            dropdownController.current = controller;
                        }}
                        direction={Platform.select({ ios: 'down' })}
                        dataSet={suggestionsList}
                        onChangeText={(text) => {
                            setQuery(text);
                            getSuggestions(text);
                        }}
                        onSelectItem={(item) => {
                            if (item) {
                                setInput({ ...input, schoolName: item.title });
                                setQuery(item.title);
                            }
                        }}
                        debounce={600}
                        onClear={() => {
                            setSuggestionsList([]);
                            setQuery('');
                        }}
                        loading={loading}
                        textInputProps={{
                            placeholder: 'Type 3+ letters (School...)',
                            value: query,
                            autoCorrect: false,
                            autoCapitalize: 'none',
                            style: {
                                borderRadius: 10,
                                borderColor: 'black',
                                borderWidth: 1,
                                backgroundColor: colors.backgroundGray,
                                color: 'black',
                                fontSize: 14,
                                paddingLeft: 10,
                                marginRight: 20,
                                height: 40,
                                width: '100%',
                                marginBottom: 13,
                            },
                            onChangeText: (text) => {
                                setQuery(text);
                                getSuggestions(text);
                            }
                        }}
                        rightButtonsContainerStyle={{
                            right: 8,
                            alignSelf: 'center',
                            borderRadius: 30,
                            backgroundColor: colors.inputGray,
                            height: 40,
                            width: 40,
                            marginBottom: 13,
                        }}
                        inputContainerStyle={{
                            backgroundColor: colors.backgroundGray,
                            borderRadius: 10,
                        }}
                        suggestionsListContainerStyle={{
                            backgroundColor: colors.backgroundGray,
                        }}
                        containerStyle={{ width: '100%', marginBottom: 12 }}
                        renderItem={(item) => (
                            <Text style={{ color: '#35353E', padding: 15 }}>{item.title}</Text>
                        )}
                        inputHeight={50}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={input.password}
                        onChangeText={(text) => handleChange('password', text)}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={input.confirmPassword}
                        onChangeText={(text) => handleChange('confirmPassword', text)}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={asyncSignUp} style={styles.signUpButton}>
                        <Text style={styles.signUpText}>Sign up</Text>
                    </TouchableOpacity>
                    <View style={styles.logInNav}>
                        <Text>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
                            <Text style={styles.logInNavText}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.backgroundGray,
    },
    welcomeContainer: {
        width: '100%',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 23,
        fontWeight: '500',
    },
    logInNav: {
        paddingTop: 20,
        flexDirection: 'row',
    },
    input: {
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 25,
        paddingHorizontal: 8,
        width: '100%',
        borderRadius: 10,
    },
    signUpButton: {
        backgroundColor: colors.orangeHighlight,
        width: '100%',
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
    },
    signUpText: {
        fontSize: 20,
    },
    backButtonText: {
        fontSize: 15,
    },
    logInNavText: {
        marginLeft: 5,
        textDecorationLine: 'underline',
    },
});

export default SignUp;
