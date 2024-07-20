import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';
import SmallMenu from '../components/SmallMenu.tsx';
import AllFilter from '../components/AllFilter.tsx';
import FilterContent from '../components/FilterContent.tsx'; 
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import colors from '../styles.js';
import ExampleMenu from '../services/ExampleMenu.json';
import ExampleTopRated from '../services/ExampleTopRated.json';
import FoodItem from '../components/FoodItem.tsx';


type RootStackParamList = {
    Home: undefined,
    OnTheMenu: { placeName: string },
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

  // For the content
  const { placeName, closingHour } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topRatedMenus, setTopRatedMenus] = useState([]);
  

  const fetchReviews = async (placeName) => {
    try {
        const foodItems = [];
        const locationDocRef = collection(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, 'foodList');
        const collectionsSnapshot = await getDocs(locationDocRef);

        for (const subCollectionDoc of collectionsSnapshot.docs) {
            const foodName = subCollectionDoc.id;
            const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, foodName, 'reviews');
            const reviewsDocSnapshot = await getDoc(reviewsDocRef);

            const averageReviewDocRef = doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName);
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
                    allergens: reviewsData?.allergens ?? [], // Default to an empty array if allergens are missing
                    tags: reviewsData?.tags ?? [], // Default to an empty array if tags are missing
                    averageRating: globalData?.averageRating ?? 'N/A',
                    createdAt: globalData?.createdAt ?? 'N/A',
                    images: globalData?.images ?? []
                };
                foodItems.push(foodItem);
            }
        }
        return foodItems;
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        return [];
    } finally {
        setLoading(false)
    }
};

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
    

    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Text>Back</Text>
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
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>Top rated</Text>
                                <TouchableOpacity style={styles.seeAllContainer}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            {loading ? (
                            <View style={styles.loadingScreen}>
                              <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10 }} />
                              <Text>Loading...</Text>


                            </View>
                          ) : topRatedMenus.length === 0 ? (
                            <Text style={styles.placeNameText}>No meals match your filter...</Text>
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
                                <Text>Loading...</Text>
                              </View>
                            ) : allMenus.length === 0 ? (
                              <Text style={styles.placeNameText}>No meals match your filter...</Text>
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
                                    />
                                  ))}
                                </View>
                              </ScrollView>
                            )}

                        </View>
                        <View>
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>Recommended for you</Text>
                                <TouchableOpacity style={styles.seeAllContainer}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            {loading ? (
                              <View style={styles.loadingScreen}>
                               <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10 }} />
                               <Text>Loading...</Text>
                              </View>
                            ) : recommended?.length === 0 ? (
                              <Text style={styles.placeNameText}>No meals match your filter...</Text>
                            ) : (
                              <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                  {allMenus.map((item, i) => (
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
    filter: {
        alignItems: 'center',
        marginTop: -70,
        width: '100%'
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
        color: '#7C7C7C'
    },
    loadingScreen: {
        width: '100%',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center'
    },
    recHeader: {
        paddingBottom: 13,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    placeNameText: {
        fontSize: 20,
        fontWeight: '500',
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
    recHeaderText: {
        fontSize: 20,
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
        fontSize: 16,
    },
    seeAllContainer: {
        paddingRight: 20,
    },
    filterContainer: {
        marginRight: 20,
    },
})

export default DiningHome;