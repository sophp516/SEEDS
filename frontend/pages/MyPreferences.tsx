import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/authContext.js';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firestore.js';
import Toast from 'react-native-toast-message';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';


type RootStackParamList = {
  Profile: undefined;
};

const MyPreferences = () => {
  const { user } = useAuth();
  const { loggedInUser, displayName } = user;
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const userId = loggedInUser.uid;
        if (!userId) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'User not found.',
          });
          return;
        }
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();

          if (userData.tags && Array.isArray(userData.tags)) {
            setTags(userData.tags);
          } else {
            setTags([]);
          }
          if (userData.allergies && Array.isArray(userData.allergies)) {
            setAllergies(userData.allergies);
          } else {
            setAllergies([]);
          }
        } else {
          setTags([]);
          setAllergies([]);
        }
      } catch (e) {
        console.error('Error fetching tags:', e);
      }
    };

    if (loggedInUser) {
      fetchTags();
    }
  }, [loggedInUser]);

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleDeleteAllergy = (index: number) => {
    const newAllergies = allergies.filter((_, i) => i !== index);
    setAllergies(newAllergies);
  };

  const handleSavePreferences = async () => {
    try {
      const userId = loggedInUser.uid;
      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not found.',
        });
        return;
      }
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        tags: tags,
      });
      setEditingPreferences(false);
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  const handleSaveAllergies = async () => {
    try {
      const userId = loggedInUser.uid;
      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not found.',
        });
        return;
      }
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        allergies: allergies,
      });
      setEditingAllergies(false);
    } catch (e) {
      console.error('Error saving allergies:', e);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </TouchableOpacity>

      <Text style={styles.text}>My Preferences</Text>

      <View>
        <Text style={styles.sectionHeader}>Preferences</Text>
        {editingPreferences ? (
          <View style={styles.editingContainer}>
            <View style={styles.tagList}>
              {tags.map((tag, i) => (
                <View style={styles.tagWithDelete} key={i}>
                  <Text>{tag}</Text>
                  <TouchableOpacity onPress={() => handleDeleteTag(i)}>
                    <Text style={styles.tagDeleteButton}>x</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.tagContainer}>
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a new preference"
              />
              <TouchableOpacity onPress={handleAddTag} style={styles.editProfileButton}>
                <Text>Add Preference</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.saveCancelContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences}>
                <Text>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingPreferences(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.displayContainer}>
            <View style={styles.tagList}>
              {tags.map((tag, i) => (
                <View style={styles.tagWithDelete} key={i}>
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setEditingPreferences(true)}>
              <Text>Edit Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionHeader}>Allergens</Text>
        {editingAllergies ? (
          <View style={styles.editingContainer}>
            <View style={styles.tagList}>
              {allergies.map((allergy, i) => (
                <View style={styles.tagWithDelete} key={i}>
                  <Text>{allergy}</Text>
                  <TouchableOpacity onPress={() => handleDeleteAllergy(i)}>
                    <Text style={styles.tagDeleteButton}>x</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.tagContainer}>
              <TextInput
                style={styles.tagInput}
                value={allergyInput}
                onChangeText={setAllergyInput}
                placeholder="Add a new allergy"
              />
              <TouchableOpacity onPress={handleAddAllergy} style={styles.editProfileButton}>
                <Text>Add Allergy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.saveCancelContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAllergies}>
                <Text>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingAllergies(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.displayContainer}>
            <View style={styles.tagList}>
              {allergies.map((allergy, i) => (
                <View style={styles.tagWithDelete} key={i}>
                  <Text>{allergy}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={() => setEditingAllergies(true)}>
              <Text>Edit Allergens</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Adjust the top padding as needed
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  text: {
    fontSize: 24, // Adjust the size as needed
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
  },
  editingContainer: {
    marginBottom: 20,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagWithDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', // Light gray background color
    padding: 8,
    borderRadius: 15, // Rounded edges
    marginRight: 5,
    marginBottom: 5,
  },
  tagDeleteButton: {
    marginLeft: 10,
    color: 'red',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    padding: 8,
    flex: 1,
  },
  editProfileButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  saveCancelContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
  },
  displayContainer: {
    marginBottom: 20,
  },
});

export default MyPreferences;
