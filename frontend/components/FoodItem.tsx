import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import colors from '../styles';

type RootStackParamList = {
    SelectedMenu: { foodName, reviewIds, image, location, price, taste, health, tags, allergens },
};

const FoodItem = ({ foodName, reviewIds, image, location, price, taste, health, tags, allergens }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToReviews = () => {
        navigation.navigate('SelectedMenu', { foodName, reviewIds, image, location, price, taste, health, tags, allergens });
    };

    return (
        <TouchableOpacity style={styles.foodItemContainer} onPress={navigateToReviews}>
            <View>
                <Image 
                    source={image || require('../assets/image.png')}
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
                        <View style={styles.tagBlob} key={i}>
                            <Text>{tag}</Text>
                        </View>
                    ))}
                </View>
                <View>
                    <Text>Taste {taste}</Text>
                    <Text>Health {health}</Text>
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
    },
    image: {
        position: 'relative',
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
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 15,
        marginRight: 3,
        marginBottom: 3,
        backgroundColor: colors.highRating,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
    },
});

export default FoodItem;