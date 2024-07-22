import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../services/firestore.js'; // Adjust the path if needed
import { useAuth } from '../context/authContext.js'; // Adjust the path if needed
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  Profile: undefined;
};

const MyProfile = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, setLoggedInUser } = useAuth();
  const { loggedInUser, displayName } = user;
  const [editingStatus, setEditingStatus] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || '');

  useEffect(() => {
    const fetchDisplayName = async () => {
      try {
        const userId = loggedInUser?.uid;
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
          setNameInput(userData.displayName || '');
        }
      } catch (error) {
        console.error('Error fetching displayName:', error);
      }
    };

    if (loggedInUser && !displayName) {
      fetchDisplayName();
    }
  }, [loggedInUser, displayName]);

  const handleEditToggle = () => {
    setNameInput(displayName || '');
    setEditingStatus(true);
  };

  const handleSaveProfile = async () => {
    try {
      const userId = loggedInUser?.uid;

      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No user is currently logged in.',
        });
        return;
      }

      if (!nameInput) {
        Toast.show({
          type: 'error',
          text1: 'Display Name Missing',
        });
        return;
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not found.',
        });
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userDocRef = userDoc.ref;

      await updateDoc(userDocRef, { displayName: nameInput });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully!',
      });

      setEditingStatus(false);
      // Optionally, update the displayName in the context
      setLoggedInUser(prev => ({
        ...prev,
        displayName: nameInput,
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'There was an error updating your profile. Please try again later.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.homeHeaderTop}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>

      {editingStatus ? (
        <View style={styles.editingContainer}>
          <TextInput
            style={styles.inputName}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your display name"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingStatus(false)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.text}>Display Name: {displayName || nameInput}</Text>
          <TouchableOpacity onPress={handleEditToggle}>
            <Text>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 20, // Move the header down
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  editingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputName: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 10,
    width: '60%',
  },
  saveButton: {
    backgroundColor: 'gray',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    margin: 5,
  },
  cancelButton: {
    backgroundColor: 'gray',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    margin: 5,
  },
});

export default MyProfile;
