import { StyleSheet, Text, View , Image, TouchableOpacity} from 'react-native'
import React from 'react'
import { useNavigation, RouteProp, NavigationProp, ParamListBase } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { getDoc, collection, doc} from 'firebase/firestore'
import { db } from '../services/firestore'
import FoodItem from './FoodItem';
import { useState } from 'react';
import colors from '../styles.js';

type RootStackParamList = {
    SelectedMenu: { foodName, reviewIds, image, location, price, taste, health, tags, allergens, serving, calories, protein, fat, carbs , averageRating },
};

interface FoodRankProps {
    foodName: string;
    reviewIds: string;
    image: string[];
    location:string;
    price: number;
    taste: number;
    health: number;
    allergens: string[];
    tags: string[];
    serving: string;
    calories: string;
    carbs: string;
    protein: string;
    fat: string;
    averageRating: number;
    updatedTime: string;
}
const FoodRank = ({rank, foodName, rating, location}) => {
    const formattedRating = parseFloat(rating).toFixed(1);
    const [foodReview, setFoodReview] = useState<FoodRankProps>({
        reviewIds:'',
        foodName: '',
        image: [],
        location: '',
        price: 0,
        taste: 0,
        health: 0,
        allergens: [],
        tags: [],
        serving: '',
        calories: '',
        carbs: '',
        protein: '',
        fat: '',
        averageRating: 0,
        updatedTime: '',
    });
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const getFoodReview = async () => {
        try{
            const reviewsDocRef = doc(db, 'colleges', 'Dartmouth College', 'diningLocations', location, foodName, 'reviews');
            const reviewsDocSnapshot = await getDoc(reviewsDocRef);

            const averageReviewDocRef = doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName);
            const averageDocSnapshot = await getDoc(averageReviewDocRef);

            if (reviewsDocSnapshot.exists()) {
                const reviewsData = reviewsDocSnapshot.data();
                const reviewIds = reviewsData.reviewIds || [];
                const globalData = averageDocSnapshot.data();
                const foodItem = {
                    reviewIds,
                    foodName,
                    image: globalData?.images ?? require('../assets/image.png'), // Default image if image is missing
                    location: globalData?.location ?? 'N/A', // Default value if location is missing
                    price: globalData?.price ?? 'N/A', // Default value if price is missing
                    taste: globalData?.taste ?? 'N/A', // Default value if taste is missing
                    health: globalData?.health ?? 'N/A', // Default value if health is missing
                    allergens: globalData?.allergens ?? [], // Default to an empty array if allergens are missing
                    tags: globalData?.tags ?? [], // Default to an empty array if tags are missing
                    serving: globalData?.serving ?? 'N/A', // Default value if serving is missing 
                    calories: globalData?.calories ?? 'N/A', // Default value if calories is missing
                    carbs: globalData?.carbs ?? 'N/A', // Default value if carbs is missing
                    protein: globalData?.protein ?? 'N/A', // Default value if protein is missing
                    fat: globalData?.fat ?? 'N/A', // Default value if fat is missing  
                    averageRating: globalData?.averageRating ?? 0,
                    updatedTime: globalData?.updatedAt ?? 'N/A',
                };
                return foodItem;
            }else{
                console.log("No reviews found for food item")
            }
        }catch{
            console.log("Error fetching food data in leaderboard")
        }
    }
    const navigateToReviews = async () => {
        const foodItem = await getFoodReview();
        setFoodReview(foodItem);
        console.log(foodItem.reviewIds)
        navigation.navigate('SelectedMenu', foodItem);
    };


    return (
        <TouchableOpacity onPress={()=>{navigateToReviews()}}>
        <View style={rank < 3 ?  [styles.rankContainer,{backgroundColor: '#F9A05F'} ]: [styles.rankContainer, {backgroundColor: '#E7E2DB'}] }>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.rankNum}>{rank + 1}</Text>
                <Text  numberOfLines={1} ellipsizeMode='tail' style={styles.foodText}>{foodName}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.rating}>{formattedRating}</Text>
                <Image style={styles.star} source={require('../assets/star.png')}/>
            </View>
        </View>
        </TouchableOpacity>
    )
}

export default FoodRank

const styles = StyleSheet.create({
    rankContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 335,
        height: 42,
        marginBottom: 10,
        // padding: 10,
        borderRadius: 15,
    },
    rankNum: {
        color: colors.textGray,
        fontSize: 24,
        // lineHeight: 36, // Explicit pixel value
        fontFamily: 'Satoshi-Bold',
        alignItems: 'center', 
        justifyContent: 'center',
        paddingRight: 15,
        paddingLeft: 15,
        textAlign: 'left',
    },
    foodText:{
        color: colors.textGray,
        fontSize: 16,
        // lineHeight: 24,
        fontFamily: 'Satoshi-Medium',
        marginTop: 5,
        width: 200
    },
    rating:{
        color: colors.textGray,
        fontSize: 16,
        // lineHeight: 24,
        fontFamily: 'Satoshi-Medium', 
        paddingRight: 4,
    },
    star:{
        width: 20,
        height: 20,
        paddingRight: 15,
        marginRight: 10,
    }


})