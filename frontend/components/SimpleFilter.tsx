import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../styles';
import Preferences from '../services/Preferences.json';

const SimpleFilter: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handlePress = (item: string) => {
    if (selectedFilter === item) {
      setSelectedFilter(null);  // Deselect the item
    } else {
      setSelectedFilter(item);  // Select the item and log it
      console.log(item);
    }
  };

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
