import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, {useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import colors from '../styles';
import ProgressBar from 'react-native-progress-bar-horizontal';

type RootStackParamList = {
    SelectedMenu: { foodName, reviewIds, image, location, price, taste, health, tags, allergens },
};

const FoodItem = ({ foodName, reviewIds, image, location, price, taste, health, tags, allergens }) => {
  const defaultImage = require('../assets/image.png');
  if (image.length === 0) {
      image = defaultImage;
  } 


    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToReviews = () => {
        navigation.navigate('SelectedMenu', { foodName, reviewIds, image, location, price, taste, health, tags, allergens });
    };

    return (
        <TouchableOpacity style={styles.foodItemContainer} onPress={navigateToReviews}>
            <View>
                <Image 
                    source={image || defaultImage}
                    style={styles.image}
                />
                <View style={styles.priceOverlayContainer}>
                    <Text style={styles.priceOverlay}>$ {price}</Text>
                </View>
            </View>
            <View style={styles.foodInfoContainer}>
                <View style={styles.foodInfoHeader}>
                    <Text>{foodName}</Text>
                    <Text style={styles.reviewCount}>({reviewIds.length} reviews)</Text>
                </View>
                <View style={styles.tagContainer}>
                    {tags.length > 0 && tags.map((tag, i) => (
                        <View style={[styles.tagBlob, { backgroundColor: colors.highRating }]} key={i}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                    {allergens.length > 0 && allergens.map((allergens, i) => (
                        <View style={[styles.tagBlob, {backgroundColor: colors.warningPink}]} key={i}>
                            <Text style={styles.tagText}>{allergens}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.ratingContainer}>

                  <View style={styles.tasteAndHealthContainer}>
                      
                    <Text>Health</Text>

                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={0.4}
                        borderWidth={1}
                        fillColor={colors.lightOrange}
                        unfilledColor={colors.inputGray}
                        height={10}
                        borderColor={colors.inputGray}
                        duration={100}
                        
                      />
                    </View>

                    <Text>  {health.toFixed(2)}</Text>
                  </View>

                  
                  <View style={styles.tasteAndHealthContainer}>
                    <Text>Taste  </Text>

                    <View style={styles.progressContainer}>
                      <ProgressBar
                        progress={0.7}
                        borderWidth={1}
                        fillColor={colors.highRating}
                        unfilledColor= {colors.inputGray}
                        height={10}
                        borderColor={colors.inputGray}
                        duration={100}
                        
                      />
                    </View>
                    <Text>  {taste.toFixed(2)}</Text>
                  </View>

                </View>


            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    foodItemContainer: {
        flexDirection: 'row',
        paddingHorizontal: 5,
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
    image: {
        position: 'relative',
        width: 140,
        height: 120,
        borderRadius: 20,
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
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
    },
    ratingContainer: {
      flexDirection: 'column',
      

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

    
});

export default FoodItem;
