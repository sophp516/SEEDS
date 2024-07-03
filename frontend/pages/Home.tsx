import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/authContext.js';
import { db } from '../services/firestore.js';
import Navbar from '../components/Navbar.jsx';
import DiningPlaceHome from '../components/DiningPlaceHome.tsx';
import DartmouthDining from '../services/DartmouthDining.json';
import colors from '../styles.js';

const Home = () => {

    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;
    const [ diningPlaceList, setDiningPlaceList ] = useState(DartmouthDining);

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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.homeTextContainer}>
                <Text style={styles.welcomeText}>Welcome, {displayName || 'Guest'}</Text>
                <Text style={styles.guideText}>Select a dining option below</Text>
            </View>
            <View style={styles.placeComponentContainer}>
            {diningPlaceList && 
            diningPlaceList.map((place, i) => {
                return (
                    <DiningPlaceHome 
                        key={i}
                        placeName={place.placeName}
                        openingHour={place.openingHour}
                        closingHour={place.closingHour}
                        businessLevel={place.businessLevel}
                    />
                )
            })}
            </View>
            </ScrollView>
            <Navbar />
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundGray,
        width: '100%',
    },
    homeTextContainer: {
        paddingLeft: 20,
        marginTop: 40,
    },
    scrollContainer: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 100,
        flexGrow: 1,
    },
    welcomeText: {
        fontSize: 29,
        fontWeight: '500',
        marginBottom: 5, 
    },
    placeComponentContainer: {
        width: '100%',
        justifyContent: 'center',
    },
    guideText: {
        fontSize: 18,
        marginBottom: 20,
    }
});

export default Home;