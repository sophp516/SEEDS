import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, {useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import colors from '../styles';
import ProgressBar from 'react-native-progress-bar-horizontal';
import Preferences from '../services/Preferences.json';
import Allergens from '../services/Allergens.json';
import ImageSlider from './ImageSlider';
import { Timestamp } from 'firebase/firestore';
import TimeDisplay from './TimeDisplay';

type RootStackParamList = {
    SelectedMenu: { foodName, reviewIds, image, location, price, taste, health, tags, allergens, serving, calories, protein, fat, carbs , averageRating },
};


const FoodItem = ({ foodName, reviewIds, image, location, price, taste, health, tags, allergens, serving, calories, protein, fat, carbs, averageRating,  updatedTime}) => {
  const defaultImage = require('../assets/image.png');
    let parsedRating = parseFloat(averageRating).toFixed(1);
    let parsedPrice = '$' + parseFloat(price).toFixed(2);
    if (Number.isNaN(parseFloat(price))) {
        parsedPrice = '$ N/A';
    }


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
                    <View  style={styles.generalInfo}>
                        
                        <Text style={styles.generalInfotext}>{parsedPrice}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.foodInfoContainer}>
                <View style={styles.foodInfoHeader}>
                    {/* Modified foodname, so it doesn't push other element off of page */}
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ flex: 1,}}>{foodName}</Text>
                    <Text style={styles.reviewCount}>({reviewIds.length} reviews)</Text>
                </View>
                <View style={styles.tagContainer}>
                    {tags.length > 0 && tags.map((tag, i) => (
                        <View style={[styles.tagBlob, getTagStyle(tag)]} key={i}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                    {allergens.length > 0 && allergens.map((allergens, i) => (
                        <View style={[styles.tagBlob, getAllergenStyle(allergens)]} key={i}>
                            <Text style={styles.tagText}>{allergens}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.ratingContainer}>

                  <View style={styles.tasteAndHealthContainer}>
                      
                    <Text style={styles.ratingText}>Taste  </Text>

                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={normalizeValue(taste)}
                        borderWidth={1}
                        fillColor={colors.lightOrange}
                        unfilledColor={colors.inputGray}
                        height={10}
                        borderColor={colors.inputGray}
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
                        unfilledColor= {colors.inputGray}
                        height={10}
                        borderColor={colors.inputGray}
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
        paddingTop: 10,
        flex: 1,
        flexDirection: 'column',
    },
    generalInfo: {
        backgroundColor: 'white',
        textAlign: 'center',
        margin: 1,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: colors.primaryWhite,
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
        color: '#35353E',             
        textAlign: 'center',          
        fontFamily: 'Satoshi',        
        fontSize: 12,                 
        fontStyle: 'normal',          
        fontWeight: '500',            
        lineHeight: 15,              
        letterSpacing: -0.11, 
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
        color: '#7c7c7c',
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
        color: colors.grayStroke,
        fontSize: 12,
        marginLeft: 5,
    },
    foodInfoHeader: {
        flexDirection: 'row',

    },
    tagBlob: {
      paddingHorizontal: 6, // Reduced padding
      paddingVertical: 2,   // Reduced padding
      borderRadius: 12,     // Slightly smaller border radius
      marginRight: 2,       // Reduced margin
      marginBottom: 2,      // Reduced margin
  },
    tagText: {
      fontSize: 12,  // Smaller text size
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
    },
    ratingContainer: {
      flexDirection: 'column',
    },
    number: {
      fontSize: 12,
      marginLeft: 5,
      color: colors.grayStroke,
    },
    tasteAndHealthContainer: {
        flexDirection: 'row',
        marginLeft: 5,
        alignItems: 'center',
    },
    progressContainer: {
        marginLeft: 5,
        flex: 1,
    },
    ratingText: {
        fontSize: 12,
        color: '#35353E',
    },
    bottonLine:{
        width: '100%',
        borderBottomColor: '#91836E',
        borderBottomWidth: 1.5,
        marginVertical: 12,
    },
    timeContainer:{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: -10,
    },
    timeText:{
        color: '#7C7C7C',
        textAlign: 'right',
        fontFamily: 'Satoshi', 
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 13.5, 
        letterSpacing: -0.099,
        marginRight: 20,
    }


    
});

export default FoodItem;
