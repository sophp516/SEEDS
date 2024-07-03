import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
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
                    text2: 'Please ensure your email is correct.'
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
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome back!</Text>
            </View>
            <View style={styles.backButtonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
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
                        placeholder="Password"
                        value={input.password}
                        secureTextEntry={true}
                        onChangeText={(text) => handleChange('password', text)}
                    />
                    <TouchableOpacity onPress={asyncLogIn} style={styles.signUpButton}>
                        <Text style={styles.signUpText}>LOG IN</Text>
                    </TouchableOpacity>
                    <View style={styles.logInNav}>
                        <Text>Want to create an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
        backgroundColor: colors.backgroundGray
    },
    logInNav: {
        paddingTop: 20,
        flexDirection: 'row',
    },
    logInNavText: {
        marginLeft: 5,
        textDecorationLine: 'underline',
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
    backButtonContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
    },
    backButtonText: {
        fontSize: 15,
    },
    signUpButton: {
        backgroundColor: colors.orangeHighlight,
        width: '100%',
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 20,
    },
    welcomeContainer: {
        width: '100%',
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 23,
        fontWeight: '500',
    },
});

export default LogIn;
