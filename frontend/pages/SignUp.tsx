import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, addDoc, doc ,setDoc} from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Platform } from 'react-native';
import { ActivityIndicator } from 'react-native';
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
        displayName: "",
        schoolName: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [suggestionsList, setSuggestionsList] = useState(null);
    const dropdownController = useRef(null);
    const searchRef = useRef(null);

    const { setLoggedInUser } = useAuth();

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleChange = (name, value) => {
        setInput({ ...input, [name]: value });
    }

    const isEmailUnique = async (email: String) => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    }

    const isDisplayNameUnique = async (displayName: string) => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('displayName', '==', displayName));
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
                    text2: 'The email address is already taken. Please choose another one.'
                });
                return;
            }
            if (!await isDisplayNameUnique(input.displayName)) {
                Toast.show({
                    type: 'error',
                    text1: 'Display Name Unavailable',
                    text2: 'The display name is already taken. Please choose another one.'
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
            
            const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password)
            setLoggedInUser({
                ...userCredential.user,
                displayName: input.displayName,
                schoolName: input.schoolName,
            });

            // const usersRef = collection(db, 'users');
            // await addDoc(usersRef, {
            //     id: userCredential.user.uid,
            //     email: input.email,
            //     displayName: input.displayName,
            //     schoolName: input.schoolName,
            //     password: input.password,
            // });
            
            const userRef = doc(db, 'users', userCredential.user.uid);
            await setDoc(userRef, {
                id: userCredential.user.uid,
                email: input.email,
                displayName: input.displayName,
                schoolName: input.schoolName,
                password: input.password,
                submissions: [],
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

    const getSuggestions = useCallback(async (q) => {
        const filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 3) {
            setSuggestionsList(null);
            return;
        }
        setLoading(true);
        // Replace the URL with your actual endpoint for fetching school names
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
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Display Name"
                        value={input.displayName}
                        onChangeText={(text) => handleChange('displayName', text)}
                    />
                    <AutocompleteDropdown
                        ref={searchRef}
                        controller={(controller) => {
                            dropdownController.current = controller;
                        }}
                        direction={Platform.select({ ios: 'down' })}
                        dataSet={suggestionsList}
                        onChangeText={getSuggestions}
                        onSelectItem={(item) => {
                            item && setInput({ ...input, schoolName: item.title });
                        }}
                        debounce={600}
                       onClear={() => setSuggestionsList(null)}
                        loading={loading}
                        textInputProps={{
                            placeholder: 'Type 3+ letters (school...)',
                            autoCorrect: false,
                            autoCapitalize: 'none',
                            style: {
                                borderRadius: 10,
                                borderColor: 'black',
                                borderWidth: 1,
                                backgroundColor: colors.backgroundGra,
                                color: 'black',
                                fontSize: 14,
                                paddingLeft: 10,
                                marginRight: 20,
                                height: 40,
                                width: '100%',
                                marginBottom: 13,
                            },
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
                            backgroundColor: colors.backgroundGra,
                            borderRadius: 10,
                        }}
                        suggestionsListContainerStyle={{
                            backgroundColor: colors.backgroundGray,
                        }}
                        containerStyle={{ width: '100%', marginBottom: 12 }}
                        renderItem={(item, text) => (
                            <Text style={{ color: '#fff', padding: 15 }}>{item.title}</Text>
                        )}
                        inputHeight={50}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={input.password}
                        onChangeText={(text) => handleChange('password', text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={input.confirmPassword}
                        onChangeText={(text) => handleChange('confirmPassword', text)}
                    />
                    <TouchableOpacity onPress={asyncSignUp} style={styles.signUpButton}>
                        <Text style={styles.signUpText}>SIGN UP</Text>
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
    )
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