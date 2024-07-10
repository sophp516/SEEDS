import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx'; 
import Filter from '../components/Filter.tsx'; 
import FilterContent from '../components/FilterContent.tsx'; 
import colors from '../styles.js'; 

const Discover = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]); // State to store filtered items

  // Function to toggle the bottom sheet visibility
  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.containerTop}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchBarContainer}>
            <SearchBar />
          </View>
          <Filter toggleBottomSheet={toggleBottomSheet} />
        </View>
      </View>
      <Text style={styles.text}>Discover</Text>
      <Navbar />
      <FilterContent
        onFilter={setFilteredItems}
        isVisible={isBottomSheetOpen}
        setIsVisible={setIsBottomSheetOpen}
      />
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
    flex: 8,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 100,
  },
});

export default Discover;
