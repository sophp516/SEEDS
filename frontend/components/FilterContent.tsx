import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet'; // Importing BottomSheet component
import DropDownPicker from 'react-native-dropdown-picker';

interface FilterContentProps {
  items: string[]; // List of items to filter
  onFilter: (filteredItems: string[]) => void; // Function to handle filtered items
  isVisible: boolean; // Boolean to control visibility of the bottom sheet
  setIsVisible: (visible: boolean) => void; // Function to set visibility
}

const FilterContent: React.FC<FilterContentProps> = ({ items, onFilter, isVisible, setIsVisible }) => {
  const bottomSheetRef = useRef(null); // Ref for the BottomSheet
  const [filterText, setFilterText] = useState(''); // State for the filter text
  
  // State for the location dropdown
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationValue, setLocationValue] = useState(['italy', 'spain', 'barcelona', 'finland']);
  const [locationItems, setLocationItems] = useState([
    {label: 'Spain', value: 'spain'},
    {label: 'Madrid', value: 'madrid', parent: 'spain'},
    {label: 'Barcelona', value: 'barcelona', parent: 'spain'},
    {label: 'Italy', value: 'italy'},
    {label: 'Rome', value: 'rome', parent: 'italy'},
    {label: 'Finland', value: 'finland'}
  ]);

  // State for the food dropdown
  const [foodOpen, setFoodOpen] = useState(false);
  const [foodValue, setFoodValue] = useState([]);
  const [foodItems, setFoodItems] = useState([
    {label: 'Pizza', value: 'pizza'},
    {label: 'Burger', value: 'burger'},
    {label: 'Sushi', value: 'sushi'},
    {label: 'Pasta', value: 'pasta'}
  ]);

  // State for the time dropdown
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeValue, setTimeValue] = useState([]);
  const [timeItems, setTimeItems] = useState([
    {label: 'Morning', value: 'morning'},
    {label: 'Afternoon', value: 'afternoon'},
    {label: 'Evening', value: 'evening'},
    {label: 'Night', value: 'night'}
  ]);

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

  const snapPoints = useMemo(() => ['25%', '50%', '75%'], []); // Snap points for the bottom sheet

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
      backgroundStyle={{ backgroundColor: '#E7E2DB' }}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onClose={() => setIsVisible(false)}
    >
      <View style={styles.bottomSheetUpper}>
        <Text style={styles.bottomSheetText}>Filter</Text>
        <Button title="Apply Filter" onPress={handleApplyFilter} />
        <Text>____________________________________________________</Text>
      </View>
      
      <View style={styles.content}>
        <DropDownPicker
          style={styles.container}
          open={locationOpen}
          value={locationValue}
          items={locationItems}
          setOpen={setLocationOpen}
          setValue={setLocationValue}
          setItems={setLocationItems}
          theme="LIGHT"
          multiple={true}
          mode="BADGE"
          badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
          containerProps={{
            style: {
              zIndex: locationOpen ? 10 : 1
            }
          }}
        />

        <DropDownPicker
          style={styles.container}
          open={foodOpen}
          value={foodValue}
          items={foodItems}
          setOpen={setFoodOpen}
          setValue={setFoodValue}
          setItems={setFoodItems}
          theme="LIGHT"
          multiple={true}
          mode="BADGE"
          badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
          containerProps={{
            style: {
              zIndex: foodOpen ? 10 : 1
            }
          }}
        />

        <DropDownPicker
          style={styles.container}
          open={timeOpen}
          value={timeValue}
          items={timeItems}
          setOpen={setTimeOpen}
          setValue={setTimeValue}
          setItems={setTimeItems}
          theme="LIGHT"
          multiple={true}
          mode="BADGE"
          badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
          containerProps={{
            style: {
              zIndex: timeOpen ? 10 : 1
            }
          }}
        />

        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetText}>Filtering...</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter text"
            value={filterText}
            onChangeText={setFilterText}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",

    paddingVertical: 8,
    paddingHorizontal: 26,
    marginVertical: 20,
    color: "#000",
    fontSize: 14,
    fontWeight: "600"
  },
  content: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 40,
    
  },
  dropdownContainer: {
    marginVertical: 30,
    zIndex: 1000, // Ensures dropdowns don't overlap
  },
  bottomSheetContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  bottomSheetText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSheetUpper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    marginTop: 20,
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
