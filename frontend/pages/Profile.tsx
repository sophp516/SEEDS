import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { signOut } from "firebase/auth";
import { db, auth } from '../services/firestore.js';
import * as ImagePicker from 'expo-image-picker';
import Navbar from '../components/Navbar.jsx';

type RootStackParamList = {
    SignUp: undefined;
};

const Profile = () => {
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;
    const [ editingStatus, setEditingStatus ] = useState(false);
    const [ nameEditingStatus, setNameEditingStatus ] = useState(false);
    const [ tags, setTags ] = useState([]);
    const [ profileImage, setProfileImage ] = useState<string | null>(null);
    const [ nameInput, setNameInput ] = useState('');
    const [ tagInput, setTagInput ] = useState('');
    const [ postHistory, setPostHistory ] = useState(true);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const asyncSaveUser = async (field, value) => {
        try {
            const userDocRef = doc(db, 'users', loggedInUser.uid);
            await updateDoc(userDocRef, { [field]: value })
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('id', '==', loggedInUser.loggedInUser.uid));
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

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('id', '==', loggedInUser.loggedInUser.uid));
                const querySnapshot = await getDocs(q);
    
                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
    
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

    const asyncSignOut = async () => {
        try {
            await signOut(auth);
            setLoggedInUser(null);
        } catch (err) {
            console.error(err);
        }
    }

    const handleAddTag = () => {
        setTags( [ ...tags, tagInput] );
        setTagInput('');
    }

    const handleDeleteTag = (index) => {
        const newTags = tags.filter((tag, i) => i !== index);
        setTags(newTags);
    }

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

    const handleSaveDisplayName = () => {
        setNameEditingStatus(false);
    };

    return (
        <View style={styles.container}>
            {displayName ? (
                editingStatus ? (
                    <View style={styles.profileBox}>
                        <TouchableOpacity onPress={pickImage}>
                            <Image
                                source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                        <View>
                            {nameEditingStatus ? (
                                <View style={styles.editingContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={nameInput}
                                        onChangeText={setNameInput}
                                        placeholder="Enter your display name"
                                    />
                                    <TouchableOpacity onPress={() => setNameEditingStatus(false)}>
                                        <Text>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleSaveDisplayName}>
                                        <Text>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.displayContainer}>
                                    <Text style={styles.displayName}>{displayName || 'Guest'}</Text>
                                    <TouchableOpacity onPress={() => setNameEditingStatus(true)}>
                                        <Text>edit</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.tagContainer}>
                                {tags.map((tag, i) => (
                                    <View style={styles.tagWithDelete} key={i}>
                                        <Text>{tag}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteTag(i)}>
                                            <Text style={styles.tagDeleteButton}>x</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.tagInputContainer}>
                                <TextInput 
                                    style={styles.tagInput}
                                    value={tagInput}
                                    onChangeText={setTagInput}
                                />
                                <TouchableOpacity onPress={handleAddTag} style={styles.editProfileButton}>
                                    <Text>add</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.profileButtonContainer}>
                                <TouchableOpacity onPress={() => setEditingStatus(false)} style={styles.editProfileButton}>
                                    <Text>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingStatus(false)} style={styles.editProfileButton}>
                                    <Text>Save Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.profileBox}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                            style={styles.profileImage}
                        />
                        <View>
                            <Text style={styles.displayName}>{displayName}</Text>
                            <View style={styles.tagContainer}>
                                {tags.map((tag, i) => (
                                    <View style={styles.tagWithDelete} key={i}>
                                        <Text>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity onPress={() => setEditingStatus(true)} style={styles.editProfileButton}>
                                <Text>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )
            ) : (
                <View style={styles.profileBox}>
                    <Image
                            source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                            style={styles.profileImage}
                        />
                    <View style={styles.guestProfileButtonContainer}>
                        <Text style={styles.displayName}>Guest</Text>
                        <TouchableOpacity onPress={() => {navigation.navigate('SignUp')}}>
                            <Text>Create an account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View>
                <View style={styles.profileToggle}>
                    <TouchableOpacity style={[styles.profileToggleButton, postHistory && styles.activeButton]} onPress={() => setPostHistory(true)}>
                        <Text>my posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.profileToggleButton, !postHistory && styles.activeButton]} onPress={() => setPostHistory(false)}>
                        <Text>favorites</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: 'white',
        flexDirection: 'column'
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 20
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10
    },
    editProfileButton: {
        backgroundColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 10
    },
    profileButtonContainer: {
        flexDirection: 'row',
        marginTop: 10
    },
    tagInputContainer: {
        flexDirection: 'row',
    },
    tagInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: 100,
        height: 25,
        marginRight: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
        marginBottom: 10
    },
    displayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    editingContainer: {
        marginBottom: 10
    },
    tagContainer: {
        flexDirection: 'row',
        marginBottom: 10
    },
    tagWithDelete: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 3,
        paddingBottom: 3,
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: 'gray',
        marginRight: 5
    }, 
    tagDeleteButton: {
        marginLeft: 5
    },
    profileToggle: {
        flexDirection: 'row',
        marginTop: 10
    },
    profileToggleButton: {
        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: 'gray',
    },
    activeButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc', 
    },
    guestProfileButtonContainer: {
        flexDirection: 'column',
    }
});

export default Profile;