import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/authContext.js';
import { db } from '../services/firestore.js';
import Navbar from '../components/Navbar.jsx';

const Home = () => {

    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                if (!displayName && loggedInUser) {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('id', '==', loggedInUser.uid));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const userData = userDoc.data();
                        setLoggedInUser({
                            ...user,
                            displayName: userData.displayName
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching displayName:', error);
            }
        };

        fetchDisplayName();
    }, [displayName, loggedInUser, user]);


    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome {displayName || 'Guest'}</Text>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // Set background color if necessary
    },
    text: {
        fontSize: 24, // Increase font size for prominence
        fontWeight: 'bold', // Add bold style for prominence
        marginBottom: 20, // Add margin bottom to separate from Navbar
    },
});

export default Home;