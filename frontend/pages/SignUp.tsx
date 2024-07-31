import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Platform, Image} from 'react-native';
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
                <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome!</Text>
                <Text style={styles.welcomeSubtext}>Create an account to post reviews and get recommendations. </Text>
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

                    {/* School dropdown */}
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
                            placeholder: 'School Name (Type 3+ letters)',
                            // placeholderTextColor: colors.textFaintBrown,
                            value: query,
                            autoCorrect: false,
                            autoCapitalize: 'none',
                            style: {
                                borderRadius: 10,
                                borderColor: colors.textGray,
                                borderWidth: 1,
                                backgroundColor: colors.backgroundGray,
                                // color: 'black',
                                fontSize: 14,
                                fontFamily: 'Satoshi-Medium',
                                color: colors.textGray,
                                paddingLeft: 10,
                                marginRight: 15,
                                // marginBottom: 30,
                                height: 50,
                                width: '100%',
                            },
                            onChangeText: (text) => {
                                setQuery(text);
                                getSuggestions(text);
                            }
                        }}
                        rightButtonsContainerStyle={{
                            right: 2,
                            alignSelf: 'center',
                            borderRadius: 15,
                            // backgroundColor: colors.inputGray,
                            height: 40,
                            width: 40,
                            // marginBottom: 25,
                        }}
                        inputContainerStyle={{
                            backgroundColor: colors.backgroundGray,
                            borderRadius: 10,
                            borderColor: colors.textGray,
                            // borderWidth: 0.5,
                            marginBottom: 35,
                        }}
                        suggestionsListContainerStyle={{
                            backgroundColor: colors.offWhite,
                        }}
                        containerStyle={{ width: '100%', marginBottom: 0 }}
                        renderItem={(item) => (
                            <Text
                                style={{ color: colors.textGray, padding: 15, fontFamily: 'Satoshi-Medium' }}>
                                {item.title}
                            </Text>
                        )}
                        inputHeight={50}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={input.password}
                        secureTextEntry={true}
                        onChangeText={(text) => handleChange('password', text)}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        value={input.confirmPassword}
                        secureTextEntry={true}
                        onChangeText={(text) => handleChange('confirmPassword', text)}
                        autoCapitalize="none"
                    />

                    <TouchableOpacity onPress={asyncSignUp} style={styles.signUpButton}>
                        <Text style={styles.signUpText}>SIGN UP</Text>
                    </TouchableOpacity>
                    <View style={styles.logInNav}>
                        <Text style={styles.accountExistsText}>Already have an account?</Text>
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
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 30,
        backgroundColor: colors.backgroundGray,
    },
    backButtonContainer: {
        // marginTop: 60,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute', // Make sure this is set to absolute
        top: 60, // Adjust according to your layout needs
        left: 30, // Adjust according to your layout needs
        // paddingHorizontal: 30,
    },
    backArrow: {
        width: 20,
        height: 20,
        marginRight: 10, // space between icon and text
    },
    backButtonText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 16,
        color: colors.textGray,
    },
    welcomeContainer: {
        width: '100%',
        marginTop: 100,
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 26,
        fontFamily: 'SpaceGrotesk-SemiBold',
        color: colors.textGray,
    },
    welcomeSubtext: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 15,
        color: colors.textGray,
        marginTop: 10,
    },
    logInNav: {
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    input: {
        fontFamily: 'Satoshi-Medium',
        height: 50,
        borderColor: colors.textGray,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 30,
        paddingHorizontal: 12,
        width: '100%',
    },
    signUpButton: {
        backgroundColor: colors.orangeHighlight,
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: colors.backgroundGray,
    },
    accountExistsText: {
        fontFamily: 'Satoshi-Bold',
        color: colors.textGray,
    },
    logInNavText: {
        marginLeft: 5,
        textDecorationLine: 'underline',
        fontFamily: 'Satoshi-Bold',
        color: colors.textGray,
    },
});

export default SignUp;
