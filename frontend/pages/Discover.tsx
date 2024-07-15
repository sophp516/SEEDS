import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js'; 
import AllFilter from '../components/AllFilter'; 
import FilterContent from '../components/FilterContent';

const Discover = () => {
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

  return (
    <View style={styles.outerContainer}>
      <AllFilter 
        isDisabled={isDisabled}
        toggleBottomSheet={toggleBottomSheet}
        handleFilterClick={handleFilterClick}
        resetSimpleFilter={() => setIsDisabled(false)}
      />
      <Text style={styles.text}>Discover</Text>
      <Text>HEyo</Text>
      <FilterContent
        onFilter={setFilteredItems}
        isVisible={isBottomSheetOpen}
        setIsVisible={setIsBottomSheetOpen}
      />
      <Navbar />
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
