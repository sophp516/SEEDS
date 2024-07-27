import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import Toast from 'react-native-toast-message';
import Post from '../components/Post.tsx';
import Review from '../components/Review.tsx';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';

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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteList, setFavoriteList] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  const fetchHistory = useCallback(async () => {
    if (!user.id) return;
    try {
      const userId = user.id;
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        setPostIds(userData.submissions || []);
        setFavoriteIds(userData.likes || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const fetchSubmissions = useCallback(async (ids: string[], isFavorites: boolean) => {
    try {
      const submissions = isFavorites ? favoriteList : postList;
      for (const id of ids) {
        const submissionRef = doc(db, 'globalSubmissions', id);
        const submissionDoc = await getDoc(submissionRef);

        if (submissionDoc.exists()) {
          const submissionData = submissionDoc.data() as Submission;
          setPostList(currentPosts => {
            if (!isFavorites) {
              const postExists = currentPosts.some(post => post.postId === id || post.reviewId === id);
              if (!postExists) {
                return [...currentPosts, { ...submissionData, id }];
              }
            }
            return currentPosts;
          });
          setFavoriteList(currentFavorites => {
            if (isFavorites) {
              const postExists = currentFavorites.some(post => post.postId === id || post.reviewId === id);
              if (!postExists) {
                return [...currentFavorites, { ...submissionData, id }];
              }
            }
            return currentFavorites;
          });
        } else {
          console.log(`No submission found with ID ${id}`);
        }
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  }, [favoriteList, postList]);

  useEffect(() => {
    if (postHistory) {
      setLoading(true);
      fetchSubmissions(postIds, false).finally(() => setLoading(false));
    } else {
      setLoading2(true);
      fetchSubmissions(favoriteIds, true).finally(() => setLoading2(false));
    }
  }, [postHistory, postIds, favoriteIds, fetchSubmissions]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
        <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

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
        {loading || loading2 ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          (postHistory ? postList : favoriteList).length === 0 ? (
            <View style={styles.noReview}>
              <Text style={styles.noReviewText}>
                {postHistory ? "You haven't posted anything yet!" : "You have no favorite posts yet!"}
              </Text>
            </View>
          ) : (
            (postHistory ? postList : favoriteList).map((submission, i) => (
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
        )}
      </ScrollView>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    // padding: 30,
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
  backButtonContainer: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    width: 20,
    height: 20,
    marginRight: 10, // space between icon and text
  },
  backButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.textGray,
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
    marginBottom: 75,
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
