import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet'; 
import DropDownPicker from 'react-native-dropdown-picker';
import colors from '../styles.js';

interface FilterContentProps {
  onFilter: (filteredItems: string[]) => void; // Function to handle filtered items maybe for later for fire base
  isVisible: boolean; // have two isVisible to control visibility from another component
  setIsVisible: (visible: boolean) => void; 
}

const FilterContent: React.FC<FilterContentProps> = ({ onFilter, isVisible, setIsVisible }) => {
  const bottomSheetRef = useRef(null);
  
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

  const [foodOpen, setFoodOpen] = useState(false);
  const [foodValue, setFoodValue] = useState([]);
  const [foodItems, setFoodItems] = useState([
    {label: 'Pizza', value: 'pizza'},
    {label: 'Burger', value: 'burger'},
    {label: 'Sushi', value: 'sushi'},
    {label: 'Pasta', value: 'pasta'}
  ]);

  const [timeOpen, setTimeOpen] = useState(false);
  const [timeValue, setTimeValue] = useState([]);
  const [timeItems, setTimeItems] = useState([
    {label: 'Morning', value: 'morning'},
    {label: 'Afternoon', value: 'afternoon'},
    {label: 'Evening', value: 'evening'},
    {label: 'Night', value: 'night'}
  ]);

  const handleApplyFilter = () => {
    console.log('Location:', locationValue.join(', ') || 'none');
    console.log('Food:', foodValue.join(', ') || 'none');
    console.log('Time:', timeValue.join(', ') || 'none');
    setIsVisible(false); // Close the bottom sheet for now after applying filter
  };

  const handleReset = () => {
    setLocationValue([]);
    setFoodValue([]);
    setTimeValue([]);
  };

  //TODO!!!!
  //Function to add my preferences from firebase and apply my preferences filter
  //also automatically apply perfered filter when user open the bottom sheet

  const snapPoints = useMemo(() => ['25%', '50%', '75%', '78%'], []); 

  //control the visibility of the bottom sheet
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  return (
    <BottomSheet
      backgroundStyle={{ backgroundColor: colors.inputGray }}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onClose={() => setIsVisible(false)}
    >
      <View style={styles.bottomSheetUpper}>
        <TouchableOpacity style={styles.bottomSheetButton} onPress={handleReset}>
          <Text style={styles.buttonText}>Rest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomSheetButton} onPress={() => console.log("perform Preferences")}>
          <Text style={[styles.buttonText, styles.fancy]}>My Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomSheetButton} onPress={handleApplyFilter}>
          <Text style={styles.buttonText}>Apply </Text>
        </TouchableOpacity>
      </View>

        
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.contentText}>Location</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            open={locationOpen}
            value={locationValue}
            items={locationItems}
            setOpen={setLocationOpen}
            setValue={setLocationValue}
            setItems={setLocationItems}
            theme="LIGHT"
            multiple={true}
            mode="BADGE"
            listMode="SCROLLVIEW"
            dropDownDirection = "BOTTOM"
            badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
            containerProps={{
              style: {
                zIndex: locationOpen ? 10 : 1
              }
            }}
          />

          
          <Text style={styles.contentText}>Food</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            open={foodOpen}
            value={foodValue}
            items={foodItems}
            setOpen={setFoodOpen}
            setValue={setFoodValue}
            setItems={setFoodItems}
            theme="LIGHT"
            multiple={true}
            mode="BADGE"
            listMode="SCROLLVIEW"
            dropDownDirection = "BOTTOM"
            badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
            containerProps={{
              style: {
                zIndex: foodOpen ? 10 : 1
              }
            }}
          />

          <Text style={styles.contentText}>Time</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            open={timeOpen}
            value={timeValue}
            items={timeItems}
            setOpen={setTimeOpen}
            setValue={setTimeValue}
            setItems={setTimeItems}
            theme="LIGHT"
            multiple={true}
            mode="BADGE"
            dropDownDirection = "BOTTOM"
            listMode="SCROLLVIEW"
            badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a", "#8ac926"]}
            containerProps={{
              style: {
                zIndex: timeOpen ? 10 : 1
              }
            }}
          />

        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetUpper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    paddingRight: 20,
    paddingLeft: 20,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayStroke,

  },
  bottomSheetButton: {
    marginTop: 10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    
  },
  fancy: {
    fontWeight: 'bold',
    
  },

  content: {
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  contentText: {
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 0
  },
  dropDownBox: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 26,
    marginVertical: 10,
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 40,
    borderColor: colors.grayStroke,
  },


});

export default FilterContent;
