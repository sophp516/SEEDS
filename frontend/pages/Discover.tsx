import React, { useRef, useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx';
import Filter from '../components/Filter.tsx';
import BottomSheet from '@gorhom/bottom-sheet';
import colors from '../styles.js';

const Discover = () => {
  const bottomSheetRef = useRef(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

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
    <View style={styles.outerContainer}>

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


      <Text style={styles.text}>Discover</Text>
      
      <Navbar />
      <BottomSheet
        backgroundStyle={{ backgroundColor: '#C7C7C7' }}
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
      >
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetText}> filtering...</Text>
        </View>
       
      </BottomSheet>
      
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
  },
  containerTop: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  searchFilterRow: {
    justifyContent: 'flex-start',
    flex: 0,
    flexDirection: 'row',
  },
  searchBarContainer: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 100,

  },

  bottomSheetContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },

  bottomSheetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Discover;