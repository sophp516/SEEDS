import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { db } from '../services/firestore.js';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';
import FoodItem from '../components/FoodItem.tsx';
import AllFilter from '../components/AllFilter.tsx';
import FilterContent from '../components/FilterContent.tsx';
import LoadingScreen from '../components/LoadingScreen.tsx';
import { useAuth } from '../context/authContext.js';



type RootStackParamList = {
    Home: undefined,
};

type Props = {
    route: {
        params: {
            placeName: string; 

        }
    }
};

const DiningHome: React.FC<Props> = ({ route }) => {
    const { user } = useAuth();
    const { placeName } = route.params;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [ onTheMenu, setOnTheMenu ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [recommendedMenus, setRecommendedMenus] = useState([]);
    const [fetchTags, setFetchTags] = useState<string[]>([]);
    const [fetchAllergies, setFetchAllergies] = useState<string[]>([]);

    const fetchReviews = async (location) => {
        try {
            const foodItems = [];
            const locationDocRef = collection(db, 'colleges', 'Dartmouth College', 'diningLocations', location, 'foodList');
            const collectionsSnapshot = await getDocs(locationDocRef);

            for (const subCollectionDoc of collectionsSnapshot.docs) {
                const foodName = subCollectionDoc.id;
                const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', location, foodName, 'reviews');
                const reviewsDocSnapshot = await getDoc(reviewsDocRef);

                const averageReviewDocRef = doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName);
                const averageDocSnapshot = await getDoc(averageReviewDocRef);

                if (reviewsDocSnapshot.exists()) {
                    const reviewsData = reviewsDocSnapshot.data();
                    const reviewIds = reviewsData.reviewIds || [];

                    const globalData = averageDocSnapshot.data();

                    const foodItem = {
                        foodName,
                        reviewIds,
                        image: globalData?.images ?? require('../assets/image.png'), // Default image if image is missing
                        location: globalData?.location ?? 'N/A', // Default value if location is missing
                        price: globalData?.price ?? 'N/A', // Default value if price is missing
                        taste: globalData?.taste ?? 'N/A', // Default value if taste is missing
                        health: globalData?.health ?? 'N/A', // Default value if health is missing
                        allergens: globalData?.allergens ?? [], // Default to an empty array if allergens are missing
                        tags: globalData?.tags ?? [], // Default to an empty array if tags are missing
                        serving: globalData?.serving ?? 'N/A', // Default value if serving is missing 
                        calories: globalData?.calories ?? 'N/A', // Default value if calories is missing
                        carbs: globalData?.carbs ?? 'N/A', // Default value if carbs is missing
                        protein: globalData?.protein ?? 'N/A', // Default value if protein is missing
                        fat: globalData?.fat ?? 'N/A', // Default value if fat is missing  
                        averageRating: globalData?.averageRating ?? 0,
                        updatedTime: globalData?.updatedAt ?? 'N/A',

                    };
                    foodItems.push(foodItem);
                }
            }
            return foodItems;
        } catch (error) {
            console.error("Error fetching reviews: ", error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getReviews = async () => {
            setLoading(true); 
            const reviewsData = await fetchReviews(placeName);
            setOnTheMenu(reviewsData); 
        };
        getReviews();
        
    }, [placeName])

    useEffect(() => {
      const fetchTags = async () => {
        if (!user.id) return;
        try {
          const userId = user.id;
    
          if (userId) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('id', '==', userId));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userData = userDoc.data();
    
              if (userData.tags && Array.isArray(userData.tags)) {
                setFetchTags(userData.tags);
              } else {
                setFetchTags([]);
              }
              if (userData.allergies && Array.isArray(userData.allergies)) {
                setFetchAllergies(userData.allergies);
              } else {
                setFetchAllergies([]);
              }
            } else {
              setFetchTags([]);
              setFetchAllergies([]);
            }
          } else {
            // Handle the case where the user is not logged in
            setFetchTags([]);
            setFetchAllergies([]);
          }
        } catch (e) {
    
        } 
      };
    
      fetchTags();
    }, [user]);

    useEffect(() => {
      if (onTheMenu.length === 0) return;
    
      if (fetchTags.length === 0 && fetchAllergies.length === 0) {
        // If no tags and allergens are set, return all menus
        setRecommendedMenus(onTheMenu);
        return;
      }
    
      const sortedMenus = onTheMenu.filter(item => {
        // Check if item has any of the preferred tags or allergens
        const hasPreferredTags = fetchTags.length === 0 || 
          fetchTags.some(tag => item.tags.includes(tag));
    
        // Check if item does not contain any of the allergens
        const hasNoAllergens = fetchAllergies.length === 0 || 
          !fetchAllergies.some(allergen => item.allergens.includes(allergen));
    
        return hasPreferredTags && hasNoAllergens;
      });
    
      setRecommendedMenus(sortedMenus);
    

    }, [, fetchTags, fetchAllergies]);


        
      //filtering
      const applyFilters = (submissions) => {
        return submissions.filter(item => {
          const Tags = item.tags || [];
          const Allergens = item.allergens || [];
          const FoodName = item.foodName || '';
          const Location = item.location || '';
          const Taste = item.taste || 1;
          const Health = item.health || 1;
    
          if (!isBottomSheetOpen && searchChange !== '' && !isDisabled) {
            return Tags.includes(searchChange) || Allergens.includes(searchChange) ||
              FoodName.includes(searchChange) || Location.includes(searchChange);
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
      // For the filter
      const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
      const [simpleFilter, setSimpleFilter] = useState(''); // State for simple filter
      const [filters, setFilters] = useState<{ preferred: string[]; allergens: string[]; time: string[]; taste:number; health:number }>({
        preferred: [],
        allergens: [],
        time: [],
        taste: 1,
        health: 1,
      });
      const [isDisabled, setIsDisabled] = useState(false); 
      const [searchChange, setSearchChange] = useState('');
      
      const filterApplied = filters.preferred.length > 0 || filters.allergens.length > 0 || filters.time.length > 0 || filters.taste > 1 || filters.health > 1 || searchChange !== '' || simpleFilter !== '';
      const filterOnTheMenu = useMemo(() => applyFilters(recommendedMenus), [filters, simpleFilter, searchChange]);
      const filterOrNone = filterApplied ? filterOnTheMenu : recommendedMenus;


    const toggleBottomSheet = () => {
      setIsBottomSheetOpen(!isBottomSheetOpen);
    };
    const handleFilterClick = () => {
      setIsDisabled((prev) => !prev); 
    };



    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.diningHomeHeaderBottom}>
                    <Text style={styles.placeNameText}>Recommended: {placeName}</Text>
                </View>
            </View>
            <View style={styles.contentContainer}>
            <View style={styles.filter}>
            <AllFilter 
              isDisabled={isDisabled}
              toggleBottomSheet={toggleBottomSheet}
              handleFilterClick={handleFilterClick}
              resetSimpleFilter={() => setIsDisabled(false)}
              onSimpleFilterChange={(filter) => {setSimpleFilter(filter);}}
              onSearchChange={(search) => {setSearchChange(search);}}
              />

          </View>
            {loading ?
            <View style={styles.loadingScreen}>
              <LoadingScreen />

            </View>
            : <ScrollView style={styles.contentScrollContainer}>
                {filterOrNone.length > 0 ? (
                    filterOrNone.map((review, i) => {
                        // return <Review key={review.id} reviewId={review} />
                        return <FoodItem 
                            key={i}
                            foodName={review.foodName} 
                            reviewIds={review.reviewIds}
                            image={review.image} 
                            location={review.location} 
                            price={review.price}
                            taste={review.taste}
                            health={review.health}
                            tags={review.tags}
                            allergens={review.allergens}
                            serving={review.serving}
                            calories={review.calories}
                            carbs={review.carbs}
                            protein={review.protein}
                            fat={review.fat}
                            averageRating={review.averageRating}
                            updatedTime={review.updatedTime}
                            />
                    })
                ) : (
                  <Text style={styles.noResult}> No results found...</Text>
                )}
            </ScrollView>}
        </View>
        <FilterContent
            onFilter={setFilters}
            isVisible={isBottomSheetOpen}
            setIsVisible={setIsBottomSheetOpen}
            />
        
        <Navbar />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: colors.backgroundGray,
    },
    containerTop: {
        alignItems: 'center',
        marginLeft: 20,
        marginRight: 20,
    },
    diningHomeBody: {
        width: '100%',
    },
    backButton: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    closingText: {
        fontSize: 12,
        color: colors.textFaintBrown,
    },
    recHeader: {
        paddingBottom: 13,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    placeNameText: {
        fontSize: 26,
        fontFamily: 'SpaceGrotesk-SemiBold',
    },
    diningHomeHeader: {
        paddingTop: 60,
        width: '100%',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    diningHomeHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diningHomeHeaderBottom: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 20,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    contentScrollContainer: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 10,
        flex: 1,
    },
    recHolder: {
        flexDirection: 'column',
    },
    smallMenuContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    filter: {
      alignItems: 'center',
      marginTop: -60,
  },
  noResult: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.textGray,
  },
})

export default DiningHome;