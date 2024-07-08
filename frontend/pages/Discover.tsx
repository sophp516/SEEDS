import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx'; // Importing Navbar component
import SearchBar from '../components/Searchbar.tsx'; // Importing SearchBar component
import Filter from '../components/Filter.tsx'; // Importing Filter component
import FilterContent from '../components/FilterContent.tsx'; // Importing FilterContent component
import colors from '../styles.js'; // Importing colors from styles

const Discover = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false); // State to control the bottom sheet visibility
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
        items={['Shellfish', 'fish', 'Sushi', 'Pasta', 'Salad', 'Sandwich', 'Soup', 'Dessert', 'Drink']}
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
    backgroundColor: 'white',
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
