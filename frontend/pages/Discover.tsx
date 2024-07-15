import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../services/firestore.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx'; 
import Filter from '../components/Filter.tsx'; 
import FilterContent from '../components/FilterContent.tsx'; 
import colors from '../styles.js'; 
import Review from '../components/Review.tsx';
import Post from '../components/Post.tsx';

const Discover = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]); // State to store filtered items

  // Function to toggle the bottom sheet visibility
  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  const fetchSubmissions = async () => {
    try {
      const submissionRef = collection(db, 'globalSubmissions');
      const submissionSnapshot = await getDocs(submissionRef);
      const submissions = submissionSnapshot.docs.map(doc => doc.data());
      return submissions;
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      return [];
    }
  }

  useEffect(() => {
    const loadSubmissions = async () => {
      const submissionData = await fetchSubmissions();
      setSubmissions(submissionData);
  };
  loadSubmissions();
  }, [])

  return (
    <View style={styles.outerContainer}>
      <View style={styles.containerTop}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchBarContainer}>
            <SearchBar />
          </View>
          <Filter toggleBottomSheet={toggleBottomSheet} />
        </View>
      </View>
      <ScrollView style={styles.scrollContainer}>
      {submissions.length > 0 &&
      submissions.map((submission) => {
        if (submission.isReview) {
          return <Review reviewId={submission.reviewId} />
        } else {
          return <Post 
                postId={submission.postId}
                comment={submission.comment}
                timestamp={submission.timestamp}
                uploadCount={submission.uploadCount}
                userId={submission.userId}
                />
        }
      })}
      </ScrollView>
      <Navbar />
      <FilterContent
        onFilter={setFilteredItems}
        isVisible={isBottomSheetOpen}
        setIsVisible={setIsBottomSheetOpen}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
  },
  containerTop: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  searchFilterRow: {
    justifyContent: 'flex-start',
    flex: 0,
    flexDirection: 'row',
  },
  searchBarContainer: {
    flex: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 100,
  },
  scrollContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  }
});

export default Discover;