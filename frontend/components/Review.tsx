import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import { useAuth } from "../context/authContext.js";
import { View, Text, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const Review = (props) => {

    const { postId, userId, image, foodName, comment, health, taste, tags, likes, createdAt, subComment } = props;
    const [ userInfo, setUserInfo ] = useState(null);
    const [ commentToggle, setCommentToggle ] = useState(false);
    const [ likeStatus, setLikeStatus ] = useState(false);
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('id', '==', userId));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const userDoc = querySnapshot.docs[0];
                        const userData = userDoc.data();
                        setUserInfo(userData) 
                    }
            } catch (err) {
                console.log(err)
            }
        }
        fetchUserData();
    }, [])

    useEffect(() => {
        if (!loggedInUser) return;

        const fetchLikeStatus = async () => {
            try {
                const reviewRef = collection(db, 'reviews');
                const q = query(reviewRef, where('postId', '==', postId));
                const querySnapshot = await getDocs(q);

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.likes && data.likes.includes(loggedInUser?.loggedInUser?.uid)) {
                        setLikeStatus(true);
                    }
                });
            } catch (error) {
                console.error('Error fetching like status:', error);
            }
        };

        fetchLikeStatus();
    }, []);

    const handleLike = async () => {
        try {
            // Fetch the user document
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('id', '==', loggedInUser?.loggedInUser?.uid));
            const userSnapshot = await getDocs(userQuery);
    
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                const userDocRef = doc(db, 'users', userDoc.id);
    
                // Fetch the review document
                const reviewsRef = collection(db, 'reviews');
                const reviewQuery = query(reviewsRef, where('postId', '==', postId));
                const reviewSnapshot = await getDocs(reviewQuery);
    
                if (!reviewSnapshot.empty) {
                    const reviewDoc = reviewSnapshot.docs[0];
                    const reviewDocRef = doc(db, 'reviews', reviewDoc.id);
    
                    if (likeStatus) {
                        // Remove postId from user's likes array and loggedInUser.uid from review's likes array
                        await updateDoc(userDocRef, {
                            likes: arrayRemove(postId)
                        });
    
                        await updateDoc(reviewDocRef, {
                            likes: arrayRemove(loggedInUser.uid)
                        });
    
                        setLikeStatus(false);
                    } else {
                        // Add postId to user's likes array and loggedInUser.uid to review's likes array
                        await updateDoc(userDocRef, {
                            likes: arrayUnion(postId)
                        });
    
                        await updateDoc(reviewDocRef, {
                            likes: arrayUnion(loggedInUser.uid)
                        });
    
                        setLikeStatus(true);
                    }
                }
            }
        } catch (err) {
            console.error('Error updating like status:', err);
        }
    };

    return (
        <View>
            <View>
                {userInfo &&
                <View>
                    <Image
                        source={userInfo.image ? userInfo.image  : require('../assets/profile.jpeg')}
                    />
                    <Text>{userInfo.displayName}</Text>
                    <Text>{createdAt}</Text>
                </View>}
                {tags.map((tag, i) => {
                    return (
                        <View>
                            <Text>{tag}</Text>
                        </View>
                    )
                })}
                <View>
                    <Text>{comment}</Text>
                    <Text>Taste: {taste}/5</Text>
                    <Text>Health: {health}/5</Text>
                </View>
                <View>
                {image?.map((item, i) => {
                    <View key={i}>
                        <Image source={item} />
                    </View>
                })}
                </View>
                <View>
                    <TouchableOpacity onPress={() => setCommentToggle(!commentToggle)}>
                        <Text>comment</Text>
                        <Text>{subComment.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLike}>
                        {likeStatus ? <Text>liked</Text> : <Text>like</Text>}
                        <Text>{likes.length}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default Review;
