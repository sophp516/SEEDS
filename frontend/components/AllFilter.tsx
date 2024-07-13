import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../styles';
import Filter from './Filter.tsx';
import SimpleFilter from './SimpleFilter';
import SearchBar from './Searchbar.tsx';
import FilterContent from './FilterContent';

const AllFilter: React.FC = () => {
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
        <View style={styles.simpleFilterContainer}>
          <SimpleFilter />
        </View>
      </View>
      <Text style={styles.text}>Discover</Text>
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
  },
  searchBarContainer: {
    flex: 8,
  },
  simpleFilterContainer: {
    marginTop: 10,
    width: '100%',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default AllFilter;
