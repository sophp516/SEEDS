import React, { useState, useRef, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx';
import SmallMenu from '../components/SmallMenu.tsx';
import Filter from '../components/Filter.tsx';
import FilterContent from '../components/FilterContent.tsx'; 
import colors from '../styles.js';
import ExampleMenu from '../services/ExampleMenu.json';



type RootStackParamList = {
    Home: undefined,
    OnTheMenu: { placeName: string },
};

interface SelectedMenuProps {
    key: String,
    id: String,
    foodName: string;
    image: string;
    location: string;
    price: number;
    taste: number;
    tags: string[];
    allergens: string[];
}

type Props = {
    route: {
        params: {
            placeName: string;
            openingHour: string;
            closingHour: string;
            businessLevel: string;
        }
    }
};

const DiningHome: React.FC<Props> = ({ route }) => {
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]); // State to store filtered items


    const { placeName, closingHour } = route.params;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const bottomSheetRef = useRef(null);
    const [onTheMenu, setOnTheMenu] = useState(ExampleMenu);
    const [topRated, setTopRated] = useState(ExampleMenu);
    const [recommended, setRecommended] = useState(ExampleMenu);

    // Function to toggle the bottom sheet visibility
    const toggleBottomSheet = () => {
      setIsBottomSheetOpen(!isBottomSheetOpen);
    };

    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.closingText}>Closes at {closingHour}</Text>
                </View>
                <View style={styles.diningHomeHeaderBottom}>
                    <Text style={styles.placeNameText}>{placeName}</Text>
                </View>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.containerTop}>
                    <View style={styles.searchFilterRow}>
                        <View style={styles.searchBarContainer}>
                            <SearchBar />
                        </View>
                        <View style={styles.filterContainer}>
                            <Filter
                                toggleBottomSheet={toggleBottomSheet}
                            />
                        </View>
                    </View>
                </View>
                <ScrollView style={styles.contentScrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.recHolder}>
                        <View>
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>Top rated</Text>
                                <TouchableOpacity style={styles.seeAllContainer}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                    {topRated.map((item) => (
                                        <SmallMenu
                                            key={item.id}
                                            id={item.id}
                                            foodName={item.foodName}
                                            image={item.image}
                                            location={item.location}
                                            price={item.price}
                                            taste={item.taste}
                                            tags={item.tags}
                                            allergens={item.allergens}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                        <View>
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>On the menu</Text>
                                <TouchableOpacity style={styles.seeAllContainer} onPress={() => navigation.navigate('OnTheMenu', { placeName })}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                    {onTheMenu.map((item) => (
                                        <SmallMenu
                                            key={item.id}
                                            id={item.id}
                                            foodName={item.foodName}
                                            image={item.image}
                                            location={item.location}
                                            price={item.price}
                                            taste={item.taste}
                                            tags={item.tags}
                                            allergens={item.allergens}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                        <View>
                            <View style={styles.recHeader}>
                                <Text style={styles.recHeaderText}>Recommended for you</Text>
                                <TouchableOpacity style={styles.seeAllContainer}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal={true} style={styles.horizontalScrollView}>
                                <View style={styles.smallMenuContainer}>
                                    {recommended.map((item) => (
                                        <SmallMenu
                                            key={item.id}
                                            id={item.id}
                                            foodName={item.foodName}
                                            image={item.image}
                                            location={item.location}
                                            price={item.price}
                                            taste={item.taste}
                                            tags={item.tags}
                                            allergens={item.allergens}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </ScrollView>
            </View>
            <Navbar />
            
            <FilterContent
              onFilter={setFilteredItems}
              isVisible={isBottomSheetOpen}
              setIsVisible={setIsBottomSheetOpen}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundGray,
    },
    containerTop: {
        alignItems: 'center',
    },
    searchFilterRow: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        paddingBottom: 20,
    },
    diningHomeBody: {
        width: '100%',
    },
    backButton: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    searchAndFilterContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    closingText: {
        fontSize: 12,
        color: '#7C7C7C'
    },
    recHeader: {
        paddingBottom: 13,
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    placeNameText: {
        fontSize: 20,
        fontWeight: '500',
    },
    diningHomeHeader: {
        paddingTop: 60,
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
    searchBarContainer: {
        flex: 1,
    },
    recHeaderText: {
        fontSize: 20,
    },
    contentContainer: {
        flex: 1,
        marginLeft: 20,
    },
    contentScrollContainer: {
        flexGrow: 1,
    },
    recHolder: {
        flexDirection: 'column',
    },
    smallMenuContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    horizontalScrollView: {
        flexDirection: 'row',
    },
    seeAllText: {
        fontSize: 16,
    },
    seeAllContainer: {
        paddingRight: 20,
    },
    filterContainer: {
        marginRight: 20,
    }
})

export default DiningHome;