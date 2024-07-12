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
  
  const [preferredOpen, setPreferredOpen] = useState(false);
  const [preferredValue, setPreferredValue] = useState(['italy', 'spain', 'barcelona', 'finland']);
  const [preferredItems, setPreferredItems] = useState([
    {label: 'Spain', value: 'spain'},
    {label: 'Madrid', value: 'madrid', parent: 'spain'},
    {label: 'Barcelona', value: 'barcelona', parent: 'spain'},
    {label: 'Italy', value: 'italy'},
    {label: 'Rome', value: 'rome', parent: 'italy'},
    {label: 'Finland', value: 'finland'}
  ]);

  const [avoidOpen, setAvoidOpen] = useState(false);
  const [avoidValue, setAvoidValue] = useState([]);
  const [avoidItems, setAvoidItems] = useState([
    {label: 'Pizza', value: 'pizza'},
    {label: 'Burger', value: 'burger'},
    {label: 'Sushi', value: 'sushi'},
    {label: 'Pasta', value: 'pasta'}
  ]);

  const [timeOpen, setTimeOpen] = useState(false);
  const [timeValue, setTimeValue] = useState([]);
  const [timeItems, setTimeItems] = useState([
    {label: 'Breakfast', value: 'breakfast'},
    {label: 'Lunch', value: 'lunch'},
    {label: 'Dinner', value: 'dinner'},
  ]);

  const handleApplyFilter = () => {
    console.log('Preferred:', preferredValue.join(', ') || 'none');
    console.log('Avoid:', avoidValue.join(', ') || 'none');
    console.log('Time:', timeValue.join(', ') || 'none');
    setIsVisible(false); // Close the bottom sheet for now after applying filter
  };

  const handleReset = () => {
    setPreferredValue([]);
    setAvoidValue([]);
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
      enablePanDownToClose={true}
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
          <Text style={styles.contentText}>Preferred</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            open={preferredOpen}
            value={preferredValue}
            items={preferredItems}
            setOpen={setPreferredOpen}
            setValue={setPreferredValue}
            setItems={setPreferredItems}
            theme="LIGHT"
            multiple={true}
            mode="BADGE"
            listMode="SCROLLVIEW"
            dropDownDirection = "BOTTOM"
            badgeDotColors={["#8ac926"]}
            containerProps={{
              style: {
                zIndex: preferredOpen ? 10 : 1
              }
            }}
          />

          
          <Text style={styles.contentText}>Avoid</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            open={avoidOpen}
            value={avoidValue}
            items={avoidItems}
            setOpen={setAvoidOpen}
            setValue={setAvoidValue}
            setItems={setAvoidItems}
            theme="LIGHT"
            multiple={true}
            mode="BADGE"
            listMode="SCROLLVIEW"
            dropDownDirection = "BOTTOM"
            badgeDotColors={["#e76f51"]}
            containerProps={{
              style: {
                zIndex: avoidOpen ? 10 : 1
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
            badgeDotColors={["#e9c46a"]}
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
    backgroundColor: "white",
    marginVertical: 10,
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 40,
    borderColor: colors.grayStroke,
  },


});

export default FilterContent;
