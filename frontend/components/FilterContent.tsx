import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet'; 
import DropDownPicker from 'react-native-dropdown-picker';
import colors from '../styles.js';
import Preferences from '../services/Preferences.json';
import Toast from 'react-native-toast-message';

interface FilterContentProps {
  onFilter: (filters: { preferred: string[], allergens: string[], time: string[] }) => void;
  isVisible: boolean; // have two isVisible to control visibility from another component
  setIsVisible: (visible: boolean) => void; 
}

const FilterContent: React.FC<FilterContentProps> = ({ onFilter, isVisible, setIsVisible }) => {
  const bottomSheetRef = useRef(null);
  const [ preferences, setPreferences ] = useState(Preferences);
  
  const [preferredOpen, setPreferredOpen] = useState(false);
  const [preferredValue, setPreferredValue] = useState([]);
  const [preferredItems, setPreferredItems] = useState([
  ]);

  const [allergensOpen, setAllergensOpen] = useState(false);
  const [allergensValue, setAllergensValue] = useState([]);
  const [allergensItems, setAllergensItems] = useState([
  ]);

  const [timeOpen, setTimeOpen] = useState(false);
  const [timeValue, setTimeValue] = useState([]);
  const [timeItems, setTimeItems] = useState([
    {label: 'Breakfast', value: 'Breakfast'},
    {label: 'Lunch', value: 'Lunch'},
    {label: 'Dinner', value: 'Dinner'},
  ]);

  // Set the preferred and allergens items from the preferences.json
  // this library have to use useEffect to set the items
  useEffect(() => {
    const items = preferences.id.map(item => ({
      label: item,
      value: item,
    }));
    setPreferredItems(items);
    setAllergensItems(items);
  }, [preferences]);


  // Function to handle the filter application 
  // if the user select the same item in both preferred and allergens, it will show an error message
  const handleApplyFilter = () => {
    const overlappingValues = preferredValue.filter(value => allergensValue.includes(value));
    
    if (overlappingValues.length > 0) {
      const errorMessage = `Duplicates in Preferred & allergens: ${overlappingValues.join(', ')}`;
      Toast.show({
        type: 'error',
        text1: 'Error: Overlapping Selections',
        text2: errorMessage, 
      });
    } else {
      const filters = {
        preferred: preferredValue,
        allergens: allergensValue,
        time: timeValue,
      };
      onFilter(filters); // Pass filters back to DiningHome
      setIsVisible(false); // Close the bottom sheet after applying the filter
    }
  };
  
  

  const handleReset = () => {
    setPreferredValue([]);
    setAllergensValue([]);
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
      style={styles.BottomSheetStyle}
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
            badgeDotColors={[colors.highRating]}
            containerProps={{
              style: {
                zIndex: preferredOpen ? 10 : 1
              }
            }}
          />

          
          <Text style={styles.contentText}>Allergens</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            open={allergensOpen}
            value={allergensValue}
            items={allergensItems}
            setOpen={setAllergensOpen}
            setValue={setAllergensValue}
            setItems={setAllergensItems}
            theme="LIGHT"
            multiple={true}
            mode="BADGE"
            listMode="SCROLLVIEW"
            dropDownDirection = "BOTTOM"
            badgeDotColors={[colors.warningPink]}
            containerProps={{
              style: {
                zIndex: allergensOpen ? 10 : 1
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
    paddingBottom: 10,
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
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3, 
    shadowRadius: 4, 

  },
  BottomSheetStyle: {
    shadowColor: '#000', 
    shadowOffset: {
      width: 0,
      height: 2, 
    },
    shadowOpacity: 0.8, 
    shadowRadius: 40, 
  },


});

export default FilterContent;
