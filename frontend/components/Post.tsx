import React, { useEffect, useState, memo } from "react";
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import { useAuth } from "../context/authContext.js";
import { View, Text, Image, StyleSheet, TextInput } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import colors from "../styles.js";
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
    postId: string;
    sublikes: string[];
}

const Post = ({ postId, comment, userId, timestamp, uploadCount, image}) => {
    const [usersCache, setUsersCache] = useState({});
    const [post, setPost] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [commentToggle, setCommentToggle] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [likeStatus, setLikeStatus] = useState(false);
    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState("");
    const { user } = useAuth();
    const { loggedInUser } = user;


    const SubComment: React.FC<SubCommentProps> = memo(({ content, userId, commentId, postId, sublikes }) => {
        const commentUser = usersCache[userId];
        const [subLikes, setSubLikes] = useState(sublikes || []);
        const [isLiked, setIsLiked] = useState(false);
    
        useEffect(() => {
            if (user.id && sublikes) {
                setIsLiked(sublikes.includes(user.id));
            }
        }, [sublikes, loggedInUser]);
    
        const handleSubLike = async () => {
            if (!user.id) return;
    
            try {
                const userId = user.id;
                const commentRef = doc(db, 'comments', commentId);
                const commentDoc = await getDoc(commentRef);

                const userRef = doc(db, 'users', userId)
                const userDoc = await getDoc(userRef)
    
                if (commentDoc.exists() && userDoc.exists()) {
                    const commentData = commentDoc.data();
                    const userData = userDoc.data();
                    let commentLikes = commentData.likes || [];
                    let userLikes = userData.likes || [];
    
                    if (commentLikes.includes(userId)) {
                        commentLikes = commentLikes.filter(id => id !== userId);
                        userLikes = userLikes.filter(id => id !== postId);
                        setIsLiked(false);
                    } else {
                        commentLikes.push(userId);
                        userLikes.push(postId);
                        setIsLiked(true);
                    }
    
                    setSubLikes(commentLikes);
                    await updateDoc(commentRef, { likes: commentLikes });
                    await updateDoc(userRef, { likes: userLikes });
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
        if (!loggedInUser) return;
        const fetchPostData = async () => {
            try {
                const postRef = doc(db, 'posts', postId);
                const postDoc = await getDoc(postRef);

                if (postDoc.exists()) {
                    const postData = postDoc.data();
                    setPost(postData);
                    setLikes(postData.likes || []);
                    setLikeStatus(postData.likes?.includes(user.id) || false);
                }
            } catch (err) {
                console.log(err);
            }
        };

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, 'users', userId);
                const userDocSnapshot = await getDoc(userDocRef);

                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setUserInfo(userData);
                } else {
                    console.log("No such document!");
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
        fetchUserData();
    }, [postId, userId, loggedInUser]);

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
        const fetchComments = async () => {
            const commentsRef = collection(db, 'comments');
            const q = query(commentsRef, where('postedUnder', '==', postId));
            const querySnapshot = await getDocs(q);

            const loadedComments: Comment[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            setComments(loadedComments);
        };

        fetchComments();
    }, [postId]);

    const handleLike = async () => {
        if (!user.id) return;

        try {
            const userId = user.id;
            const postRef = doc(db, 'globalSubmissions', postId);
            
            
            if (likeStatus) {
                await updateDoc(postRef, {
                    likes: arrayRemove(userId)
                });
                setLikes(likes.filter(id => id !== userId));
                setLikeStatus(false);
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(userId)
                });
                setLikes([...likes, userId]);
                setLikeStatus(true);
            }
        } catch (err) {
            console.error('Error updating like status:', err);
        }
    };

    const asyncSubmitComment = async () => {
        if (!loggedInUser || !commentInput.trim()) return;

        const commentCollectionRef = collection(db, 'comments');

        let time = new Date().getTime();
        let date = new Date(time);
        const timestamp = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
        
        try {
            const newCommentRef = await addDoc(commentCollectionRef, {
                content: commentInput,
                timestamp,
                userId: user.id,
                postedUnder: postId,
                likes: [],
                subComments: []
            });

            const docId = newCommentRef.id;
            await updateDoc(newCommentRef, { commentId: docId });

            setComments([...comments, { 
                id: docId, 
                content: commentInput, 
                userId: user.id, 
                postedUnder: postId, 
                likes: [], 
                subComments: [] 
            }]);
            setCommentInput('');

            // Update the post's subComment count
            const postRef = doc(db, 'globalSubmissions', postId);
            await updateDoc(postRef, {
                subComment: arrayUnion(docId)
            });
        } catch (err) {
            console.error('Error adding comment:', err);
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
                            <TimeDisplay isMenu={false} timestamp={timestamp}  textStyle={styles.timestampText}/>
                        </View>
                    )}
                    <View style={styles.reviewContent}>
                        <Text style={styles.reviewComment}>{comment}</Text>
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
                            <Text style={styles.likeNumber}>{comments.length}</Text>
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
                                postId={postId}
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
};

const styles =  StyleSheet.create({
    profileBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    replyButton: {
        width: 50,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    commentInputRow: {
        flexDirection: 'row',
    },
    textInput: {
        backgroundColor: 'white',
        paddingVertical: 4,
        paddingHorizontal: 3,
        width: '85%',
        borderRadius: 5
    },
    icon: {
        width: 18,
        height: 16,
    },
    likeNumber: {
        marginLeft: 4
    },
    loadingContainer: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    reviewContainer: {
        borderBottomWidth: 1,
        width: '100%',
        borderColor: colors.grayStroke,
        paddingBottom: 10,
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
        marginLeft: 15,
    },
    commentRow: {
        paddingLeft: 20,
        flexDirection: 'row',
    },
    imageContainer: {
        flexDirection: 'row',
    },
    commentContainer: {
        backgroundColor: colors.inputGray,
        marginTop: 8,
        paddingTop: 20,
        paddingBottom: 8,
        paddingHorizontal: 6,
    },
    likeText: {
        marginLeft: 3,
    },
    subreviewBottom: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    sublikeNumber: {
        marginLeft: 5
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
    subcommentRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    sublikeRow: {
        flexDirection: 'row',
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
})

export default Post;
