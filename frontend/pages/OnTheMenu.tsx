import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx';
import SmallMenu from '../components/SmallMenu.tsx';
import Filter from '../components/Filter.tsx';
import BottomSheet from '@gorhom/bottom-sheet'
import colors from '../styles.js';
import ExampleMenu from '../services/ExampleMenu.json';


type RootStackParamList = {
    Home: undefined,
};


type Props = {
    route: {
        params: {
            placeName: string;
        }
    }
};

const DiningHome: React.FC<Props> = ({ route }) => {

    const { placeName } = route.params;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const bottomSheetRef = useRef(null);
    const [ isBottomSheetOpen, setIsBottomSheetOpen ] = useState(false);
    const [onTheMenu, setOnTheMenu] = useState(ExampleMenu);

    const toggleBottomSheet = () => {
        if (isBottomSheetOpen) {
          bottomSheetRef.current?.close();
        } else {
          bottomSheetRef.current?.expand();
        }
        setIsBottomSheetOpen(!isBottomSheetOpen);
      };
      const snapPoints = useMemo(() => ['25%', '50%', '70%'], []);

    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text>Back</Text>
                    </TouchableOpacity>
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
                    <View>
                        <Filter
                        items={['Shellfish', 'fish', 'Sushi', 'Pasta', 'Salad', 'Sandwich', 'Soup', 'Dessert', 'Drink']}
                        onFilter={(filteredItems) => console.log('Filtered Items:', filteredItems)}
                        toggleBottomSheet={toggleBottomSheet}
                        />
                    </View>
                </View>
            </View>
            <ScrollView style={styles.contentScrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
            
            </ScrollView>
        </View>
            <Navbar />
            <BottomSheet
                backgroundStyle={{ backgroundColor: '#E7E2DB' }}
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
            >
              <Text>Filtering </Text>
            </BottomSheet>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: colors.backgroundGray,
    },
    containerTop: {
        alignItems: 'center',
    },
    searchFilterRow: {
        justifyContent: 'flex-start',
        flex: 0,
        flexDirection: 'row',
        width: '100%',
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
        flexDirection: 'column',
        flexGrow: 1,
        marginLeft: 20,
        marginRight: 20,
    },
    contentScrollContainer: {
        flexDirection: 'column',
        width: '100%',
    },
    recHolder: {
        flexDirection: 'column',
    },
    smallMenuContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
})

export default DiningHome;
