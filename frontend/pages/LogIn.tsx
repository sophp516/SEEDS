import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ActivityIndicator, Image } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../services/firestore.js';
import { useAuth } from '../context/authContext.js';
import Toast from 'react-native-toast-message';
import colors from '../styles.js';

type RootStackParamList = {
    SignUp: undefined;
    Home: undefined;
};

const LogIn = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const { setLoggedInUser } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleChange = (name: string, value: string) => {
        setInput({ ...input, [name]: value });
    }

    const doesEmailExist = async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', input.email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const asyncLogIn = async () => {
        setLoading(true);
        try {
            const emailExists = await doesEmailExist();
            if (!emailExists) {
                Toast.show({
                    type: 'error',
                    text1: 'User Does Not Exist',
                    text2: 'Please ensure your email address is correct.'
                });
                setLoading(false);
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, input.email, input.password);
            setLoggedInUser(userCredential.user);

            Toast.show({
                type: 'success',
                text1: 'You have successfully logged in!',
            });

            navigation.navigate('Home');
            
        } catch (error) {
            console.log(error);
            Toast.show({
                type: 'error',
                text1: 'Login Error',
                text2: 'An error occurred during login. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
                <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome back!</Text>
                <Text style={styles.welcomeSubtext}>Log in to your account to post reviews and get recommendations. </Text>
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
                        placeholder="Password"
                        value={input.password}
                        secureTextEntry={true}
                        onChangeText={(text) => handleChange('password', text)}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={asyncLogIn} style={styles.logInButton}>
                        <Text style={styles.logInText}>LOG IN</Text>
                    </TouchableOpacity>
                    <View style={styles.signUpNav}>
                        <Text style={styles.createAccountText}>Want to create an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.signUpNavText}>Sign up</Text>
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
        // marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: colors.backgroundGray
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
    input: {
        fontFamily: 'Satoshi-Medium',
        height: 50,
        borderColor: colors.textGray,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 30,
        width: '100%',
    },
    logInButton: {
        backgroundColor: colors.orangeHighlight,
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpNav: {
        paddingTop: 20,
        flexDirection: 'row',
    },
    createAccountText: {
        fontFamily: 'Satoshi-Bold',
        color: colors.textGray,
    },
    logInText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: colors.backgroundGray,
    },
    signUpNavText: {
        marginLeft: 5,
        textDecorationLine: 'underline',
        fontFamily: 'Satoshi-Bold',
        color: colors.textGray,
    },
});

export default LogIn;
