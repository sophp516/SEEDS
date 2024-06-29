import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from '../services/firestore.js';
import { useAuth } from '../context/authContext.js';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
    SignUp: undefined;
    Home: undefined;
};

const SignUp = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });

    const { setLoggedInUser } = useAuth();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handleChange = (name, value) => {
        setInput({ ...input, [name]: value });
    }

    const doesEmailExist = async () => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', input.email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    };

    const asyncLogIn = async () => {
        try {
            const emailExists = await doesEmailExist();
            if (!emailExists) {
                Toast.show({
                    type: 'error',
                    text1: 'User Does Not Exist',
                    text2: 'Please ensure your email is correct.'
                });
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
        }
    }                       

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="email"
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
            <Button title="Log In" onPress={asyncLogIn} />
            <Button title="Want to create an account?" onPress={() => navigation.navigate('SignUp')} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        width: '100%',
    },
});

export default SignUp;
