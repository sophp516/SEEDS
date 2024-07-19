import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import SelectedMenu from "../pages/SelectedMenu.tsx";
import colors from '../styles.js';

type RootStackParamList = {
    SelectedMenu: {
        id: String,
        foodName: String,
        reviewIds: string[],
        image: string[],
        location: String,
        price: Number,
        taste: Number,
        health: Number,
        tags: String[],
        allergens: String[]
    };
    
};

type SmallMenuProps = {
    id: string;
    foodName: string;
    images?: string[]; // Optional image
    location: string;
    price: number;
    taste: number;
    tags: string[];
    allergens: string[];
    reviewIds: string[]
    health: number;
    averageRating: number;
    createdAt: string;
};

const SmallMenu: React.FC<SmallMenuProps> = ({ id, foodName, images, reviewIds, location, price, taste, tags, allergens, health, averageRating, createdAt }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const navigateTo = () => {
        navigation.navigate('SelectedMenu', {
            id,
            foodName,
            image: images || [],
            reviewIds,
            location,
            price,
            taste,
            tags,
            allergens, 
            health
        });
    }

    const getRatingBackgroundColor = (taste: number) => {
        if (taste >= 4) {
            return colors.highRating;
        } else if (taste >= 3) {
            return colors.mediumRating;
        } else {
            return colors.lowRating;
        }
    };

    return (
        <TouchableOpacity onPress={() => navigateTo()}>
            <View style={styles.smallMenuContainer}>
            {images.length > 0 ? (
                    <Image source={{ uri: images[0] }} style={styles.image} />
                ) : (
                    <View style={styles.image}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
                <View>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {foodName}
                </Text>
                <View style={styles.ratingContainer}>
                  <View style={[styles.ratingBackground, { backgroundColor: getRatingBackgroundColor(health), marginRight: 3 }]}>
                   <Image source={require('../assets/health.png')} style={{width: 15, height: 15}}/>
                      <Text style={styles.starText}> {health.toFixed(2)} </Text>

                  </View>
                  <View style={[styles.ratingBackground, { backgroundColor: getRatingBackgroundColor(taste) }]}>
                      <Image source={require('../assets/taste.png')} style={{width: 15, height: 15}}/>
                      <Text style={styles.starText}> {taste.toFixed(2)}</Text>

                  </View>

                </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    smallMenuContainer: {
        backgroundColor: colors.primaryWhite,
        borderColor: colors.grayStroke,
        borderWidth: 1,
        paddingBottom: 10,
        paddingTop: 7,
        paddingHorizontal: 7,
        borderRadius: 10,
        marginRight: 18,
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
    },
    placeholderText: {
        color: '#7c7c7c',
    },
    ratingBackground: {
        flexDirection: 'row',
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 10,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    nameText: {
        fontSize: 17,
        maxWidth: 150, 
    },
    starText: {
        fontSize: 12,
    },
    ratingContainer: {
        flexDirection: 'row'
    }
})

export default SmallMenu;
