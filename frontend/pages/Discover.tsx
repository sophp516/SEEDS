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

  
  //function for filters
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [filters, setFilters] = useState<{ preferred: string[]; allergens: string[]; time: string[]; taste:number; health:number }>({
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
      const submissions = submissionSnapshot.docs.map(doc => doc.data());
      return submissions;
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      return [];
    }
  };
  
  useEffect(() => {
    const loadSubmissions = async () => {
      const submissionData = await fetchSubmissions();
      setSubmissions(submissionData);
    };
    loadSubmissions();
  }, []);
  
  const applyFilters = (submissions) => {

    
    
    return submissions.filter(item => {
      //only preferred works for now
      const Tags = item.tags || [];
      const allergens = item.allergens || [];
      
      const isPreferred =
      filters.preferred.length === 0 || 
      filters.preferred.every(preferred => 
        Tags.includes(preferred)
      );

      const isAllergen =
      filters.allergens.length === 0 ||
      filters.allergens.every(allergen => 
        !Tags.includes(allergen)
      );


      return isPreferred && isAllergen;
    });
  }
  const filterSubmissions = useMemo(() => applyFilters(submissions), [filters, simpleFilter, searchChange]);

  //function need to to load filter page
  const filterOrNone = filterSubmissions.length > 0 ? filterSubmissions : submissions;
  

  // Function to handle filter click and toggle the disabled state
  const handleFilterClick = () => {
    setIsDisabled((prev) => !prev);
  };

  return (
    <View style={styles.outerContainer}>
      <AllFilter 
        isDisabled={isDisabled}
        toggleBottomSheet={toggleBottomSheet}
        handleFilterClick={handleFilterClick}
        resetSimpleFilter={() => setIsDisabled(false)}
        onSimpleFilterChange={(filter) => {setSimpleFilter(filter);}}
        onSearchChange={(search) => {setSearchChange(search);}}
        />
      <ScrollView style={styles.scrollContainer}>
        {submissions.length > 0 &&
          filterOrNone.map((submission, index) => {
            if (submission.isReview) {
              return (
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
                image={submission.image}
                subcomment={submission.subComment}
                allergens={submission.allergens}
                />
              );
            } else {
              return (
                <Post
                key={index}
                postId={submission.postId}
                comment={submission.comment}
                timestamp={submission.timestamp}
                uploadCount={submission.uploadCount}
                userId={submission.userId}
                />
              );
            }
          })}
      </ScrollView>
      <FilterContent
        onFilter={setFilters}
        isVisible={isBottomSheetOpen}
        setIsVisible={setIsBottomSheetOpen}
      />
      <Navbar />
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
    paddingHorizontal: 20,
  },
});

export default Discover;