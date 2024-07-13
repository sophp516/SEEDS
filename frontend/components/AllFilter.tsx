import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles';
import Filter from './Filter.tsx';
import SimpleFilter from './SimpleFilter';
import SearchBar from './Searchbar.tsx';
import FilterContent from './FilterContent';

const AllFilter: React.FC = () => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]); 
  const [isDisabled, setIsDisabled] = useState(false); 

  // Function to toggle the bottom sheet visibility
  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  // Function to handle filter click
  const handleFilterClick = () => {
    setIsDisabled((prev) => !prev); // Toggle the disabled state
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.containerTop}>
        <View style={styles.searchFilterRow}>
          <View style={styles.searchBarContainer}>
            <SearchBar disabled={isDisabled} /> 
          </View>
          <Filter toggleBottomSheet={toggleBottomSheet} onFilterClick={handleFilterClick} />
        </View>
        <View style={styles.simpleFilterContainer}>
          <SimpleFilter disable={isDisabled} reset={() => setIsDisabled(false)} />
        </View>
      </View>
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
