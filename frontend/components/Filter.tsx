import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import colors from '../styles';

interface FilterProps {
  toggleBottomSheet: () => void;
  onFilterClick: () => void; // New prop for the filter click handler
}

const Filter: React.FC<FilterProps> = ({ toggleBottomSheet, onFilterClick }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          toggleBottomSheet();
          onFilterClick(); // Call the onFilterClick function
        }}
        style={styles.button}
      >
        <Image source={require('../assets/filter.png')} style={styles.filterIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 15,
  },
  filterIcon: {
    margin: 5,
    height: 20,
    width: 20,
    // alignItems: 'center',
  },
  button: {
    backgroundColor: colors.inputGray,
    padding: 3,
    width: 45,
    borderRadius: 15,
    marginBottom: -15,
    alignItems: 'center',
  },
});

export default Filter;
