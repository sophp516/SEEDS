import React, { useState, useRef, useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';
import SmallMenu from '../components/SmallMenu.tsx';
import AllFilter from '../components/AllFilter.tsx';
import FilterContent from '../components/FilterContent.tsx';
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
  //for the filter
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]); 
  const [isDisabled, setIsDisabled] = useState(false); 

  // Function to toggle the bottom sheet visibility
  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  // Function to handle filter click and toggle the disabled state
  const handleFilterClick = () => {
    setIsDisabled((prev) => !prev); 
  };

    const { placeName } = route.params;
    
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [onTheMenu, setOnTheMenu] = useState(ExampleMenu);

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


          <View style={styles.filter}>
            <AllFilter 
                isDisabled={isDisabled}
                toggleBottomSheet={toggleBottomSheet}
                handleFilterClick={handleFilterClick}
                resetSimpleFilter={() => setIsDisabled(false)}/>

          </View>



          <View style={styles.contentContainer}>
              <ScrollView style={styles.contentScrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
              
              </ScrollView>
          </View>


          <Navbar />

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
    filter:{
      alignItems: 'center',
      marginTop: -60,

    },
    diningHomeBody: {
        width: '100%',
    },
    backButton: {
        paddingTop: 10,
        paddingBottom: 20,
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
