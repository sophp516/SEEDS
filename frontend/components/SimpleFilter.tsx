import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../styles';
import Preferences from '../services/Preferences.json';

interface SimpleFilterProps {
  disable: boolean; // Prop to disable buttons
  reset: () => void; // Reset the filter if needed
  onSimpleFilterChange: (filter: string) => void;
}

const SimpleFilter: React.FC<SimpleFilterProps> = ({ disable, reset, onSimpleFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handlePress = (item: string) => {
    if (disable) return;

    setSelectedFilter(prev => {
      const newFilter = prev === item ? '' : item;
      onSimpleFilterChange(newFilter);
      return newFilter;
    });
    
    
  };

  // Effect to reset the selected filter when the filter is clicked
  useEffect(() => {
    if (disable) {
      setSelectedFilter(null);
    }
  }, [disable]);

  return (
    <ScrollView horizontal={true} style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Meal Options */}
        {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              selectedFilter === meal && styles.selectedButton
            ]}
            onPress={() => handlePress(meal)}
            disabled={disable}
          >
            <Text style={styles.buttonText}>{meal}</Text>
          </TouchableOpacity>
        ))}

        {/* Preferences Options */}
        {Preferences.id.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              selectedFilter === item && styles.selectedButton
            ]}
            onPress={() => handlePress(item)}
            disabled={disable}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.inputGray,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    backgroundColor: colors.grayStroke,
    borderColor: colors.grayStroke,
  },
  buttonText: {
    color: colors.textGray,
    fontFamily: 'Satoshi-Regular'
  },
});

export default SimpleFilter;
