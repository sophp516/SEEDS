import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import Toast from 'react-native-toast-message';
import Post from '../components/Post.tsx';
import Review from '../components/Review.tsx';
import Navbar from '../components/Navbar.jsx';

type RootStackParamList = {
  Profile: undefined;
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
  allergens?: string[];
  uploadCount?: number;
}

const MyActivity = () => {
  const { user, setLoggedInUser } = useAuth();
  const { loggedInUser, displayName } = user;
  const [nameInput, setNameInput] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [postHistory, setPostHistory] = useState(true); // state for toggling between My Posts and Favorites
  const [postList, setPostList] = useState<Submission[]>([]);
  const [postIds, setPostIds] = useState<string[]>([]);
  const [favoriteList, setFavoriteList] = useState<Submission[]>([]);
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
    if (!loggedInUser) return;
    const fetchHistory = async () => {
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
          setPostIds(userData.submissions || []);
        }

      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    if (loggedInUser) {
      fetchHistory();
    }
  }, [loggedInUser]);

  useEffect(() => {
    const fetchReviewWithId = async (id: string) => {
      try {
        const submissionRef = doc(db, 'globalSubmissions', id);
        const submissionDoc = await getDoc(submissionRef);

        if (submissionDoc.exists()) {
          const submissionData = submissionDoc.data() as Submission;
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

  return (
    <View style={styles.container}>
      <View style={styles.homeHeaderTop}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.text}>My Activity</Text>

      {/* Toggle buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, postHistory && styles.activeButton]}
          onPress={() => setPostHistory(true)}>
          <Text>My Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !postHistory && styles.activeButton]}
          onPress={() => setPostHistory(false)}>
          <Text>Favorites</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.postHistoryScroll}>
        {loggedInUser && (loading ? (
          <Text>Loading...</Text>
        ) : (
          postHistory ? 
            (postList.length === 0 ? (
              <View style={styles.noReview}>
                <Text style={styles.noReviewText}>You haven't posted anything yet!</Text>
              </View>
            ) : (
              postList.map((submission, i) => (
                <View key={`submission_${i}`}>
                  {submission.isReview ? (
                    <Review
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
                  ) : (
                    <Post
                      postId={submission.postId}
                      comment={submission.comment}
                      timestamp={submission.timestamp}
                      uploadCount={submission.uploadCount}
                      userId={submission.userId}
                      image={submission.image}
                    />
                  )}
                </View>
              ))
            )
          ) : favoriteList.length === 0 ? (
            <View style={styles.noReview}>
              <Text style={styles.noReviewText}>You have no favorite posts yet!</Text>
            </View>
          ) : (
            favoriteList.map((submission, i) => (
              <View key={`submission_${i}`}>
                {submission.isReview ? (
                  <Review
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
                ) : (
                  <Post
                    postId={submission.postId}
                    comment={submission.comment}
                    timestamp={submission.timestamp}
                    uploadCount={submission.uploadCount}
                    userId={submission.userId}
                    image={submission.image}
                  />
                )}
              </View>
            ))
          )
        ))}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Ensure background color is set
  },
  text: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 10,
  },
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20, // Move the header down
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#d9d9d9',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
  },
  postHistoryScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  noReview: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  noReviewText: {
    fontSize: 12,
    color: 'gray',
  }
});

export default MyActivity;
