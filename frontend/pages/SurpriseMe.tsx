import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import colors from '../styles.js';
import { useAuth } from '../context/authContext.js';
import SmallMenu from '../components/SmallMenu';
import LoadingScreen from '../components/LoadingScreen.tsx';

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

  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(true);
  const [allMenus, setAllMenus] = useState([]);
  const [randomMenu, setRandomMenu] = useState(null);

  const fetchReviews = async (placeName: string) => {
    try {
      const foodItems = [];
      const locationDocRef = collection(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, 'foodList');
      const collectionsSnapshot = await getDocs(locationDocRef);

      const fetchPromises = collectionsSnapshot.docs.map(async (subCollectionDoc) => {
        const foodName = subCollectionDoc.id;
        const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', placeName, 'foodList', foodName);
        const averageReviewDocRef = doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName);

        const reviewsDocSnapshot = await getDoc(reviewsDocRef);
        const averageDocSnapshot = await getDoc(averageReviewDocRef);

        if (reviewsDocSnapshot.exists() && averageDocSnapshot.exists()) {
          const reviewsData = reviewsDocSnapshot.data();
          const globalData = averageDocSnapshot.data();
          const foodItem = {
            foodName,
            reviewIds: reviewsData?.reviewIds || [],
            image: reviewsData?.image ?? '',
            location: placeName,
            price: globalData?.price ?? 'N/A',
            taste: globalData?.taste ?? 'N/A',
            health: globalData?.health ?? 'N/A',
            allergens: globalData?.allergens ?? [],
            tags: globalData?.tags ?? [],
            averageRating: globalData?.averageRating ?? 'N/A',
            createdAt: globalData?.createdAt ?? 'N/A',
            images: globalData?.images ?? [],
            serving: globalData?.serving ?? 'N/A',
            calories: globalData?.calories ?? 'N/A',
            carbs: globalData?.carbs ?? 'N/A',
            protein: globalData?.protein ?? 'N/A',
            fat: globalData?.fat ?? 'N/A',
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
    const retrieveReviews = async () => {
      const reviewsData = await fetchReviews(placeName);
      setAllMenus(reviewsData);
      if (reviewsData.length > 0) {
        const randomIndex = Math.floor(Math.random() * reviewsData.length);
        setRandomMenu(reviewsData[randomIndex]);
      }
    };
    retrieveReviews();
  }, [placeName]);

  return (
    <View style={styles.container}>
      <View style={styles.diningHomeHeader}>
        <View style={styles.diningHomeHeaderTop}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
            <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.diningHomeHeaderBottom}>
          <Text style={styles.placeNameText}>Surprise Me!</Text>
        </View>
      </View>
      <View style={styles.menuContainer}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <View style={styles.confettiContainer}>
              <Image source={require('../assets/confetti.gif')} style={styles.confetti} />
              
            </View>
            {randomMenu && (
              <SmallMenu
                reviewIds={randomMenu.reviewIds}
                key={`random-${randomMenu.foodName}`}
                id={randomMenu.foodName}
                foodName={randomMenu.foodName}
                location={randomMenu.location}
                price={randomMenu.price}
                taste={randomMenu.taste}
                tags={randomMenu.tags}
                allergens={randomMenu.allergens}
                health={randomMenu.health}
                averageRating={randomMenu.averageRating}
                createdAt={randomMenu.createdAt}
                images={randomMenu.images}
                serving={randomMenu.serving}
                calories={randomMenu.calories}
                carbs={randomMenu.carbs}
                fat={randomMenu.fat}
                protein={randomMenu.protein}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    width: '100%',
  },
  backButtonContainer: {
    paddingLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  backButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
  },
  placeNameText: {
    fontSize: 26,
    fontFamily: 'SpaceGrotesk-SemiBold',
    paddingLeft: 2,
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
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confettiContainer: {
    position: 'absolute',
    width: '120%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: 'none', // Apply pointerEvents to the container, not the Image
  },
  confetti: {
    width: '100%',
    height: '100%',
  },
});

export default DiningHome;
