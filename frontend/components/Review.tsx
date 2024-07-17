import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import { useAuth } from "../context/authContext.js";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../styles.js";
import Preferences from "../services/Preferences.json";

const Review = ({ reviewId, subcomment, image, foodName, comment, health, taste, likes, location, price, tags, timestamp, userId, allergens }) => {

    const [userInfo, setUserInfo] = useState(null);
    const [commentToggle, setCommentToggle] = useState(false);
    const [likeStatus, setLikeStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { loggedInUser } = user;
    console.log("likes", likes)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('id', '==', userId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    setUserInfo(userData);

                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false)
            }
        };

        fetchUserData();
    }, [reviewId, userId]);

    useEffect(() => {
        if (!loggedInUser) return
        const fetchLikeData = async () => {
            try {
                const usersRef = collection(db, 'globalSubmissions');
                const q = query(usersRef, where('id', '==', reviewId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const reviewDoc = querySnapshot.docs[0];
                    const reviewData = reviewDoc.data();
                    
                    const likeData = reviewData.likes || [];

                    if (likeData.includes(loggedInUser.loggedInUser.uid)) {
                        setLikeStatus(true) 
                    } else {
                        setLikeStatus(false)
                    }

                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false)
            }
        };

        fetchLikeData();
    }, []);

    const handleLike = async () => {
        if (!loggedInUser) return;
    
        try {
            // Fetch the user document
            const userId = loggedInUser.loggedInUser.uid;
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('id', '==', userId));
            const userSnapshot = await getDocs(userQuery);
    
            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                const userData = userDoc.data();
                const userLikes = userData.likes || []; // Ensure userLikes is an array
    
                // Fetch the review document
                const reviewRef = doc(db, 'globalSubmissions', reviewId);
                const reviewDoc = await getDoc(reviewRef);
    
                if (reviewDoc.exists()) {
                    const reviewData = reviewDoc.data();
                    const reviewLikes = reviewData.likes || []; // Ensure reviewLikes is an array
    
                    if (userLikes.includes(reviewId)) {
                        // Unlike the review
                        const newUserLikes = userLikes.filter(id => id !== reviewId);
                        const newReviewLikes = reviewLikes.filter(id => id !== userId);
    
                        await updateDoc(userDoc.ref, { likes: newUserLikes });
                        await updateDoc(reviewRef, { likes: newReviewLikes });
                        setLikeStatus(false); // Set local like status to false
                    } else {
                        // Like the review
                        const newUserLikes = [...userLikes, reviewId];
                        const newReviewLikes = [...reviewLikes, userId];
    
                        await updateDoc(userDoc.ref, { likes: newUserLikes });
                        await updateDoc(reviewRef, { likes: newReviewLikes });
                        setLikeStatus(true); // Set local like status to true
                    }
                }
            } else {
                // Handle case where the user document does not exist
                console.error('User document not found');
            }
        } catch (err) {
            console.error('Error updating like status:', err);
        }
    };

    const getTagStyle = (tag) => {
        if(["Breakfast", "Lunch", "Dinner"].includes(tag)) {
            return styles.tagYellow;
        }else if (Preferences.id.includes(tag)) {
            return styles.tagGreen;
        }
        return styles.tagGray;
    };

    const getAllergenStyle = (allergen) => {
        return Preferences.id.includes(allergen) ? styles.tagRed : styles.tagGray;
    };

    return (
        <View style={styles.reviewContainer}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>loading...</Text>
                </View>
            ) : (
                <View>
                {userInfo && (
                    <View style={styles.profileBox}>
                        <Image
                            source={userInfo.image ? { uri: userInfo.image } : require('../assets/profile.jpeg')}
                            style={{ width: 30, height: 30, borderRadius: 25, marginRight: 10 }}
                        />
                        <Text style={styles.userInfoText}>{userInfo.displayName}</Text>
                    </View>
                )}
                <View style={styles.reviewHeader}>
                    <Text style={styles.reviewFoodName}>{foodName}</Text>
                </View>
                <View style={styles.tagContainer}>
                {tags?.length > 0 && tags?.map((tag, i) => (
                    <View style={[styles.tagBox, getTagStyle(tag)]} key={i}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
                </View>
                <View style={styles.tagContainer}>
                {allergens?.length > 0 && allergens?.map((allergen, i) => (
                    <View style={[styles.allergensBox, getAllergenStyle(allergen)]} key={i}>
                        <Text style={styles.tagText}>{allergen}</Text>
                    </View>
                ))}
                </View>
                <View style={styles.reviewContent}>
                    <Text style={styles.reviewComment}>{comment}</Text>
                    <Text style={styles.taste}>Taste: {taste}/5</Text>
                    <Text style={styles.health}>Health: {health}/5</Text>
                </View>
                <View style={styles.imageContainer}>
                    {image?.map((item, i) => (
                        <View key={i}>
                            <Image source={{ uri: item }} style={{ width: 100, height: 100 }} />
                        </View>
                    ))}
                </View>
                <View style={styles.reviewBottom}>
                    <TouchableOpacity onPress={() => setCommentToggle(!commentToggle)}>
                        <Image source={require('../assets/comment.jpg')}/>
                        <Text>{subcomment?.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLike} style={styles.likeRow}>
                        <Text>{likes?.length}</Text>
                        {likeStatus ? <Image source={require('../assets/fullHeart.jpg')}/> : <Image source={require('../assets/emptyHeart.jpg')}/>}
                    </TouchableOpacity>
                </View>
            </View>
            )}
        </View>
    )
}

const styles =  StyleSheet.create({
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    loadingContainer: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reviewContainer: {
        borderBottomWidth: 1,
        borderColor: colors.grayStroke,
        marginBottom: 10,
    },
    userInfoText: {
        fontSize: 13,
    },
    reviewHeader: {
        paddingTop: 10,
    }, 
    reviewFoodName: {
        fontSize: 16,
    },
    tagContainer: {
        flexDirection: 'row',
        marginTop: 10
    },
    tagBox: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 15,
        marginRight: 5,
    },
    tagGreen: {
        backgroundColor: colors.highRating,
    },
    tagGray: {
        backgroundColor: colors.userInput,
    },
    tagRed: {
        backgroundColor: colors.warningPink,
    },
    tagYellow: {
        backgroundColor: colors.yellow,
    },
    allergensBox: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 15,
        marginRight: 5,
    },
    reviewContent: {
        marginTop: 10,
    },
    tagText: {
        fontSize: 12,
    },
    reviewComment: {
        marginBottom: 10,
        lineHeight: 20,
    },
    taste: {
        fontSize: 11,
        marginBottom: 5
    },
    health: {
        fontSize: 11,
        marginBottom: 5
    },
    reviewBottom: {
        flexDirection: 'row-reverse',
    },
    likeRow: {
        flexDirection: 'row',
        marginHorizontal: 15,
    },
    imageContainer: {
        flexDirection: 'row',
    },
    likeText: {
        marginLeft: 3,
    },

})

export default Review;
