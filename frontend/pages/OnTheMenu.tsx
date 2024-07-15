import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { db } from '../services/firestore.js';
import { collection, getDocs, doc, getDoc, listCollections } from 'firebase/firestore';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx';
import SmallMenu from '../components/SmallMenu.tsx';
import Filter from '../components/Filter.tsx';
import BottomSheet from '@gorhom/bottom-sheet'
import colors from '../styles.js';
import ExampleMenu from '../services/ExampleMenu.json';
import Review from '../components/Review.tsx';
import FoodItem from '../components/FoodItem.tsx';


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

    const { placeName } = route.params;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const bottomSheetRef = useRef(null);
    const [ isBottomSheetOpen, setIsBottomSheetOpen ] = useState(false);
    const [ onTheMenu, setOnTheMenu ] = useState([]);

    const fetchReviews = async (location) => {
        try {
            const foodItems = [];
            const locationDocRef = collection(db, 'colleges', 'Dartmouth College', 'diningLocations', location);
            const collectionsSnapshot = await getDocs(locationDocRef);

            for (const subCollectionDoc of collectionsSnapshot.docs) {
                const foodName = subCollectionDoc.id;
                const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', location, foodName, 'reviews');
                const reviewsDocSnapshot = await getDoc(reviewsDocRef);

                if (reviewsDocSnapshot.exists()) {
                    const reviewsData = reviewsDocSnapshot.data();
                    const reviewIds = reviewsData.reviewIds || [];
                    const foodItem = {
                        foodName,
                        reviewIds,
                        image: reviewsData?.image ?? 'default-image-url', // Default image URL if image is missing
                        location,
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
        }
    };

    useEffect(() => {
        const getReviews = async () => {
            const reviewsData = await fetchReviews(placeName);
            setOnTheMenu(reviewsData);
        };
        getReviews();
        console.log(onTheMenu);
    }, [placeName])

    const toggleBottomSheet = () => {
        if (isBottomSheetOpen) {
          bottomSheetRef.current?.close();
        } else {
          bottomSheetRef.current?.expand();
        }
        setIsBottomSheetOpen(!isBottomSheetOpen);
      };
      const snapPoints = useMemo(() => ['25%', '50%', '70%'], []);

    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.diningHomeHeaderBottom}>
                    <Text style={styles.placeNameText}>{placeName}</Text>
                </View>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.containerTop}>
                    <View style={styles.searchFilterRow}>
                    <View style={styles.searchBarContainer}>
                        <SearchBar />
                    </View>
                    <View>
                        <Filter
                        items={['Shellfish', 'fish', 'Sushi', 'Pasta', 'Salad', 'Sandwich', 'Soup', 'Dessert', 'Drink']}
                        onFilter={(filteredItems) => console.log('Filtered Items:', filteredItems)}
                        toggleBottomSheet={toggleBottomSheet}
                        />
                    </View>
                </View>
            </View>
            <ScrollView style={styles.contentScrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
                {onTheMenu.length > 0 ? (
                    onTheMenu.map((review, i) => {
                        // return <Review key={review.id} reviewId={review} />
                        return <FoodItem 
                                    foodName={review.foodName} 
                                    reviewIds={review.reviewIds}
                                    image={review.image} 
                                    location={review.location} 
                                    price={review.price}
                                    taste={review.taste}
                                    health={review.health}
                                    tags={review.tags}
                                    allergens={review.allergens}
                                    />
                    })
                ) : (
                    <Text>No reviews found</Text>
                )}
            </ScrollView>
        </View>
            <Navbar />
            <BottomSheet
                backgroundStyle={{ backgroundColor: '#E7E2DB' }}
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
            >
              <Text>Filtering </Text>
            </BottomSheet>

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
    },
    searchFilterRow: {
        justifyContent: 'flex-start',
        flex: 0,
        flexDirection: 'row',
        width: '100%',
    },
    diningHomeBody: {
        width: '100%',
    },
    backButton: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    searchAndFilterContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    closingText: {
        fontSize: 12,
        color: '#7C7C7C'
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
    searchBarContainer: {
        flex: 1,
    },
    recHeaderText: {
        fontSize: 20,
    },
    contentContainer: {
        flexDirection: 'column',
        flexGrow: 1,
        marginLeft: 20,
        marginRight: 20,
    },
    contentScrollContainer: {
        flexDirection: 'column',
        width: '100%',
        marginTop: 30,
    },
    recHolder: {
        flexDirection: 'column',
    },
    smallMenuContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
})

export default DiningHome;
