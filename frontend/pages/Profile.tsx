import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth, storage } from '../services/firestore.js';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';

type RootStackParamList = {
    LogIn: undefined;
    MyProfile: undefined;
    MyPreferences: undefined;
    MyActivity: undefined;
};

const Profile = () => {
    const { user, setLoggedInUser } = useAuth();
    const [tags, setTags] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [userInfo, setUserInfo] = useState(null);
    console.log(user.id);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user) return;
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('id', '==', user?.id));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    setUserInfo(userData);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchUserData();
    }, []);

    const handleNavigation = (dest) => {
        if (!user.id) {
            Toast.show({
                type: 'error',
                text1: 'Log in to unlock more features',
            });
        } else {
            navigation.navigate(dest)
        }
    }


    const asyncSignOut = async () => {
        try {
            await signOut(auth);
            setLoggedInUser(null);
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>
            {user?.displayName ? (
                <View style={styles.profileBox}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                        style={styles.profileImage}
                    />
                    <View style={styles.displayContainer}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.atSymbol}>@</Text>
                            <Text style={styles.displayName}>{user?.displayName}</Text>
                        </View>
                        <Text style={styles.schoolName}>{userInfo?.schoolName}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.profileBox}>
                    <Image
                        source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                        style={styles.profileImage}
                    />
                    <View style={styles.guestProfileButtonContainer}>
                        <Text style={styles.displayName}>Guest</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('LogIn')} style={styles.createAccountButton}>
                            <Text style={styles.createAccountText}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View style={styles.profileSections}>
                <TouchableOpacity style={styles.profileSectionButton} onPress={() => handleNavigation('MyProfile')}>
                    <Image style={styles.profileSectionIcon} source={require('../assets/profile.png')} resizeMode="contain"/>
                    <Text style={styles.profileSectionText}>My Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileSectionButton} onPress={() => handleNavigation('MyPreferences')}>
                    <Image style={styles.profileSectionIcon} source={require('../assets/emptyHeart.png')} resizeMode="contain"/>
                    <Text style={styles.profileSectionText}>My Preferences</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileSectionButton} onPress={() => handleNavigation('MyActivity')}>
                    <Image style={styles.profileSectionIcon} source={require('../assets/activity.png')} resizeMode="contain"/>
                    <Text style={styles.profileSectionText}>My Activity</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.signOutButton} onPress={asyncSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <Navbar />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundGray,
    },
    header: {
        fontFamily: 'SpaceGrotesk-SemiBold',
        fontSize: 24,
        color: colors.textGray,
        marginTop: 96,
        marginLeft: 36,
    },
    profileBox: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingTop: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        backgroundColor: colors.navbarBackground,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        marginRight: 30,
        backgroundColor: colors.backgroundGray,
    },
    atSymbol: {
        fontFamily: 'SpaceGrotesk-Regular',
        fontSize: 16,
        marginRight: 2,
        marginBottom: 2,
    },
    displayName: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textGray,
        marginBottom: 5,
    },
    schoolName: {
        fontFamily: 'Satoshi-Regular',
        fontSize: 14,
        color: colors.textGray,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    tagWithDelete: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: 'lightgray',
        marginRight: 5,
        marginBottom: 5,
    },
    tagDeleteButton: {
        marginLeft: 5,
        color: 'red',
    },
    createAccountButton: {
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        backgroundColor: colors.orangeHighlight,
        borderRadius: 5,
    },
    createAccountText: {
        fontFamily: 'Satoshi-Medium',
        color: 'white',
        fontSize: 15,
    },
    profileSections: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
        marginTop: 10,
    },
    profileSectionButton: {
        flexDirection: 'row',
        alignItems: 'center',    
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 30,
        borderRadius: 10,
        borderBottomColor: colors.outlineDarkBrown,
        borderBottomWidth: 1,
    },
    profileSectionIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    profileSectionText: {
        fontSize: 18,
        fontFamily: 'Satoshi-Medium',
        color: colors.textGray,
    },
    inputName: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '80%',
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    tagInput: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 10,
        width: '60%',
    },
    editProfileButton: {
        backgroundColor: 'lightblue',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    saveCancelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    saveButton: {
        backgroundColor: 'lightgreen',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: 'pink',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    editingContainer: {
        
    },
    displayContainer: {
    
    },
    guestProfileButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    signOutText: {
        marginVertical: 10,
        fontSize: 15,
        fontFamily: 'Satoshi-Medium',
    },
    signOutButton: {
        marginTop: 60,
        marginHorizontal: 'auto',
        backgroundColor: colors.inputGray,
        alignItems: 'center',
        justifyContent: 'center',
        width: '20%',
        borderRadius: 5,
    }
});

export default Profile;