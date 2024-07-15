import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
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
  // For the content
  const { placeName, closingHour } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const bottomSheetRef = useRef(null);
  const [filters, setFilters] = useState<{ preferred: string[]; allergens: string[]; time: string[] }>({
    preferred: [],
    allergens: [],
    time: [],
  });
  const [isDisabled, setIsDisabled] = useState(false); 
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async (placeName) => {
    try {
        const foodItems = [];
        const locationDocRef = collection(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, 'foodList');
        const collectionsSnapshot = await getDocs(locationDocRef);

        for (const subCollectionDoc of collectionsSnapshot.docs) {
            const foodName = subCollectionDoc.id;
            const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, foodName, 'reviews');
            const reviewsDocSnapshot = await getDoc(reviewsDocRef);

            if (reviewsDocSnapshot.exists()) {
                const reviewsData = reviewsDocSnapshot.data();
                const reviewIds = reviewsData.reviewIds || [];
                const foodItem = {
                    foodName,
                    reviewIds,
                    image: reviewsData?.image ?? '', 
                    location: placeName,
                    price: reviewsData?.price ?? 'N/A', // Default value if price is missing
                    taste: reviewsData?.taste ?? 'N/A', // Default value if taste is missing
                    health: reviewsData?.health ?? 'N/A', // Default value if health is missing
                    allergens: reviewsData?.allergens ?? [], // Default to an empty array if allergens are missing
                    tags: reviewsData?.tags ?? [] // Default to an empty array if tags are missing
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



  const applyFilters = (menu) => {
    return menu.filter(item => {
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
        !filters.allergens.some(allergens => item.allergens.includes(allergens) || item.tags.includes(allergens));
  
      // if multiple time is selected, it will show the items that is either the selected time
      const isValidTime =
      filters.time.length === 0 || 
      filters.time.some(time => item.tags.includes(time));

      //if all the conditions are true, it will not change the item
      return isPreferred && isAllergens && isValidTime;
    });
  };

  


  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };
  const handleFilterClick = () => {
    setIsDisabled((prev) => !prev); 
  };

    // putting in the menu data and change data here: 
    //!!! important: topRated, onTheMenu, recommended are the data should be put in here
    const topRated = useMemo(() => applyFilters(ExampleTopRated), [filters]); 
    const onTheMenu = useMemo(() => applyFilters(ExampleMenu), [filters]); 
    const recommended = useMemo(() => applyFilters(ExampleMenu), [filters]); 

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
              resetSimpleFilter={() => setIsDisabled(false)}/>
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
                              <Text>Loading...</Text>
                            </View>
                          ) : topRated.length === 0 ? (
                            <Text style={styles.placeNameText}>No meals match your filter...</Text>
                          ) : (
                            <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                              <View style={styles.smallMenuContainer}>
                                {topRated.map((item) => (
                                  <SmallMenu
                                    reviewIds={item.reviewIds}
                                    key={item.id}
                                    id={item.id}
                                    foodName={item.foodName}
                                    image={item.image}
                                    location={item.location}
                                    price={item.price}
                                    taste={item.taste}
                                    tags={item.tags}
                                    allergens={item.allergens}
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
                                <Text>Loading...</Text>
                              </View>
                            ) : onTheMenu.length === 0 ? (
                              <Text style={styles.placeNameText}>No meals match your filter...</Text>
                            ) : (
                              <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                  {allMenus.map((item) => (
                                    <SmallMenu
                                      reviewIds={item.reviewIds}
                                      key={item.id}
                                      id={item.id}
                                      foodName={item.foodName}
                                      image={item.image}
                                      location={item.location}
                                      price={item.price}
                                      taste={item.taste}
                                      tags={item.tags}
                                      allergens={item.allergens}
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
                                <Text>Loading...</Text>
                              </View>
                            ) : recommended.length === 0 ? (
                              <Text style={styles.placeNameText}>No meals match your filter...</Text>
                            ) : (
                              <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                  {allMenus.map((item) => (
                                    <SmallMenu
                                      reviewIds={item.reviewIds}
                                      key={item.id}
                                      id={item.id}
                                      foodName={item.foodName}
                                      image={item.image}
                                      location={item.location}
                                      price={item.price}
                                      taste={item.taste}
                                      tags={item.tags}
                                      allergens={item.allergens}
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
    },
    filter: {
        alignItems: 'center',
        marginTop: -60,
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