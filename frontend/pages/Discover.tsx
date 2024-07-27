import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../services/firestore.js';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';
import Review from '../components/Review.tsx';
import Post from '../components/Post.tsx';
import AllFilter from '../components/AllFilter';
import FilterContent from '../components/FilterContent';

const Discover = () => {
  const [submissions, setSubmissions] = useState([]);
  //for filters
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [filters, setFilters] = useState({
    preferred: [],
    allergens: [],
    time: [],
    taste: 1,
    health: 1,
  });
  const [searchChange, setSearchChange] = useState('');
  const [simpleFilter, setSimpleFilter] = useState('');

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  const fetchSubmissions = async () => {
    try {
      const submissionRef = collection(db, 'globalSubmissions');
      const submissionSnapshot = await getDocs(submissionRef);
      const submissionsData = submissionSnapshot.docs.map(doc => doc.data());
      return submissionsData;
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      return [];
    }
  };

  useEffect(() => {
    const loadSubmissions = async () => {
      const submissionData = await fetchSubmissions();
      const sortedSubmissionData = submissionData.sort((a, b) => b.timestamp - a.timestamp);
      setSubmissions(sortedSubmissionData);
    };
    loadSubmissions();
  }, []);

  //filtering
  const applyFilters = (submissions) => {
    return submissions.filter(item => {
      const Comments = item.comment || '';
      const Tags = item.tags || [];
      const Allergens = item.allergens || [];
      const FoodName = item.foodName || '';
      const Location = item.location || '';
      const Taste = item.taste || 1;
      const Health = item.health || 1;

      if (!isBottomSheetOpen && searchChange !== '' && !isDisabled) {
      // Search by comment: the comment with all words in the search string will be included
      const searchWords = searchChange.trim().toLowerCase().split(/\s+/);
      const commentLowerCase = Comments.toLowerCase();
      const commentContainsAllSearchWords = searchWords.every(word => commentLowerCase.includes(word));

        return Tags.includes(searchChange) || Allergens.includes(searchChange) ||
          FoodName.includes(searchChange) || Location.includes(searchChange) || commentContainsAllSearchWords;
      }

      if (!isBottomSheetOpen && simpleFilter !== '' && !isDisabled) {
        return Tags.includes(simpleFilter) || Allergens.includes(simpleFilter);
      }

      const isPreferred = filters.preferred.length === 0 ||
        filters.preferred.every(preferred => Tags.includes(preferred) || Allergens.includes(preferred));

      const isAllergens = filters.allergens.length === 0 ||
        !filters.allergens.every(allergen => Allergens.includes(allergen) || Tags.includes(allergen));

      const isValidTime = filters.time.length === 0 ||
        filters.time.every(time => Tags.includes(time));

      const isTaste = filters.taste <= Taste;
      const isHealth = filters.health <= Health;

      return isPreferred && isAllergens && isValidTime && isTaste && isHealth;
    });
  }

  const filterApplied = filters.preferred.length > 0 || filters.allergens.length > 0 || filters.time.length > 0 || filters.taste > 1 || filters.health > 1 || searchChange !== '' || simpleFilter !== '';
  const filterSubmissions = useMemo(() => applyFilters(submissions), [filters, simpleFilter, searchChange]);
  const filterOrNone = filterApplied ? filterSubmissions : submissions;

  const handleFilterClick = () => {
    setIsDisabled(prev => !prev);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Discover</Text>
      </View>
  
      <View style={styles.filter}>
        <AllFilter
          isDisabled={isDisabled}
          toggleBottomSheet={toggleBottomSheet}
          handleFilterClick={handleFilterClick}
          resetSimpleFilter={() => setIsDisabled(false)}
          onSimpleFilterChange={setSimpleFilter}
          onSearchChange={setSearchChange}
        />
      </View>


      <ScrollView style={styles.scrollContainer}>
        {filterOrNone.length > 0 ? (
          filterOrNone.map((submission, index) => (
            submission.isReview ? (
              <Review
                key={index}
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
                image={submission.images}
                subcomment={submission.subComment}
                allergens={submission.allergens}
              />
            ) : (
              <Post
                key={index}
                postId={submission.postId}
                comment={submission.comment}
                timestamp={submission.timestamp}
                uploadCount={submission.uploadCount}
                userId={submission.userId}
                image={submission.images}
              />
            )
          ))
        ) : (
          <Text style={styles.noResult}> No results found...</Text>
        )}
      </ScrollView>
      <FilterContent
        onFilter={setFilters}
        isVisible={isBottomSheetOpen}
        setIsVisible={setIsBottomSheetOpen}
      />
      <View style={styles.bottomPadding}></View>
      <Navbar />
    </View>
  );
  
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    marginTop: 96,
    backgroundColor: colors.primary, // Ensure this is a visible color
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24, 
    fontFamily: 'SpaceGrotesk-SemiBold', 
    color: colors.textGray, 
    paddingHorizontal: 30,
  },
  outerContainer: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  filter: {
    alignItems: 'center',
    marginTop: -50,
    width: '100%'
},
  scrollContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  noResult: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.textGray,
  },
  bottomPadding:{
    height: 70,
  }
});

export default Discover;
