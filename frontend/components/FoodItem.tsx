import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, {useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import colors from '../styles';
import ProgressBar from 'react-native-progress-bar-horizontal';
import Preferences from '../services/Preferences.json';
import Allergens from '../services/Allergens.json';
import ImageSlider from './ImageSlider';
import { Timestamp, collection, getDocs, orderBy, query } from 'firebase/firestore';
import TimeDisplay from './TimeDisplay';
import { db } from '../services/firestore';

type RootStackParamList = {
    SelectedMenu: { foodName, reviewIds, image, location, price, taste, health, tags, allergens, serving, calories, protein, fat, carbs , averageRating },
};

const FoodItem = ({ foodName, reviewIds, image, location, price, taste, health, tags, allergens, serving, calories, protein, fat, carbs, averageRating, updatedTime}) => {
    const defaultImage = require('../assets/image.png');
    // console.log("image", image)
    
    let parsedRating = parseFloat(averageRating).toFixed(1);
    let parsedPrice = '$' + parseFloat(price).toFixed(2);
    if (Number.isNaN(parseFloat(price))) {
        parsedPrice = '$ N/A';
    }
    const [topTags, setTopTags] = React.useState([]);
    const [topAllergens, setTopAllergens] = React.useState([]);

    useEffect(() => {
        const fetchTopTags = async () => {
            try{
                const tagCollection = collection(db, 'colleges', 'Dartmouth College', 'foodList', foodName, 'tagsCollection');
                const q = query(tagCollection, orderBy('frequency', 'desc'));
                const querySnapshot = await getDocs(q);
                const topTagsData = querySnapshot.docs.map(doc => doc.id);
                setTopTags(topTagsData);
            }catch(error){
                console.log("Error fetching top tags frequency");
            }
        }
        const fetchAllergens = async () => {
            try{
                const allergenCollection = collection(db, 'colleges', 'Dartmouth College', 'foodList', foodName, 'allergensCollection');
                const q = query(allergenCollection);
                const querySnapshot = await getDocs(q);
                const allergensData = querySnapshot.docs.map(doc => doc.id);
                setTopAllergens(allergensData);

            }catch{
                console.log("Error fetching allergens frequency");
            }
        }
        fetchTopTags();
        fetchAllergens();
    },[])
    console.log("topTags", topTags);
    console.log("topAllergens", topAllergens);
    console.log("")




    if (image.length === 0) {
        image = defaultImage;
    } 

    // Helper function for ProgressBar
    const normalizeValue = (value: any) => {
      // Check if value is a number
      if (typeof value !== 'number' || isNaN(value)) {
        return 0;
      }
      const normalized = Math.min(Math.max(value / 10, 0), 1);
      return Math.min(normalized * 2, 1);
    };

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToReviews = () => {
        navigation.navigate('SelectedMenu', { foodName, reviewIds, image, location, price, taste, health, tags, allergens, serving, calories, protein, fat, carbs, averageRating});
    };

    const getTagStyle = (tag) => {
      if (["Breakfast", "Lunch", "Dinner"].includes(tag)) {
        return styles.tagYellow;
      } else if (Preferences.id.includes(tag)) {
        return styles.tagGreen;
      }
      return styles.tagGray;
    };

  const getAllergenStyle = (allergen) => {
      return Preferences.id.includes(allergen) ? styles.tagRed : styles.tagGray;
  };

    return (
      <View>
        <TouchableOpacity style={styles.foodItemContainer} onPress={navigateToReviews}>
            <View>
                {/* <View style={styles.priceOverlayContainer}>
                    <Text style={styles.priceOverlay}>$ {price}</Text>
                    <Text>{averageRating}</Text>
                </View> */}
                {/* Modified background to be consistent with previous page, and so that it's easier to 
                    see the numbers  */}
                {image.length > 0 ?
                 <Image 
                    source={image || defaultImage}
                    style={styles.image}
                />
                 :
                <View style={styles.image2}>
                     <Text style={styles.placeholderText}>No Image</Text>
                 </View>
                }

                <View style={styles.generalInfoContainer}>
                    <View style={[styles.generalInfo, {flexDirection: 'row'}]}>
                        <Text style={styles.generalInfotext}>{parsedRating}</Text>
                        <Image source={require('../assets/star.png')} style={styles.star}/>
                    </View>
                    <View style={styles.generalInfo}>
                        <Text style={styles.generalInfotext}>{parsedPrice}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.foodInfoContainer}>
            <View style={styles.foodInfoHeader}>
            {/* Modified foodname, so it doesn't push other elements off of the page */}
                <Text numberOfLines={1} ellipsizeMode='tail' style={styles.foodName}>{foodName}</Text>
                    <Text style={styles.reviewCount}>
                        ({reviewIds.length} review{reviewIds.length !== 1 ? 's' : ''})
                     </Text>
            </View>

                <View style={styles.tagContainer}>
                    {topTags.length > 0 && topTags.map((tag, i) => (
                        <View style={[styles.tagBlob, getTagStyle(tag)]} key={i}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                    {topAllergens.length > 0 && allergens.map((allergens, i) => (
                        <View style={[styles.tagBlob, getAllergenStyle(allergens)]} key={i}>
                            <Text style={styles.tagText}>{allergens}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.ratingContainer}>

                  <View style={styles.tasteAndHealthContainer}>
                      
                    <Text style={styles.ratingText}>  Taste</Text>

                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={normalizeValue(taste)}
                        borderWidth={1}
                        fillColor={colors.lightOrange}
                        unfilledColor={colors.commentContainer}
                        height={10}
                        borderColor={colors.backgroundGray}
                        duration={100}
                      />
                    </View>

                    <Text style={styles.number}>  {taste.toFixed(1)}/5</Text>
                  </View>

                  
                  <View style={styles.tasteAndHealthContainer}>
                    <Text style={styles.ratingText}>Health</Text>

                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={normalizeValue(health)}
                        borderWidth={1}
                        fillColor={colors.highRating}
                        unfilledColor= {colors.commentContainer}
                        height={10}
                        borderColor={colors.backgroundGray}
                        duration={100}
                      />
                    </View>
                    <Text style={styles.number}>  {health.toFixed(1)}/5</Text>
                  </View>
                </View>
            </View>
        </TouchableOpacity>
        <View style={styles.timeContainer}> 
            <TimeDisplay isMenu={true}timestamp={updatedTime} textStyle={styles.timeText}/>
        </View>
        <View style={styles.bottonLine}></View>
      </View>
    );
};

const styles = StyleSheet.create({
    foodItemContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        marginLeft: 20,
        marginRight: 20,
    },
    foodInfoContainer: {
        paddingLeft: 18,
        // paddingTop: 10,
        flex: 1,
        flexDirection: 'column',
    },
    foodName: {
        flex: 1,
        fontSize: 16,         
        color: colors.textGray,  
        fontFamily: 'Satoshi-Medium',
    },
    generalInfo: {
        backgroundColor: colors.commentContainer,
        textAlign: 'center',
        margin: 1,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: colors.outlineDarkBrown,
        alignItems: 'center',
        paddingVertical: 1,
        paddingHorizontal: 5,
        marginRight: 4,
    },
    generalInfoContainer:{
        position: 'absolute',
        bottom: 10,
        right: 5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    generalInfotext:{
        color: colors.textGray,             
        textAlign: 'center',          
        fontFamily: 'Satoshi-Bold',        
        fontSize: 12,                 
    },
    star:{
        width: 12,
        height: 12,
        alignContent: 'center',
        marginLeft: 2,
    },
    image: {
        position: 'relative',
        width: 140,
        height: 125,
        borderRadius: 15,
    },
    image2: {
        width: 140,
        height: 125,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
    },
    placeholderText: {
        color: colors.textFaintBrown,
    },
    priceOverlayContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: colors.grayStroke,
        borderWidth: 2,
        overflow: 'hidden', 
        paddingHorizontal: 7,
        paddingVertical: 2,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    priceOverlay: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 2,
        textAlign: 'center',
    },
    reviewCount: {
        color: colors.textFaintBrown,
        fontSize: 12,
        marginLeft: 5,
        marginTop: 3,
    },
    foodInfoHeader: {
        flexDirection: 'row',
    },
    tagBlob: {
      paddingHorizontal: 8, // Reduced padding
      paddingVertical: 2,   // Reduced padding
      borderRadius: 15,     // Slightly smaller border radius
      marginRight: 7,       // Reduced margin
      marginBottom: 7,      // Reduced margin
  },
    tagText: {
      fontSize: 12,  // Smaller text size
      fontFamily: "Satoshi-Regular",
    },
    tagYellow: {
      backgroundColor: colors.yellow,
    },
    tagGreen: {
      backgroundColor: colors.highRating,
    },
    tagRed: {
      backgroundColor: colors.warningPink,
    },
    tagGray: {
      backgroundColor: colors.inputGray,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
        height: 50,
        width: 200,
        overflow: 'hidden',
    },
    ratingContainer: {
      flexDirection: 'column',
    },
    number: {
      fontSize: 10,
      fontFamily: 'Satoshi-Regular',
      marginLeft: 5,
      color: colors.textGray,
    },
    tasteAndHealthContainer: {
        flexDirection: 'row',
        // marginLeft: 5,
        alignItems: 'center',
    },
    progressContainer: {
        marginLeft: 5,
        flex: 1,
    },
    ratingText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 10,
        color: colors.textGray,
    },
    bottonLine:{
        width: '100%',
        borderBottomColor: colors.outlineDarkBrown,
        borderBottomWidth: 1,
        marginVertical: 12,
    },
    timeContainer:{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: -10,
    },
    timeText:{
        color: colors.textFaintBrown,
        textAlign: 'right',
        fontFamily: 'Satoshi-Regular', 
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 13.5, 
        letterSpacing: -0.099,
        marginRight: 20,
    }    
});

export default FoodItem;
