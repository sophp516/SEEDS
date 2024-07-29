import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';
import SmallMenu from '../components/SmallMenu.tsx';
import AllFilter from '../components/AllFilter.tsx';
import FilterContent from '../components/FilterContent.tsx'; 
import { collection, getDocs, doc, getDoc, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import colors from '../styles.js';
import ExampleMenu from '../services/ExampleMenu.json';
import ExampleTopRated from '../services/ExampleTopRated.json';
import FoodItem from '../components/FoodItem.tsx';
import { useAuth } from '../context/authContext.js';
import { tags } from 'react-native-svg/lib/typescript/xml';
import LoadingScreen from '../components/LoadingScreen.tsx';
import Toast from 'react-native-toast-message';
import SurpriseMe from '../components/SurpriseMe.tsx';



type RootStackParamList = {
    Home: undefined,
    OnTheMenu: { placeName: string },
    TopRated: { placeName: string },
    RecommendedForYou: { placeName: string},
};

interface SelectedMenuProps {
    key: String,
    id: String,
    foodName: string;
    image: string;
    location: string;
    price: number;
    taste: number;
    tags: string[];
    allergens: string[];
    averageRating: number;
    createdAt: string;
    images: string[];
}

type Props = {
    route: {
        params: {
            placeName: string;
            openingHour: string;
            closingHour: string;
            businessLevel: string;
        }
    }
};

const DiningHome: React.FC<Props> = ({ route }) => {
  // For the filter
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [simpleFilter, setSimpleFilter] = useState(''); 
  const [filters, setFilters] = useState<{ preferred: string[]; allergens: string[]; time: string[]; taste:number; health:number }>({
    preferred: [],
    allergens: [],
    time: [],
    taste: 1,
    health: 1,
  });
  const [isDisabled, setIsDisabled] = useState(false); 
  const [searchChange, setSearchChange] = useState('');

  // for the user preferences filter
  const { user } = useAuth();
  const { loggedInUser, displayName } = user;
  const [fetchTags, setFetchTags] = useState<string[]>([]);
  const [fetchAllergies, setFetchAllergies] = useState<string[]>([]);
  const [guestRecommendations, setGuestRecommendations] = useState(true);

  // For the content
  const { placeName, closingHour } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topRatedMenus, setTopRatedMenus] = useState([]);
  const [recommendedMenus, setRecommendedMenus] = useState([]);
  

  const fetchReviews = async (placeName) => {
    try {
        const foodItems = [];
        const locationDocRef = collection(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, 'foodList');
        const collectionsSnapshot = await getDocs(locationDocRef);

        const fetchPromises = collectionsSnapshot.docs.map(async (subCollectionDoc) => {
            const foodName = subCollectionDoc.id;
            const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, foodName, 'reviews');
            const averageReviewDocRef = doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName);

            const reviewsDocSnapshot = await getDoc(reviewsDocRef);
            const averageDocSnapshot = await getDoc(averageReviewDocRef);

            if (reviewsDocSnapshot.exists() && averageDocSnapshot.exists()) {
                const reviewsData = reviewsDocSnapshot.data();
                const reviewIds = reviewsData.reviewIds || [];

                const globalData = averageDocSnapshot.data();
                const foodItem = {
                    foodName,
                    reviewIds,
                    image: reviewsData?.image ?? '',
                    location: placeName,
                    price: globalData?.price ?? 'N/A', // Default value if price is missing
                    taste: globalData?.taste ?? 'N/A', // Default value if taste is missing
                    health: globalData?.health ?? 'N/A', // Default value if health is missing
                    allergens: globalData?.allergens ?? [], // Default to an empty array if allergens are missing
                    tags: globalData?.tags ?? [], // Default to an empty array if tags are missing
                    averageRating: globalData?.averageRating ?? 'N/A',
                    createdAt: globalData?.createdAt ?? 'N/A',
                    images: globalData?.images ?? [],
                    serving: globalData?.serving ?? 'N/A', // Default value if serving is missing
                    calories: globalData?.calories ?? 'N/A', // Default value if calories is missing
                    carbs: globalData?.carbs ?? 'N/A', // Default value if carbs is missing
                    protein: globalData?.protein ?? 'N/A', // Default value if protein is missing
                    fat: globalData?.fat ?? 'N/A', // Default value if fat is missing
                };
                foodItems.push(foodItem);
            }
        });

        await Promise.all(fetchPromises);
        return foodItems;
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        return [];
    } finally {
        setLoading(false);
    }
};
useEffect(() => {
  const fetchTags = async () => {
    if (!user.id) return;
    try {
      const userId = user.id;

      if (userId) {
        setGuestRecommendations(false);
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
    const retrieveReviews = async () => {
        const reviewsData = await fetchReviews(placeName);
        setAllMenus(reviewsData);
    }
    retrieveReviews();
}, [])

useEffect(() => {
    if (allMenus.length === 0) return;
    const sortedMenus = [...allMenus].sort((a, b) => {
        // Convert averageRating to number, use 0 if 'N/A'
        const ratingA = a.averageRating === 'N/A' ? 0 : Number(a.averageRating);
        const ratingB = b.averageRating === 'N/A' ? 0 : Number(b.averageRating);
        
        // Sort in descending order
        return ratingB - ratingA;
    });

    setTopRatedMenus(sortedMenus);

}, [allMenus])


useEffect(() => {
  if (allMenus.length === 0) return;

  if (fetchTags.length === 0 && fetchAllergies.length === 0) {
    // If no tags and allergens are set, return all menus
    setRecommendedMenus(allMenus);
    return;
  }

  const sortedMenus = allMenus.filter(item => {
    // Check if item has any of the preferred tags or allergens
    const hasPreferredTags = fetchTags.length === 0 || 
      fetchTags.some(tag => item.tags.includes(tag));

    // Check if item does not contain any of the allergens
    const hasNoAllergens = fetchAllergies.length === 0 || 
      !fetchAllergies.some(allergen => item.allergens.includes(allergen));

    return hasPreferredTags && hasNoAllergens;
  });

  setRecommendedMenus(sortedMenus);
}, [allMenus, fetchTags, fetchAllergies]);

    
  const applyFilters = (menu) => {
    return menu.filter(item => {
    //If Search is not empty, it will show the items that has the search text
    //only work is search bar doesn't have any text 
    if(!isBottomSheetOpen && searchChange!== '' && !isDisabled) {
      return item.tags.includes(searchChange) || item.allergens.includes(searchChange) ||
      item.foodName.includes(searchChange) || item.location.includes(searchChange);
    }
    //only work is search bar doesn't have any text
    if (!isBottomSheetOpen && simpleFilter !== '' && !isDisabled) {
      return item.tags.includes(simpleFilter) || item.allergens.includes(simpleFilter);
      
    }
      // if preferred is empty, isPreferred will be true other wise it will check if the item has the selected preferred tags
      // if a meal have allergens tags or prefered tags, it will show the meal
      // if multiple tags is selected then it will show the items that has all the selected tags (works with allergens)
      const isPreferred =
        filters.preferred.length === 0 || 
        filters.preferred.every(preferred => 
          item.tags.includes(preferred) || item.allergens.includes(preferred)
        );
  
      // if allergens is empty, isAllergens will be true other wise it will check if the item has the selected allergens tags
      // if a meal have allergens tags or prefered tags, it will avoid the meal
      // if multiple tags is selected then it will show the items that has all the selected tags (works with perfered)
      const isAllergens =
        filters.allergens.length === 0 || 
        !filters.allergens.every(allergens => item.allergens.includes(allergens) || item.tags.includes(allergens));
  
      // can only select one time
      const isValidTime =
      filters.time.length === 0 || 
      filters.time.every(time => item.tags.includes(time));

      // if the taste is not selected (which is when it's the default value of 1), it will show all the items
      const isTaste =
      filters.taste <= item.taste;

      // 0000000 health does not exist in the data yet


      //if all the conditions are true, it will not change the item
      return isPreferred && isAllergens && isValidTime && isTaste;
    });
  };


  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };
  const handleFilterClick = () => {
    setIsDisabled((prev) => !prev); 
  };

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  };
    
    
    // putting in the menu data and change data here: 
    //!!! important: topRated, onTheMenu, recommended are the data should be put in here
    
    const topRated = useMemo(() => applyFilters(topRatedMenus), [filters, simpleFilter, searchChange]); 
    const onTheMenu = useMemo(() => applyFilters(allMenus), [filters, simpleFilter, searchChange]); 
    const recommended = useMemo(() => applyFilters(ExampleMenu), [filters, simpleFilter, searchChange]);
    

    const handleSeeAllRecommended = () => {
      if (!user?.id) {
          Toast.show({
              type: 'error',
              text1: 'Please Sign In',
              text2: 'Please sign in to see personalized recommendations',
          });
      } else {
          navigation.navigate('RecommendedForYou', { placeName });
      }
  };


    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                  
                  <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
                    <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.closingText}>Closes at {closingHour}</Text>
                </View>
                <View style={styles.diningHomeHeaderBottom}>
                    <Text style={styles.placeNameText}>{placeName}</Text>
                </View>
            </View>

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

            <View style={styles.contentContainer}>
                <ScrollView style={styles.contentScrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.recHolder}>
                        <View>
                          <Text></Text>
                          <SurpriseMe placeName={placeName}/>

                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>Top rated</Text>
                                <TouchableOpacity style={styles.seeAllContainer} onPress={() => navigation.navigate('TopRated', { placeName })}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            {loading ? (
                            <View style={styles.loadingScreen}>
                              <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10 }} />
                              <Text>loading...</Text>


                            </View>
                          ) : topRatedMenus.length === 0 ? (
                            <Text style={styles.noResultText}>No meals match your filter...</Text>
                          ) : (
                            <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                              <View style={styles.smallMenuContainer}>
                                {topRatedMenus.map((item, i) => (
                                  <SmallMenu
                                    reviewIds={item.reviewIds}
                                    key={`toprated-${i}`}
                                    id={item.id}
                                    foodName={item.foodName}
                                    location={item.location}
                                    price={item.price}
                                    taste={item.taste}
                                    tags={item.tags}
                                    allergens={item.allergens}
                                    health={item.health}
                                    averageRating={item.averageRating}
                                    createdAt={item.createdAt}
                                    images={item.images}
                                    serving={item.serving}
                                    calories={item.calories}
                                    carbs={item.carbs}
                                    fat={item.fat}
                                    protein={item.protein}

                                  />
                                ))}
                              </View>
                            </ScrollView>
                          )}
                        </View>
                        <View>
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>On the menu</Text>
                                <TouchableOpacity style={styles.seeAllContainer} onPress={() => navigation.navigate('OnTheMenu', { placeName })}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            {loading ? (
                              <View style={styles.loadingScreen}>
                                <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10 }} />
                                <Text>loading...</Text>

                              </View>
                            ) : allMenus.length === 0 ? (
                              <Text style={styles.noResultText}>No meals match your filter...</Text>
                            ) : (
                              <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                  {allMenus.map((item, i) => (
                                    <SmallMenu
                                      reviewIds={item.reviewIds}
                                      key={`allmenu-${i}`}
                                      id={item.id}
                                      foodName={item.foodName}
                                      location={item.location}
                                      price={item.price}
                                      taste={item.taste}
                                      tags={item.tags}
                                      allergens={item.allergens}
                                      health={item.health}
                                      averageRating={item.averageRating}
                                      createdAt={item.createdAt}
                                      images={item.images}
                                      serving={item.serving}
                                      calories={item.calories}
                                      carbs={item.carbs}
                                      fat={item.fat}
                                      protein={item.protein}
                                    />
                                  ))}
                                </View>
                              </ScrollView>
                            )}

                        </View>
                        <View>
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>Recommended for you</Text>
                                <TouchableOpacity style={styles.seeAllContainer} onPress={handleSeeAllRecommended}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            {loading ? ( 
                              <View style={styles.loadingScreen}>
                                <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10 }} />
                                <Text>loading...</Text>
                              </View>
                            ) : guestRecommendations? (
                              <Text style={styles.noResultText}>Please log in to see {'\n'} personalized recommendations</Text>
                            ) : recommendedMenus?.length === 0 ?(
                              <Text style={styles.noResultText}>No meals match your preferences...</Text>
                            ) : (
                             
                              
                              <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                  {recommendedMenus.map((item, i) => (
                                    <SmallMenu
                                      reviewIds={item.reviewIds}
                                      key={`recommended-${i}`}
                                      id={item.id}
                                      foodName={item.foodName}
                                      location={item.location}
                                      price={item.price}
                                      taste={item.taste}
                                      tags={item.tags}
                                      allergens={item.allergens}
                                      health={item.health}
                                      averageRating={item.averageRating}
                                      createdAt={item.createdAt}
                                      images={item.images}
                                      serving={item.serving}
                                      calories={item.calories}
                                      carbs={item.carbs}
                                      fat={item.fat}
                                      protein={item.protein}
                                    />
                                  ))}
                                </View>
                              </ScrollView>
                            )}

                        </View>
                    </View>
                </ScrollView>
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
    flex: 1,
    backgroundColor: colors.backgroundGray,
    width: '100%'
  },
  backButtonContainer: {
    marginTop: 10,
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    width: 20,
    height: 20,
    marginRight: 10, // space between icon and text
  },
  backButton: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
  },
  filter: {
    alignItems: 'center',
    marginTop: -70,
    width: '100%'
  },
  diningHomeBody: {
    width: '100%',
  },
  closingText: {
    fontFamily: 'Satoshi-Regular',
    fontSize: 12,
    color: colors.textFaintBrown,
    marginTop: 5,
  },
  loadingScreen: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recHeader: {
    paddingBottom: 13,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  placeNameText: {
    fontSize: 26,
    fontFamily: 'SpaceGrotesk-SemiBold',
    paddingLeft: 2,
    marginTop: 15,
  },
  diningHomeHeader: {
    paddingTop: 50,
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
  recHeaderText: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 20,
  },
  contentScrollContainer: {
    flexGrow: 1,
  },
  recHolder: {
    flexDirection: 'column',
  },
  smallMenuContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  horizontalScrollView: {
    flexDirection: 'row',
  },
  seeAllText: {
    fontSize: 18,
    fontFamily: 'Satoshi-Regular',
  },
  seeAllContainer: {
    paddingRight: 20,
  },
  filterContainer: {
    marginRight: 20,
  },
  noResultText: {
    fontFamily: 'Satoshi-Medium',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.textGray,
  },
})

export default DiningHome;