import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/authContext.js';
import { signOut } from "firebase/auth";
import { db, auth } from '../services/firestore.js';
import Navbar from '../components/Navbar.jsx';

const Profile = () => {
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;

    const [fetchedDisplayName, setFetchedDisplayName] = useState(null);

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
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
            } catch (error) {
                console.error('Error fetching displayName:', error);
            }
        };

        if (!displayName && loggedInUser) {
            fetchDisplayName();
        }
    }, [displayName, loggedInUser, setLoggedInUser]);

    const asyncSignOut = async () => {
        try {
            await signOut(auth);
            setLoggedInUser(null);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{displayName || 'Guest'}</Text>
            <TouchableOpacity onPress={asyncSignOut}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
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

export default Profile;
