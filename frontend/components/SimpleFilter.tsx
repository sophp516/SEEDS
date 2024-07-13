import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../styles';
import Preferences from '../services/Preferences.json';

interface SimpleFilterProps {
  disable: boolean; // Prop to disable buttons
  reset: () => void; // rest the filter if needed (for when disabling the SimpleFilter when Filter is click)
}

const SimpleFilter: React.FC<SimpleFilterProps> = ({ disable, reset }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handlePress = (item: string) => {
    if (disable) return;

    if (selectedFilter === item) {
      setSelectedFilter(null); // Deselect the item
    } else {
      setSelectedFilter(item); // Select the item and log it
      console.log(item);
    }
  };

  // Effect to reset the selected filter when filter is clicked
  useEffect(() => {
    if (disable) {
      setSelectedFilter(null); 
    }
  }, [disable]);

  return (
    <ScrollView horizontal={true} style={styles.scrollContainer}>
      <View style={styles.container}>
        {Preferences.id.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.button,
              selectedFilter === item && styles.selectedButton
            ]}
            onPress={() => handlePress(item)}
            disabled={disable} // Disable button based on prop
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
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.inputGray,
    paddingVertical: 10,
    paddingHorizontal: 15,
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
