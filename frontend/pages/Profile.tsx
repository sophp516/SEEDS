import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { signOut } from "firebase/auth";
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
};

type Submission = {
    isReview: boolean;
    reviewId?: string;
    postId?: string;
    foodName?: string;
    comment?: string;
    health?: number;
    taste?: number;
    likes?: number;
    location?: string;
    price?: number;
    tags?: string[];
    timestamp?: string;
    userId?: string;
    image?: string;
    subComment?: string;
}

const Profile = () => {
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;
    const [editingStatus, setEditingStatus] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [postHistory, setPostHistory] = useState(true);
    const [postList, setPostList] = useState([]);
    const [postIds, setPostIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const userId = loggedInUser?.loggedInUser?.uid;
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
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
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
        if (!loggedInUser) return
        const fetchHistory = async () => {
            try {
                const userId = loggedInUser?.loggedInUser?.uid;
                console.log(userId)
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
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    setPostIds(userData.submissions || [])
                }

            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        if (loggedInUser) {
            fetchHistory();
        }
    }, [loggedInUser])

    useEffect(() => {
        const fetchReviewWithId = async (id: string) => {
            try {
                const submissionRef = doc(db, 'globalSubmissions', id);
                const submissionDoc = await getDoc(submissionRef);
    
                if (submissionDoc.exists()) {
                    const submissionData = submissionDoc.data();
                    setPostList((currentPosts) => [...currentPosts, { ...submissionData, id }]);
                } else {
                    console.log(`No submission found with ID ${id}`);
                }
            } catch (error) {
                console.error("Error fetching submission:", error);
            }
        };

        const fetchHistory = async () => {
            setLoading(true);
            for (const id of postIds) {
                await fetchReviewWithId(id);
            }
            setLoading(false);
        };

        if (postIds.length > 0) {
            fetchHistory();
        }
    }, [postIds]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const userId = loggedInUser?.loggedInUser?.uid;
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

    const handleEditToggle = () => {
        setNameInput(displayName);
        setEditingStatus(true);
    }

    const fetchReviewWithId = async (id) => {
        try {
            const submissionRef = doc(db, 'globalSubmissions', id);
            const submissionDoc = await getDoc(submissionRef);
    
            if (submissionDoc.exists()) {
                const submissionData = submissionDoc.data();
                setPostList((currentPosts) => [...currentPosts, { ...submissionData, id }]);
            } else {
                console.log(`No submission found with ID ${id}`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching submission:", error);
            return null;
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

    const handleAddTag = () => {
        setTags([...tags, tagInput]);
        setTagInput('');
    };

    const handleDeleteTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
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

    const uploadImageAsync = async (uri: string) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const imageRef = ref(storage, `profileImages/${loggedInUser?.uid}`);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            Toast.show({
                type: 'error',
                text1: 'Image Upload Failed',
                text2: 'Failed to upload your profile image. Please try again later.',
            });
            return null;
        }
    };

    const handleSaveProfile = async () => {
        try {
            const userId = loggedInUser.loggedInUser.uid;
    
            if (!userId) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'No user is currently logged in.'
                });
                return;
            }

            if (!nameInput) {
                Toast.show({
                    type: 'error',
                    text1: 'Display Name Missing',
                });
                return;
            }
    
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('id', '==', userId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'user not found.'
                });
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userDocRef = userDoc.ref;

            let imageURL = null;
            if (profileImage) {
                imageURL = await uploadImageAsync(profileImage);
            }
    
            let updates;
    
            if (imageURL) {
                updates = {
                    displayName: nameInput,
                    tags: tags,
                    profileImage: imageURL,
                };
            } else {
                updates = {
                    displayName: nameInput,
                    tags: tags,
                };
            }
    
            await updateDoc(userDocRef, updates);
    
            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile has been updated successfully!'
            });
    
        } catch (e) {
            console.error('Error updating profile:', e);
            Toast.show({
                type: 'error',
                text1: 'Update Failed',
                text2: 'There was an error updating your profile. Please try again later.'
            });
        } finally {
            setEditingStatus(false);
        }
    };

    return (
        <View style={styles.container}>
            {displayName ? (
                <View style={styles.profileBox}>
                    <View style={styles.profileLeft}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require('../assets/profile.jpeg')}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={asyncSignOut}>
                        <Text>Sign Out</Text>
                    </TouchableOpacity>
                    </View>
                    <View>
                        {editingStatus ? (
                            <View style={styles.editingContainer}>
                                <TextInput
                                    style={styles.inputName}
                                    value={nameInput}
                                    onChangeText={setNameInput}
                                    placeholder="Enter your display name"
                                />
                                <View style={styles.tagList}>
                                {tags.map((tag, i) => (
                                    <View style={styles.tagWithDelete} key={i}>
                                        <Text>{tag}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteTag(i)}>
                                            <Text style={styles.tagDeleteButton}>x</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                        </View>
                                <View style={styles.tagContainer}>
                                    <TextInput 
                                        style={styles.tagInput}
                                        value={tagInput}
                                        onChangeText={setTagInput}
                                    />
                                    <TouchableOpacity onPress={handleAddTag} style={styles.editProfileButton}>
                                        <Text>Add Tag</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.saveCancelContainer}>
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                                        <Text>Save</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingStatus(false)}>
                                        <Text>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.displayContainer}>
                                <Text style={styles.displayName}>{displayName}</Text>
                                <View style={styles.tagList}>
                            {tags.map((tag, i) => (
                                <View style={styles.tagWithDelete} key={i}>
                                    <Text>{tag}</Text>
                                    <TouchableOpacity onPress={() => handleDeleteTag(i)}>
                                        <Text style={styles.tagDeleteButton}>x</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
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
                        <TouchableOpacity onPress={() => {navigation.navigate('SignUp')}} style={styles.createAccountButton}>
                            <Text style={styles.createAccountText}>Create an account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <View style={styles.profileToggle}>
                <TouchableOpacity style={[styles.profileToggleButton, postHistory && styles.activeButton]} onPress={() => setPostHistory(true)}>
                    <Text>My Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.profileToggleButton, !postHistory && styles.activeButton]} onPress={() => setPostHistory(false)}>
                    <Text>Favorites</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.postHistoryScroll}>
    {loggedInUser && (loading ? (
        <Text>Loading...</Text>
    ) : (
        postHistory ?
        (postList.length == 0 ?
        <View style={styles.noReview}>
            <Text>You haven't posted a review yet!</Text>
        </View>
        : postList.map((submission, i) => {
            if (submission.isReview) {
                console.log(submission)
                return (
                    <Review
                        key={`review_${i}`} 
                        reviewId={submission.reviewId}
                        foodName={submission.foodName} 
                        comment={submission.comment}
                        health={submission.health}
                        taste={submission.taste}
                        likes={submission.likes}
                        location={submission.location}
                        price={submission.price}
                        tags={submission.tags}
                        timestamp={submission.timestamp}
                        userId={submission.userId}
                        image={submission.image}
                        subcomment={submission.subComment}
                        allergens={submission.allergens}
                    />
                );
            } else {
                return (
                    <Post 
                        key={`post_${i}`}
                        postId={submission.postId}
                        comment={submission.comment}
                        timestamp={submission.timestamp}
                        uploadCount={submission.uploadCount}
                        userId={submission.userId}
                    />
                );
            }
        })
    ) :
    <View>
        <Text>favorites</Text>
    </View>))}
            </ScrollView>
            <Navbar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundGray,
        flexDirection: 'column'
    },
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 90,
        marginBottom: 20,
        marginLeft: 40,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 5,
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
    },
    saveButton: {
        backgroundColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
    },
    cancelButton: {
        backgroundColor: 'gray',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 5,
    },
    saveCancelContainer: {
        flexDirection: 'row-reverse',
        marginTop: 10,
    },
    profileButtonContainer: {
        flexDirection: 'row',
        marginTop: 10
    },
    tagInputContainer: {
        marginTop: 10,
        width: '100%',
    },
    tagInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: 140,
        paddingVertical: 3,
        marginRight: 5,
        marginBottom: 5
    },
    inputName: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 10,
        width: '60%',
    },
    displayContainer: {
        flexDirection: 'column',
        marginBottom: 10,
        marginLeft: 20,
    },
    editingContainer: {
        marginBottom: 10
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10
    },
    tagContainer: {
        flexDirection: 'row',
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
        marginRight: 5,
        marginBottom: 5
    }, 
    tagDeleteButton: {
        marginLeft: 5
    },
    profileToggle: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center'
    },
    profileToggleButton: {
        paddingLeft: 55,
        paddingRight: 55,
        paddingTop: 7,
        paddingBottom: 7,
        backgroundColor: '#d9d9d9',
    },
    activeButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.grayStroke, 
    },
    guestProfileButtonContainer: {
        flexDirection: 'column',
    },
    createAccountButton: {
        backgroundColor: colors.orangeHighlight,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
    },
    createAccountText: {
        color: 'white',
    },
    postHistoryScroll: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    profileLeft: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noReview: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
    }
});

export default Profile;