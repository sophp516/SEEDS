import React, { useEffect, useState, memo } from "react";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import { useAuth } from "../context/authContext.js";
import { View, Text, Image, StyleSheet, TextInput } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../styles.js";
import Preferences from "../services/Preferences.json";
import TimeDisplay from "./TimeDisplay.tsx";

interface Comment {
    id: string;
    content: string;
    userId: string;
    postedUnder: string;
    likes: string[];
    subComments: string[];
}

interface SubCommentProps {
    content: string;
    userId: string;
    commentId: string;
    reviewId: string;
    sublikes: string[]
}

const Review = ({ reviewId, subcomment, image, foodName, comment, health, taste, likes: initialLikes, location, price, tags, timestamp, userId, allergens }) => {
    const [usersCache, setUsersCache] = useState({});
    const [userInfo, setUserInfo] = useState(null);
    const [commentToggle, setCommentToggle] = useState(false);
    const [likeStatus, setLikeStatus] = useState(false);
    const [likes, setLikes] = useState(initialLikes || []);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const { user } = useAuth();
    const { loggedInUser } = user;
    const [commentTarget, setCommentTarget] = useState(reviewId);
    const [uploadTime, setUploadTime] = useState('');

    useEffect(() => {
        // time are store as nano seconds 
        const currTime = new Date();
        const timeDifference = currTime.getTime() -timestamp.toDate().getTime();
        const minutes = Math.floor(timeDifference / 60000);
        const hours = Math.floor(timeDifference / 3600000);
        const days = Math.floor(timeDifference / 86400000);
        const weeks = Math.floor(timeDifference / (86400000 * 7));
        if (minutes < 60) {
            setUploadTime(`${minutes} minutes ago`);
        } else if (hours < 24) {
            setUploadTime(`${hours} hours ago`);
        } else if (days < 7) {
            setUploadTime(`${days} days ago`);
        } else if (weeks < 4) {
            setUploadTime(`${weeks} weeks ago`);
        }else{ // just show the actual time 
            setUploadTime(timestamp.toDate().toString());
        }
    }, [])

    const SubComment: React.FC<SubCommentProps> = memo(({ content, userId, commentId, reviewId, sublikes }) => {
        const commentUser = usersCache[userId];
        const [subLikes, setSubLikes] = useState(sublikes || []);
        const [isLiked, setIsLiked] = useState(false);
    
        useEffect(() => {
            if (loggedInUser && sublikes) {
                setIsLiked(sublikes.includes(loggedInUser.loggedInUser.uid));
            }
        }, [sublikes, loggedInUser]);
    
        const handleSubLike = async () => {
            if (!loggedInUser) return;
    
            try {
                const userId = loggedInUser.loggedInUser.uid;
                const commentRef = doc(db, 'comments', commentId);
                const commentDoc = await getDoc(commentRef);

                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef)
    
                if (commentDoc.exists() && userDoc.exists()) {
                    const commentData = commentDoc.data();
                    const userData = userDoc.data();
                    let commentLikes = commentData.likes || [];
                    let userLikes = userData.likes || []
    
                    if (commentLikes.includes(userId)) {
                        commentLikes = commentLikes.filter(id => id !== userId);
                        userLikes = userLikes.filter(id => id !=- reviewId);
                        setIsLiked(false);
                    } else {
                        commentLikes.push(userId);
                        userLikes.push(reviewId);
                        setIsLiked(true);
                    }
    
                    setSubLikes(commentLikes);
                    await updateDoc(userRef, { likes: userLikes });
                    await updateDoc(commentRef, { likes: commentLikes });
                }
            } catch (err) {
                console.error('Error updating like status:', err);
            }
        };
    
        return (
            <View style={styles.subCommentMain}>
                <View style={styles.subCommentUser}>
                    <Image 
                    style={styles.subCommentProfile}
                    source={commentUser?.profileImage ? { uri: commentUser.profileImage } : require('../assets/profile.jpeg')}
                    />
                    <Text style={styles.subCommentName}>{commentUser?.displayName}</Text>
                </View>
                <View style={styles.subCommentContainer}>
                    <Text style={styles.subCommentContent}>{content}</Text>
                </View>
                <View style={styles.subreviewBottom}>
                    <TouchableOpacity onPress={handleSubLike} style={styles.sublikeRow}>
                        {isLiked ? <Image style={styles.subicon2} source={require('../assets/fullHeart.png')} /> : <Image style={styles.subicon2} source={require('../assets/emptyHeart.png')} />}
                        <Text style={styles.sublikeNumber}>{subLikes.length}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    });

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
                setLoading(false);
            }
        };

        fetchUserData();
    }, [reviewId, userId]);

    useEffect(() => {
        const fetchComments = async () => {
            const commentsRef = collection(db, 'comments');
            const q = query(commentsRef, where('postedUnder', '==', reviewId));
            const querySnapshot = await getDocs(q);

            const loadedComments: Comment[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            setComments(loadedComments);
        };

        fetchComments();
    }, [reviewId]);

    useEffect(() => {
        const fetchAllUserData = async () => {
            const userIds = new Set([userId, ...comments.map(comment => comment.userId)]);
            const newCache = { ...usersCache };
            
            for (const id of userIds) {
                if (!newCache[id]) {
                    try {
                        const usersRef = collection(db, 'users');
                        const q = query(usersRef, where('id', '==', id));
                        const querySnapshot = await getDocs(q);
        
                        if (!querySnapshot.empty) {
                            const userDoc = querySnapshot.docs[0];
                            const userData = userDoc.data();
                            newCache[id] = userData;
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
            
            setUsersCache(newCache);
        };

        fetchAllUserData();
    }, [comments]);

    useEffect(() => {
        if (!loggedInUser) return;
        const fetchLikeData = async () => {
            try {
                const reviewRef = doc(db, 'globalSubmissions', reviewId);
                const reviewDoc = await getDoc(reviewRef);

                if (reviewDoc.exists()) {
                    const reviewData = reviewDoc.data();
                    const likeData = reviewData.likes || [];

                    setLikeStatus(likeData.includes(loggedInUser.loggedInUser.uid));
                    setLikes(likeData);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchLikeData();
    }, [loggedInUser, reviewId]);

    const handleLike = async () => {
        if (!loggedInUser) return;

        try {
            const userId = loggedInUser.loggedInUser.uid;
            const reviewRef = doc(db, 'globalSubmissions', reviewId);
            const reviewDoc = await getDoc(reviewRef);

            if (reviewDoc.exists()) {
                const reviewData = reviewDoc.data();
                let reviewLikes = reviewData.likes || [];

                if (reviewLikes.includes(userId)) {
                    reviewLikes = reviewLikes.filter(id => id !== userId);
                    setLikeStatus(false);
                } else {
                    reviewLikes.push(userId);
                    setLikeStatus(true);
                }

                setLikes(reviewLikes);
                await updateDoc(reviewRef, { likes: reviewLikes });
            }
        } catch (err) {
            console.error('Error updating like status:', err);
        }
    };

    const getTagStyle = (tag) => {
        if (["Breakfast", "Lunch", "Dinner"].includes(tag)) {
            return styles.tagYellow;
        } else if (Preferences.id.includes(tag)) {
            return styles.tagGreen;
        }
        return styles.tagGray;
    };

    const getAllergenStyle = (allergen) => {
        return Preferences.id.includes(allergen) ? styles.tagRed : styles.tagGray;
    };

    const asyncSubmitComment = async () => {
        if (!loggedInUser) return;
    
        const commentCollectionRef = collection(db, 'comments');
    
        let time = new Date().getTime();
        let date = new Date(time);
        const timestamp = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
        
        // Add the new comment and get its document reference
        const newCommentRef = await addDoc(commentCollectionRef, {
            content: commentInput,
            timestamp,
            userId: loggedInUser.loggedInUser.uid,
            postedUnder: commentTarget, // This can be reviewId or parent comment ID
            likes: [],
            subComments: []
        });
    
        // Get the new comment's document ID
        const docId = newCommentRef.id;
    
        // Update the new comment with the document ID
        await updateDoc(newCommentRef, { commentId: docId });
    
        // Determine the parent document reference (could be a review or a parent comment)
        const parentDocRef = doc(db, 'globalSubmissions', reviewId); // If commentTarget is a review
        // If commentTarget is a comment, you would use:
        // const parentDocRef = doc(db, 'comments', commentTarget);
    
        // Fetch the parent document to get the current subComments array
        const parentDoc = await getDoc(parentDocRef);
        if (parentDoc.exists()) {
            const parentData = parentDoc.data();
            const subComments = parentData.subComments || [];
    
            // Update the subComments array to include the new comment ID
            await updateDoc(parentDocRef, {
                subComments: [...subComments, docId]
            });

            // Update the comments state to include the new comment
            setComments([...comments, { id: docId, content: commentInput, userId: loggedInUser.loggedInUser.uid, postedUnder: commentTarget, likes: [], subComments: [] }]);
            setCommentInput(''); // Clear the input field
        } else {
            console.error('Parent document not found');
        }
    
        console.log(docId);
    };

    return (
        <View style={styles.reviewContainer}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10 }} />
                    <Text>Loading...</Text>
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
                            <TimeDisplay isMenu={false} timestamp={timestamp} textStyle={styles.timestampText}/>
                        </View>
                    )}
                    <View style={styles.reviewHeader}>
                        <Text style={styles.reviewFoodName}>{foodName}</Text>
                    </View>
                    <View style={styles.tagContainer}>
                        {tags?.length > 0 && tags.map((tag, i) => (
                            <View style={[styles.tagBox, getTagStyle(tag)]} key={i}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.tagContainer}>
                        {allergens?.length > 0 && allergens.map((allergen, i) => (
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
                        <TouchableOpacity style={styles.commentRow} onPress={() => setCommentToggle(!commentToggle)}>
                            <Image style={styles.icon} source={require('../assets/comment.png')} />
                            <Text style={styles.likeNumber}>{comments.length || 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLike} style={styles.likeRow}>
                            {likeStatus ? <Image style={styles.icon} source={require('../assets/fullHeart.png')} /> : <Image style={styles.icon} source={require('../assets/emptyHeart.png')} />}
                            <Text style={styles.likeNumber}>{likes.length}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {commentToggle &&
            <View style={styles.commentContainer}>
                <View>
                {comments.length > 0 &&
                comments.map((comment: Comment, i) => {
                    return <SubComment
                            key={i}
                            content={comment.content}
                            userId={comment.userId}
                            commentId={comment.id}
                            reviewId={reviewId}
                            sublikes={comment.likes}
                            />
                })}
            </View>
                <View style={styles.commentInputRow}>
                    <TextInput 
                    placeholder="Add a comment"
                    style={styles.textInput}
                    value={commentInput}
                    onChangeText={(text) => setCommentInput(text)} 
                    />
                    <TouchableOpacity style={styles.replyButton} onPress={asyncSubmitComment}>
                        <Text>reply</Text>
                    </TouchableOpacity>
                </View>
            </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center',
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
        paddingBottom: 10,
        marginBottom: 10,
    },
    userInfoText: {
        fontSize: 13,
    },
    timestampText:{
        color: '#7C7C7C',               
        fontFamily: 'Manrope',           
        fontSize: 10,                    
        fontStyle: 'normal',           
        fontWeight: '400',              
        // lineHeight: 14,                
        alignContent: 'center',
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
    subreviewBottom: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
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
        alignItems: 'center'
    },
    imageContainer: {
        flexDirection: 'row',
    },
    likeText: {
        marginLeft: 3,
    },
    likeNumber: {
        marginLeft: 4
    },
    sublikeNumber: {
        marginLeft: 5
    },
    icon: {
        width: 18,
        height: 16,
    },
    subicon: {
        width: 12,
        height: 12,
        marginLeft: 12,
    },
    subicon2: {
        width: 12,
        height: 10,
    },
    commentRow: {
        flexDirection: 'row'
    },
    subcommentRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    sublikeRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    commentContainer: {
        backgroundColor: colors.inputGray,
        marginTop: 8,
        paddingTop: 20,
        paddingBottom: 8,
        paddingHorizontal: 6,
    },
    textInput: {
        backgroundColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 3,
        width: '85%',
        borderRadius: 5
    },
    commentInputRow: {
        flexDirection: 'row',
    },
    replyButton: {
        width: 50,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    subCommentProfile: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    subCommentUser: {
        flexDirection: 'row'
    },
    subCommentName: {
        marginLeft: 5,
        fontSize: 13,
    },
    subCommentContent: {
        fontSize: 13
    },
    subCommentContainer: {
        paddingTop: 3,
    },
    subCommentMain: {
        paddingHorizontal: 3,
        paddingBottom: 15,
    }
});

export default Review;