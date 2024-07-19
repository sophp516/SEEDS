import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth, storage } from '../services/firestore.js';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Navbar from '../components/Navbar.jsx';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import colors from '../styles.js';
import Post from '../components/Post.tsx';
import Review from '../components/Review.tsx';

type RootStackParamList = {
    SignUp: undefined;
    MyProfile: undefined;
    MyPreferences: undefined;
    MyActivity: undefined;
};


const Profile = () => {
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;
    const [editingStatus, setEditingStatus] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const userId = loggedInUser?.uid;
                if (!userId) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'User not found.'
                    });
                    return;
                }
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('id', '==', userId));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
                    setLoggedInUser({
                        ...user,
                        displayName: userData.displayName
                    });
                    setNameInput(userData.displayName); 
                }
            } catch (error) {
                console.error('Error fetching displayName:', error);
            }
        };

        if (!displayName && loggedInUser) {
            fetchDisplayName();
        }
    }, [displayName, loggedInUser, setLoggedInUser]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const userId = loggedInUser?.uid;
                if (!userId) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'User not found.'
                    });
                    return;
                }
                const q = query(collection(db, 'users'), where('id', '==', userId));
                const querySnapshot = await getDocs(q);
    
                if (!querySnapshot.empty) {
                    const userData = querySnapshot.docs[0].data();
    
                    if (userData.tags && Array.isArray(userData.tags)) {
                        setTags(userData.tags);
                    } else {
                        setTags([]);
                    }
                } else {
                    setTags([]);
                }
            } catch (e) {
                console.error('Error fetching tags:', e);
            }
        };
    
        if (loggedInUser) {
            fetchTags();
        }
    }, [loggedInUser]);

    const handleEditToggle = () => {
        setNameInput(displayName);
        setEditingStatus(true);
    };

    const asyncSignOut = async () => {
        try {
            await signOut(auth);
            setLoggedInUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setProfileImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            
            {displayName ? (
                <View style={styles.profileBox}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    <View>
                        {editingStatus ? (
                            <View style={styles.editingContainer}>
                                <TextInput
                                    style={styles.inputName}
                                    value={nameInput}
                                    onChangeText={setNameInput}
                                    placeholder="Enter your display name"
                                />
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                                    <Text>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingStatus(false)}>
                                    <Text>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.displayContainer}>
                                <Text style={styles.displayName}>{displayName}</Text>
                                <TouchableOpacity onPress={handleEditToggle}>
                                    <Text>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.createAccountButton}>
                            <Text style={styles.createAccountText}>Create an account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View style={styles.profileSections}>
                <TouchableOpacity style={styles.profileSectionButton} onPress={() => navigation.navigate('MyProfile')}>
                    <Text>My Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileSectionButton} onPress={() => navigation.navigate('MyPreferences')}>
                    <Text>My Preferences</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileSectionButton} onPress={() => navigation.navigate('MyActivity')}>
                    <Text>My Activity</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={asyncSignOut}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
            <Navbar />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileBox: {
        alignItems: 'center',
        marginTop: 90,
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
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
        paddingHorizontal: 10,
        backgroundColor: 'blue',
        borderRadius: 5,
    },
    createAccountText: {
        color: 'white',
    },
    profileSections: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
    },
    profileSectionButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        // backgroundColor: 'lightblue',
        borderRadius: 10,
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
    },
});

export default Profile;