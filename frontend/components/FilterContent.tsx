import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet'; // Importing BottomSheet component

interface FilterContentProps {
  items: string[]; // List of items to filter
  onFilter: (filteredItems: string[]) => void; // Function to handle filtered items
  isVisible: boolean; // Boolean to control visibility of the bottom sheet
  setIsVisible: (visible: boolean) => void; // Function to set visibility
}

const FilterContent: React.FC<FilterContentProps> = ({ items, onFilter, isVisible, setIsVisible }) => {
  const bottomSheetRef = useRef(null); // Ref for the BottomSheet
  const [filterText, setFilterText] = useState(''); // State for the filter text

  // Function to handle applying the filter
  const handleApplyFilter = () => {
    const filteredItems = items.filter(item =>
      item.toLowerCase().includes(filterText.toLowerCase())
    );
    onFilter(filteredItems);
    handleLogInput(filterText); // Log the input text
    setIsVisible(false); // Close the bottom sheet
  };

  // Function to log user input
  const handleLogInput = (input) => {
    console.log('User Input:', input);
  };

  const snapPoints = useMemo(() => ['25%', '50%', '70%'], []); // Snap points for the bottom sheet

  // Effect to control the visibility of the bottom sheet
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      backgroundStyle={{ backgroundColor: '#C7C7C7' }}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onClose={() => setIsVisible(false)}
    >
      <View style={styles.bottomSheetContainer}>
        <Text style={styles.bottomSheetText}>Filtering...</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter text"
          value={filterText}
          onChangeText={setFilterText}
        />
        <Button title="Apply Filter" onPress={handleApplyFilter} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  bottomSheetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
});

export default FilterContent;
