import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import { useAuth } from "../context/authContext.js";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../styles.js";

const Review = ({ reviewId }) => {

    const [review, setReview] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [commentToggle, setCommentToggle] = useState(false);
    const [likeStatus, setLikeStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { loggedInUser } = user;

    useEffect(() => {
        const fetchReviewById = async (id) => {
            try {
                const reviewDocRef = doc(db, 'reviews', id);
                const reviewDoc = await getDoc(reviewDocRef);
                if (reviewDoc.exists()) {
                    return { id: reviewDoc.id, ...reviewDoc.data() };
                } else {
                    console.log("No such document!");
                    return null;
                }
            } catch (error) {
                console.error("Error fetching review: ", error);
                return null;
            }
        };

        const getReview = async () => {
            setLoading(true);
            const reviewData = await fetchReviewById(reviewId);
            setReview(reviewData);

            if (reviewData && loggedInUser && reviewData.likes.includes(loggedInUser?.loggedInUser.uid)) {
                setLikeStatus(true);
            }

            setLoading(false);
        };

        getReview();
    }, []);

    useEffect(() => {
        if (!review) return;

        const fetchUserData = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('id', '==', review.userId));
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
    }, [review]);

    const handleLike = async () => {
        if (!loggedInUser) return;

        try {
            // Fetch the user document
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('id', '==', loggedInUser?.loggedInUser.uid));
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userDoc = userSnapshot.docs[0];
                const userDocRef = doc(db, 'users', userDoc.id);

                // Fetch the review document
                const reviewDocRef = doc(db, 'reviews', review.id);

                if (likeStatus) {
                    // Remove postId from user's likes array and loggedInUser.uid from review's likes array
                    await updateDoc(userDocRef, {
                        likes: arrayRemove(review.id)
                    });

                    await updateDoc(reviewDocRef, {
                        likes: arrayRemove(loggedInUser?.loggedInUser.uid)
                    });

                    setLikeStatus(false);
                } else {
                    // Add postId to user's likes array and loggedInUser.uid to review's likes array
                    await updateDoc(userDocRef, {
                        likes: arrayUnion(review.id)
                    });

                    await updateDoc(reviewDocRef, {
                        likes: arrayUnion(loggedInUser?.loggedInUser.uid)
                    });

                    setLikeStatus(true);
                }
            }
        } catch (err) {
            console.error('Error updating like status:', err);
        }
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
                    <Text style={styles.reviewFoodName}>{review?.foodName}</Text>
                </View>
                <View style={styles.tagContainer}>
                {review?.tags?.map((tag, i) => (
                    <View style={styles.tagBox} key={i}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
                </View>
                <View style={styles.reviewContent}>
                    <Text style={styles.reviewComment}>{review?.comment}</Text>
                    <Text style={styles.taste}>Taste: {review?.taste}/5</Text>
                    <Text style={styles.health}>Health: {review?.health}/5</Text>
                </View>
                <View style={styles.imageContainer}>
                    {review?.image?.map((item, i) => (
                        <View key={i}>
                            <Image source={{ uri: item }} style={{ width: 100, height: 100 }} />
                        </View>
                    ))}
                </View>
                <View style={styles.reviewBottom}>
                    <TouchableOpacity onPress={() => setCommentToggle(!commentToggle)}>
                        <Text>comment</Text>
                        <Text>{review?.subComment?.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLike} style={styles.likeRow}>
                        {likeStatus ? <Text>liked</Text> : <Text>like</Text>}
                        <Text>{review?.likes?.length}</Text>
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
        backgroundColor: colors.warningPink,
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
    },
    imageContainer: {
        flexDirection: 'row',
    }
})

export default Review;
