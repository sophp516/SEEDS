// components/AllFilter.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Filter from './Filter';
import SimpleFilter from './SimpleFilter';
import SearchBar from './Searchbar';

const AllFilter: React.FC<{ 
  isDisabled: boolean; 
  toggleBottomSheet: () => void; 
  handleFilterClick: () => void; 
  resetSimpleFilter: () => void; 
  onSimpleFilterChange: (filter: string) => void;
  onSearchChange: (filter: string) => void;
  
}> = ({ isDisabled, toggleBottomSheet, handleFilterClick, resetSimpleFilter, onSimpleFilterChange, onSearchChange }) => {
  return (
    <View style={styles.containerTop}>
      <View style={styles.searchFilterRow}>
        <View style={styles.searchBarContainer}>
          <SearchBar disabled={isDisabled}   onSearchChange={(search) => {onSearchChange(search);}} />
        </View>
        <Filter toggleBottomSheet={toggleBottomSheet} onFilterClick={handleFilterClick} />
      </View>
      <View style={styles.simpleFilterContainer}>
        <SimpleFilter disable={isDisabled} reset={resetSimpleFilter} onSimpleFilterChange={onSimpleFilterChange} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 16,
    width: '100%',
  },
});

export default AllFilter;
