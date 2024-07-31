import React, { useRef, useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet'; 
import DropDownPicker from 'react-native-dropdown-picker';
import colors from '../styles.js';
import Preferences from '../services/Preferences.json';
import Toast from 'react-native-toast-message';
import CustomSlider from './CustomSlider.tsx';
import { useAuth } from '../context/authContext.js';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firestore.js';

interface FilterContentProps {
  onFilter: (filters: { preferred: string[], allergens: string[], time: string[], taste: number, health: number }) => void;
  isVisible: boolean; // have two isVisible to control visibility from another component
  setIsVisible: (visible: boolean) => void; 
}

const FilterContent: React.FC<FilterContentProps> = ({ onFilter, isVisible, setIsVisible }) => {
  const bottomSheetRef = useRef(null);
  // for the user preferences filter
  const { user } = useAuth();
  const { loggedInUser, displayName } = user;
  const [fetchTags, setFetchTags] = useState<string[]>([]);
  const [fetchAllergies, setFetchAllergies] = useState<string[]>([]);

  const [ preferences, setPreferences ] = useState(Preferences);
  const [review, setReview] = useState({ taste: 1, health: 1 }); // Add this line
  
  
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
  useEffect(() => {
    const fetchTags = async () => {

      // Ensure preferences.id has a default value if not logged in
      //!! this has to be before the user.id check, or else guest account will not have the default preferences
      const items = (preferences.id || []).map(item => ({
        label: item,
        value: item,
      }));
      setPreferredItems(items);
      setAllergensItems(items);

      if (!user.id) return;
      try {
        const userId = user.id 

        if (userId) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('id', '==', userId));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
  
            if (userData.tags && Array.isArray(userData.tags)) {
              setFetchTags(userData.tags);
            } else {
              setFetchTags([]);
            }
            if (userData.allergens && Array.isArray(userData.allergens)) {
              setFetchAllergies(userData.allergens);
            } else {
              setFetchAllergies([]);
            }
          } else {
            setFetchTags([]);
            setFetchAllergies([]);
          }
        } else {
          // Handle the case where the user is not logged in
          setFetchTags([]);
          setFetchAllergies([]);
        }
      } catch (e) {
        console.error('Error fetching tags:', e);
      }
    };

    fetchTags();
    
  }, [loggedInUser, preferences.id]);
  
  

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
        taste: review.taste,
        health: review.health,
      };
      onFilter(filters); // Pass filters back to DiningHome
      setIsVisible(false); // Close the bottom sheet after applying the filter
    }
  };
  

  const handleReset = () => {
    setPreferredValue([]);
    setAllergensValue([]);
    setTimeValue([]);
    setReview({ taste: 1, health: 1 });
  };

  const handleMyPreferences = () => {
    const validTags = fetchTags.filter(tag => preferences.id.includes(tag));
    const validAllergies = fetchAllergies.filter(allergy => preferences.id.includes(allergy));

    setPreferredValue(validTags);
    setAllergensValue(validAllergies);
  }

  const snapPoints = useMemo(() => ['25%', '50%', '75%', '85%'], []); 

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
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
        <Text style={styles.filterHeader}>Filters</Text>
        <TouchableOpacity style={styles.bottomSheetButton} onPress={handleApplyFilter}>
          <Text style={styles.buttonText}>Apply </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <TouchableOpacity style={styles.bottomSheetButton} onPress={handleMyPreferences}>
          <View style={styles.myPreferencesButton}>
            <Text style={[styles.myPreferences]}>Use My Preferences</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.contentText}>Preferred</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            textStyle={styles.dropDownText}
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
            dropDownContainerStyle={styles.dropDownContainer} 
          />
          
          <Text style={styles.contentText}>Allergens</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            textStyle={styles.dropDownText}
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
            dropDownContainerStyle={styles.dropDownContainer} 
          />

          <Text style={styles.contentText}>Time</Text>
          <DropDownPicker
            style={styles.dropDownBox}
            textStyle={styles.dropDownText}
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
            dropDownContainerStyle={styles.dropDownContainer}
          />

          <View style={styles.sliderContainer}>
            <Text style={styles.contentText}>Taste</Text>
            <View style={styles.slider}> 
              <CustomSlider 
                minimumValue={1} 
                maximumValue={5}
                step={1}
                onValueChange={(value)=> setReview(prevReview => ({...prevReview, taste: value }))}
                value={review.taste}
                sliderColor='#F9A05F'
                trackColor='white'         
              />
              </View>
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.contentText}>Health</Text>
            <View style={styles.slider}> 
              <CustomSlider 
                minimumValue={1} 
                maximumValue={5}
                step={1}
                onValueChange={(value)=> setReview(prevReview => ({...prevReview, health: value }))}
                value={review.health}
                sliderColor='#7FB676'
                trackColor='white'         
              />
              </View>
          </View>
          
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
    borderBottomColor: colors.outlineDarkBrown,
  },
  bottomSheetButton: {
    marginTop: 10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 6,
  },
  filterHeader: {
    fontSize: 18,
    color: colors.textGray,
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
  },
  buttonText: {
    fontSize: 16,
    color: colors.textGray,
    textAlign: 'center',
    fontFamily: 'Satoshi-Medium',
  },
  myPreferencesButton: {
    borderRadius: 15,
    borderColor: colors.outlineBrown,
    borderWidth: 1,
    backgroundColor: colors.offWhite,
    marginLeft: 30,
    marginTop: 15,
    padding: 10,
    alignSelf: 'flex-start',
  },
  myPreferences: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
    color: colors.textGray,
  },
  content: {
    paddingBottom: 10,
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  contentText: {
    fontFamily: 'Satoshi-Bold',
    fontSize: 16, 
    color: colors.textGray,
    marginBottom: 0
  },
  dropDownBox: {
    flex: 1,
    backgroundColor: colors.offWhite,
    marginVertical: 10,
    color: colors.textGray,
    marginBottom: 40,
    borderColor: colors.outlineBrown,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.3, 
    // shadowRadius: 4, 
  },
  dropDownText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14, 
    color: colors.textGray,
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
  dropDownContainer: {
    marginTop: 10,
    borderColor: colors.outlineBrown,
  },
  sliderContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  slider: {
    marginTop: 10,
    marginBottom: 10,
  },

});

export default FilterContent;
