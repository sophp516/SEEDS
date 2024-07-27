import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { useNavigation, RouteProp, NavigationProp, ParamListBase } from '@react-navigation/native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import Navbar from '../components/Navbar.jsx';
import Review from '../components/Review.tsx';
import colors from '../styles.js';
import NutrientsDisplay from '../components/NutrientsDisplay.tsx';
import ImageSlider from '../components/ImageSlider.tsx';
export type RootStackParamList = {
    SelectedMenu: {
        id: string;
        reviewIds: string[],
        foodName: string;
        image?: string;
        location: string;
        price: number;
        taste: number;
        tags: string[];
        allergens: string[];
        health: number;
        serving: string;
        calories: string;
        protein: string;
        fat: string;
        carbs: string;
        averageRating: number;
    },
    Post: { toggle: boolean; foodName: string };
};

type SelectedMenuRouteProp = RouteProp<RootStackParamList, 'SelectedMenu'>;

interface SelectedMenuProps {
    route: SelectedMenuRouteProp;
}

const SelectedMenu: React.FC<SelectedMenuProps> = ({ route }) => {
    const { reviewIds, foodName, image, location, price, taste ,serving, calories, protein, fat, carbs, averageRating } = route.params;
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [toggleOverview, setToggleOverview] = useState(true);
    const [reviews, setReviews] = useState([])
    const [allTags, setAllTags] = useState([]);
    const [allAllergens, setAllAllergen] = useState([]);
    let parsedAverageRating = parseFloat(averageRating.toString()).toFixed(1);
    const getRatingBackgroundColor = (taste: number) => {
        if (taste >= 4) {
            return colors.highRating;
        } else if (taste >= 3) {
            return colors.mediumRating;
        } else {
            return colors.lowRating;
        }
    };
    const navigateToReview = () => {
        navigation.navigate('Post', { toggle: false, foodName: foodName });
    }

    const fetchReviews = async () => {
        try {
            const fetchedReviews = []; // Temporary array to store fetched reviews
            for (const id of reviewIds) {
                const submissionRef = doc(db, 'globalSubmissions', id); // Use 'doc' instead of 'collection'
                const submissionSnapshot = await getDoc(submissionRef); // Use 'getDoc' to fetch a single document
    
                if (submissionSnapshot.exists()) {
                    const submissionData = submissionSnapshot.data();
                    fetchedReviews.push(submissionData); // Collect each review data
                }
            }
            setReviews(fetchedReviews); // Update state once after the loop
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [reviewIds])

    useEffect(() => {
        const collectAllTags = () => {
            const allTags = [];

            // Collect all tags from all reviews
            reviews.forEach(review => {
                review.tags.forEach(tag => {
                    allTags.push(tag);
                });
            });

            return allTags;
        };

        const collectAllAllergens = () => {
        
            const allAllergens = [];

            // Collect all tags from all reviews
            reviews.forEach(review => {
                review.allergens.forEach(tag => {
                    allAllergens.push(tag);
                });
            });

            return allAllergens;
        };



        if (reviews.length > 0) {
            const tagsArray = collectAllTags();
            const allergensArray = collectAllAllergens();
            setAllTags(tagsArray)
            setAllAllergen(allergensArray)
        }
    }, [reviews]);
    
    
    return (
        <View style={styles.container}>
            <View style={styles.selectedHeader}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
                    <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <View style={styles.outerHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.foodNameText}>{foodName}</Text>
                        <View style={[styles.ratingBackground, { backgroundColor: getRatingBackgroundColor(taste) }]}>
                            <Text style={styles.starText}>{parsedAverageRating} stars</Text>
                        </View>
                    </View>
                    <Text style={styles.locationText}>{location}</Text>
                </View>
            </View>
            <View style={styles.toggleContainer}>
                <View style={[styles.toggleBorder, toggleOverview && styles.activeBorder]}>
                    <TouchableOpacity onPress={() => setToggleOverview(true)}>
                        <Text style={[styles.toggleText, toggleOverview && styles.activeText]}>Overview</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.toggleBorder, !toggleOverview && styles.activeBorder]}>
                    <TouchableOpacity onPress={() => setToggleOverview(false)}>
                        <Text style={[styles.toggleText, !toggleOverview && styles.activeText]}>Reviews</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView style={styles.scrollContainer}>
                {toggleOverview ? 
                    <View style={styles.toggleContentContainer}>
                        {image ? (
                            // <ImageSlider images={[image]} />
                            <Image source={{ uri: image[0] }} style={styles.image} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Text style={styles.placeholderText}>No Image</Text>
                            </View>
                        )}
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceText}>$ {price}</Text>
                        </View>
                        <View style={styles.bottomContainer}>
                            <View style={styles.tagContainer}>
                                <View style={styles.tagHeader}>
                                    <Text style={styles.tagText}>Tags</Text>
                                    <Text style={styles.smallGrayText}>inputted by reviewers</Text>
                                </View>
                                <View style={styles.tagContent}> 
                                    {allTags.map((item, i) => {
                                        return (
                                            <View style={styles.tagBlob} key={i}>
                                                <Text>{item}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                                <View style={styles.tagHeader}>
                                    <Text style={styles.tagText}>Allergens</Text>
                                    <Text style={styles.smallGrayText}>inputted by reviewers</Text>
                                </View>
                                <View style={styles.allergenContent}> 
                                    {allAllergens.map((item, i) => {
                                        return (
                                            <View style={styles.allergenBlob} key={i}>
                                                <Text>{item}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                                <Text style={styles.tagText}>Nutrition</Text>
                                <View style={styles.nutritionDisplayContainer}>
                                    <NutrientsDisplay 
                                        serving={serving}
                                        calories={calories}
                                        protein={protein}
                                        fat={fat}
                                        carbs={carbs}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    :
                    <View style={styles.reviewsContainer}>
                        {reviews.map((submission, i) => {
                            return (
                                <Review
                                    key={submission.reviewId} // Add the unique key prop here
                                    reviewId={submission.reviewId}
                                    foodName={submission.foodName} 
                                    comment={submission.comment}
                                    health={submission.health}
                                    taste={submission.taste}
                                    likes={submission.likes}
                                    location={submission.location}
                                    price={submission.price}
                                    tags={submission.tags}
                                    timestamp={submission.timestamp}
                                    userId={submission.userId}
                                    image={submission.image}
                                    subcomment={submission.subComment}
                                    allergens={submission.allergens}
                                />
                            );
                        })}
                    </View>
                }
            </ScrollView>
            <View style={styles.addReviewContainer}>
                <TouchableOpacity onPress={navigateToReview} style={styles.addReviewButton}>
                    <Text style={styles.addReviewText}>Add Review</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.bottomPadding}></View>
            <Navbar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        height: '100%',
        backgroundColor: colors.backgroundGray,
    },
    selectedHeader: {
        paddingHorizontal: 20,
        flexDirection: 'column',
    },
    backButtonContainer: {
        paddingLeft: 5,
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backArrow: {
        width: 20,
        height: 20,
        marginRight: 10, // space between icon and text
    },
    backButton: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButtonText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 16,
    },
    headerContent: {
        marginLeft: 10,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodNameText: {
        fontSize: 24,
        fontFamily: 'SpaceGrotesk-Medium',
        color: colors.textGray,
        marginRight: 20,
        maxWidth: '70%',
        flexWrap: 'wrap',
    },
    ratingBackground: {
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 10,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    smallGrayText: {
        color: colors.grayStroke,
        fontSize: 12,
        fontFamily: 'Satoshi-Regular',
        marginLeft: -5,
        marginTop: 3,
    },
    starText: {
        fontSize: 12,
    },
    outerHeader: {
        flexDirection: 'column',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 20,
    },
    toggleText: {
        marginHorizontal: 20,
        fontSize: 18,
        fontFamily: 'Satoshi-Medium',
        color: colors.textBrown,
    },
    activeText: {
        color: colors.orangeHighlight, 
        fontWeight: 'bold',
    },
    toggleBorder: {
        borderBottomWidth: 2,
        borderBottomColor: colors.inputGray,
    },
    activeBorder: {
        borderBottomColor: colors.orangeHighlight,
    },
    scrollContainer: {
        flex: 1,
    },
    toggleContentContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginVertical: 5,
        marginHorizontal: 30,
        alignItems: 'center',
        paddingBottom: 100,
    },
    locationText: {
        color: colors.textBrown,
        marginLeft: 10,
        marginTop: 5,
        fontSize: 20,
        fontFamily: 'SpaceGrotesk-Medium',
    },
    priceContainer: {
        borderWidth: 1,
        borderColor: colors.outlineDarkBrown,
        borderRadius: 15,
        marginTop: 10,
        paddingVertical: 3,
        paddingHorizontal: 10,
        justifyContent: 'flex-end',
        alignSelf: 'flex-end', 
        marginRight: 4,
    },
    priceText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 16,
    },
    placeholderImage: {
        width: '100%',
        height: 240,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#7c7c7c',
    },
    image: {
        width: '100%',
        height: 240,
        borderRadius: 15,
    },
    tagContainer: {
        flexDirection: 'column',
    },
    tagHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tagText: {
        marginRight: 20,
        fontSize: 20,
        fontFamily: 'Satoshi-Medium',
    },
    tagContent: {
        flexDirection: 'row',
        marginTop: 8,
        flexWrap: 'wrap',
        paddingBottom: 15,
    },
    tagBlob: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 15,
        marginRight: 3,
        marginBottom: 3,
        backgroundColor: colors.highRating,
    },
    allergenContent: {
        flexDirection: 'row',
        marginTop: 8,
        flexWrap: 'wrap',
        paddingBottom: 15,
    },
    allergenBlob: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 15,
        marginRight: 3,
        marginBottom: 3,
        backgroundColor: colors.warningPink,
    },
    bottomContainer: {
        width: '100%',
    },
    addReviewButton: {
        backgroundColor: colors.orangeHighlight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    addReviewContainer: {
        position: 'absolute',
        flexDirection: 'row-reverse',
        bottom: 100,
        right: 20,
    },
    addReviewText: {
        color: 'white',
        fontSize: 18,
    },
    reviewsContainer: {
        paddingHorizontal: 20,
    },
    nutritionDisplayContainer:{
        alignItems: 'center',
        marginTop: 5,
    },
    bottomPadding:{
        height: 40,
    }
    
});

export default SelectedMenu;
