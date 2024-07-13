import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { useNavigation, RouteProp, NavigationProp, ParamListBase } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';

export type RootStackParamList = {
    SelectedMenu: {
        id: string;
        foodName: string;
        image?: string;
        location: string;
        price: number;
        taste: number;
        tags: string[];
        allergens: string[];
    },
    Post: { toggle: boolean; foodName: string };
};

type SelectedMenuRouteProp = RouteProp<RootStackParamList, 'SelectedMenu'>;

interface SelectedMenuProps {
    route: SelectedMenuRouteProp;
}

const SelectedMenu: React.FC<SelectedMenuProps> = ({ route }) => {
    const { id, foodName, image, location, price, taste, tags, allergens } = route.params;
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [toggleOverview, setToggleOverview] = useState(true);

    const getRatingBackgroundColor = (taste: number) => {
        if (taste >= 4) {
            return colors.highRating;
        } else if (taste >= 3) {
            return colors.mediumRating;
        } else {
            return colors.grayStroke;
        }
    };

    const navigateToReview = () => {
        navigation.navigate('Post', { toggle: false, foodName: foodName });
    }

    return (
        <View style={styles.container}>
            <View style={styles.selectedHeader}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <View style={styles.outerHeader}>
                    <View style={styles.headerContent}>
                        <Text style={styles.foodNameText}>{foodName}</Text>
                        <View style={[styles.ratingBackground, { backgroundColor: getRatingBackgroundColor(taste) }]}>
                            <Text style={styles.starText}>{taste} stars</Text>
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
                            <Image source={{ uri: image }} style={styles.image} />
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
                                    <Text>inputted by reviewers</Text>
                                </View>
                                <View style={styles.tagContent}> 
                                    {tags.map((item, i) => {
                                        return (
                                            <View style={styles.tagBlob} key={i}>
                                                <Text>{item}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                                <View style={styles.tagHeader}>
                                    <Text style={styles.tagText}>Allergens</Text>
                                    <Text>inputted by reviewers</Text>
                                </View>
                                <View style={styles.allergenContent}> 
                                    {allergens.map((item, i) => {
                                        return (
                                            <View style={styles.allergenBlob} key={i}>
                                                <Text>{item}</Text>
                                            </View>
                                        )
                                    })}
                                </View>
                                <Text style={styles.tagText}>Nutrition</Text>
                            </View>
                        </View>
                    </View>
                    :
                    <View>
                        <Text>Reviews content here</Text>
                    </View>
                }
            </ScrollView>
            <View style={styles.addReviewContainer}>
                <TouchableOpacity onPress={navigateToReview} style={styles.addReviewButton}>
                    <Text style={styles.addReviewText}>Add Review</Text>
                </TouchableOpacity>
            </View>
            <Navbar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        height: '100%',
    },
    selectedHeader: {
        paddingHorizontal: 20,
        flexDirection: 'column',
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#333',
    },
    headerContent: {
        marginLeft: 10,
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodNameText: {
        fontSize: 23,
        fontWeight: '500',
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
        color: colors.grayStroke,
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
        marginVertical: 20,
        marginHorizontal: 30,
        alignItems: 'center',
    },
    locationText: {
        color: colors.grayStroke,
        marginLeft: 10,
        marginTop: 5,
        fontSize: 19,
    },
    priceContainer: {
        borderWidth: 1,
        borderColor: colors.grayStroke,
        borderRadius: 15,
        marginTop: 10,
        paddingVertical: 3,
        paddingHorizontal: 10,
        justifyContent: 'flex-end',
        alignSelf: 'flex-end', 
        marginRight: 4,
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#7c7c7c',
    },
    image: {
        width: '80%',
        height: 200,
        borderRadius: 10,
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
    }
});

export default SelectedMenu;