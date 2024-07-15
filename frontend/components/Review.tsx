import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import { useAuth } from "../context/authContext.js";
import { View, Text, Image, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../styles.js";

const Review = ({ reviewId, subcomment, image, foodName, comment, health, taste, likes, location, price, tags, timestamp, userId }) => {

    const [userInfo, setUserInfo] = useState(null);
    const [commentToggle, setCommentToggle] = useState(false);
    const [likeStatus, setLikeStatus] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { loggedInUser } = user;

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
    }, []);

    const handleLike = async () => {
        if (!loggedInUser) return;

        try {
            // Fetch the user document
            const usersRef = collection(db, 'users');
            const userQuery = query(usersRef, where('id', '==', loggedInUser?.loggedInUser.uid));
            const userSnapshot = await getDocs(userQuery);

        
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
                    <Text style={styles.reviewFoodName}>{foodName}</Text>
                </View>
                <View style={styles.tagContainer}>
                {tags?.length > 0 && tags?.map((tag, i) => (
                    <View style={styles.tagBox} key={i}>
                        <Text style={styles.tagText}>{tag}</Text>
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
                        <Text>comment</Text>
                        <Text>{subcomment?.length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLike} style={styles.likeRow}>
                        <Text>{likes?.length}</Text>
                        {likeStatus ? <Text style={styles.likeText}>liked</Text> : <Text style={styles.likeText}>like</Text>}
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
        marginHorizontal: 15,
    },
    imageContainer: {
        flexDirection: 'row',
    },
    likeText: {
        marginLeft: 3,
    }
})

export default Review;
