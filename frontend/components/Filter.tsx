import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import colors from '../styles';

interface FilterProps {
  toggleBottomSheet: () => void;
}

const Filter: React.FC<FilterProps> = ({ toggleBottomSheet }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleBottomSheet} style={styles.button}>
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
    borderRadius: 10, 
  },
  filterIcon: {
    margin: 5,
    height: 20,
    width: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.inputGray,
    padding: 3,
    borderRadius: 15,
    marginBottom: -15,
  },
});

export default Filter;
