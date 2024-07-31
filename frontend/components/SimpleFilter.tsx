import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import colors from '../styles';
import Preferences from '../services/Preferences.json';

interface SimpleFilterProps {
  disable: boolean; // Prop to disable buttons
  reset: () => void; // Reset the filter if needed
  onSimpleFilterChange: (filter: string) => void;
}

const SimpleFilter: React.FC<SimpleFilterProps> = ({ disable, reset, onSimpleFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

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
    <Animated.ScrollView
      horizontal
      style={styles.scrollContainer}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
      )}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Meal Options */}
        {['Breakfast', 'Lunch', 'Dinner'].map((meal, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              { marginLeft: index === 0 ? 20 : 5 }, // Apply margin only to the first item
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
              { marginLeft: 5 }, // Apply consistent margin to all items
              selectedFilter === item && styles.selectedButton
            ]}
            onPress={() => handlePress(item)}
            disabled={disable}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.ScrollView>
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginHorizontal: 5, // Consistent margin for all items
  },
  selectedButton: {
    backgroundColor: colors.grayStroke,
    borderColor: colors.grayStroke,
  },
  buttonText: {
    fontFamily: 'Satoshi-Medium',
    color: colors.textGray,
    fontSize: 14,
  },
});

export default SimpleFilter;
