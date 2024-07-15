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
        image: String,
        location: String,
        price: Number,
        taste: Number,
        tags: String[],
        allergens: String[]
    };
    
};

type SmallMenuProps = {
    id: string;
    foodName: string;
    image?: string; // Optional image
    location: string;
    price: number;
    taste: number;
    tags: string[];
    allergens: string[];
    reviewIds: string[]
};

const SmallMenu: React.FC<SmallMenuProps> = ({ id, foodName, image, reviewIds, location, price, taste, tags, allergens }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const navigateTo = () => {
        navigation.navigate('SelectedMenu', {
            id,
            foodName,
            image: image || '',
            reviewIds,
            location,
            price,
            taste,
            tags,
            allergens
        });
    }

    const getRatingBackgroundColor = (taste: number) => {
        if (taste >= 4) {
            return colors.highRating;
        } else if (taste >= 3) {
            return colors.mediumRating;
        } else {
            return colors.grayStroke;
        }
    };

    return (
        <TouchableOpacity onPress={() => navigateTo()}>
            <View style={styles.smallMenuContainer}>
            {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <View style={styles.image}>
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}
                <View>
                <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                    {foodName}
                </Text>
                <View style={[styles.ratingBackground, { backgroundColor: getRatingBackgroundColor(taste) }]}>
                    <Text style={styles.starText}>{taste} Taste</Text>
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
    }
})

export default SmallMenu;
