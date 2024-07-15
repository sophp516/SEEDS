import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../styles';
import Preferences from '../services/Preferences.json';

interface SimpleFilterProps {
  disable: boolean; // Prop to disable buttons
  reset: () => void; // Reset the filter if needed
}

const SimpleFilter: React.FC<SimpleFilterProps> = ({ disable, reset }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handlePress = (item: string) => {
    if (disable) return;

    setSelectedFilter(prev => (prev === item ? null : item));
    if (selectedFilter !== item) {
      console.log(item); // Log the selected item
    }
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
    backgroundColor: colors.orangeHighlight,
    borderColor: colors.orangeHighlight,
  },
  buttonText: {
    color: 'black',
  },
});

export default SimpleFilter;
