import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [editingAllergies, setEditingAllergies] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [allergensInput, setAllergensInput] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  console.log(tags)

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            if (!user) return;
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('id', '==', user?.id));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                console.log(userData)

                if (userData.tags && Array.isArray(userData.tags)) {
                  setTags(userData.tags);
                } else {
                  setTags([]);
                }
                if (userData.allergens && Array.isArray(userData.allergens)) {
                  setAllergens(userData.allergens);
                } else {
                  setAllergens([]);
                }
            } else {
              setTags([]);
              setAllergens([]);
            }
        } catch (err) {
            console.log(err);
        } finally {
          setLoading(false)
        }
    };

    fetchUserData();
}, []);

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
    if (allergensInput.trim()) {
      setAllergens([...allergens, allergensInput.trim()]);
      setAllergensInput('');
    }
  };

  const handleDeleteAllergy = (index: number) => {
    const newAllergies = allergens.filter((_, i) => i !== index);
    setAllergens(newAllergies);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    try {
      const userId = user.id;
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
      const userId = user?.id;
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
        allergens: allergens,
      });
      setEditingAllergies(false);
    } catch (e) {
      console.error('Error saving allergies:', e);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
        <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My Preferences</Text>
      <Text style={styles.subheader}>Track your dietary preferences and allergies.</Text>

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
              {allergens.map((allergy, i) => (
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
                value={allergensInput}
                onChangeText={setAllergensInput}
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
              {allergens.map((allergy, i) => (
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
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: colors.backgroundGray,
  },
  backButtonContainer: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    width: 20,
    height: 20,
    marginRight: 10, // space between icon and text
  },
  backButtonText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 16,
    color: colors.textGray,
  },
  header: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 24,
    color: colors.textGray,
    marginTop: 40,
    // marginLeft: 5,
  },
  subheader: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    // textAlign: 'center',
    color: colors.textGray,
    marginTop: 10,
    marginBottom: 40,
  },
  text: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: colors.textGray,
    marginTop: 30,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
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
