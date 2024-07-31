import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firestore.js'; // Adjust the path if needed
import { useAuth } from '../context/authContext.js'; // Adjust the path if needed
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Navbar from '../components/Navbar.jsx';
import colors from '../styles.js';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

type RootStackParamList = {
  Profile: undefined;
};

const MyProfile = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, setLoggedInUser } = useAuth();
  const { loggedInUser, displayName, email } = user;

  // State for username
  const [editingUsername, setEditingUsername] = useState(false);
  const [nameInput, setNameInput] = useState(displayName || '');

  // State for email
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(email || '');

  // State for profile image
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
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
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setNameInput(userData.displayName || '');
          setEmailInput(userData.email || '');
          setProfileImage(userData.profileImage || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user.id) {
      fetchUserData();
    }
  }, [loggedInUser]);

  const handleSaveUsername = async () => {
    try {
      const userId = user.id;

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

      setEditingUsername(false);
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

  const handleSaveEmail = async () => {
    try {
      const userId = user.id;

      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No user is currently logged in.',
        });
        return;
      }

      if (!emailInput) {
        Toast.show({
          type: 'error',
          text1: 'Email Missing',
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

      await updateDoc(userDocRef, { email: emailInput });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully!',
      });

      setEditingEmail(false);
      setLoggedInUser(prev => ({
        ...prev,
        email: emailInput,
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setProfileImage(selectedImageUri);

      // Upload image to Firebase Storage
      const imageUrl = await handleUploadImage(selectedImageUri);

      if (imageUrl) {
        // Update Firestore with the new image URL
        await saveProfileImage(imageUrl);
      }
    }
  };

  const handleUploadImage = async (imageUri: string) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const imgName = `img-${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}`;
      const storageRef = ref(storage, `images/${imgName}.jpg`);
      await uploadBytesResumable(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image to Firebase Storage", error);
      return null;
    }
  };

  const saveProfileImage = async (imageUrl: string) => {
    try {
      const userId = user.id;

      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'No user is currently logged in.',
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

      await updateDoc(userDocRef, { profileImage: imageUrl });

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile image has been updated successfully!',
      });

      setLoggedInUser(prev => ({
        ...prev,
        profileImage: imageUrl,
      }));
    } catch (error) {
      console.error('Error updating profile image:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'There was an error updating your profile image. Please try again later.',
      });
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
        <Image style={styles.backArrow} source={require('../assets/backArrow.png')} resizeMode="contain"/>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.header}>My Profile</Text>
      
      <View style={styles.profileImageWrapper}>
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
              <Image
              source={profileImage ? { uri: profileImage } : require('../assets/defaultProfileImage.png')}
              style={styles.profileImage}
              />
                <View style={{alignItems: 'center', marginTop: 5}}>
          <Text style={{fontFamily: 'Satoshi-Medium', color: colors.textGray}}>Edit</Text>
        </View>
          </TouchableOpacity>
        </View>
      
      </View>
      

      <Text style={styles.text}>Username</Text>
      <View style={styles.usernameContainer}>
        <TextInput
          style={styles.inputName}
          value={nameInput}
          editable={editingUsername}
          onChangeText={setNameInput}
          placeholder="Enter your display name"
        />
        {editingUsername ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUsername}>
              <Text style={styles.editText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingUsername(false)}>
              <Text style={styles.editText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditingUsername(true)}>
            <Image source={require('../assets/pencil.png')} style={{ width: 15, height: 15 }} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.text}>Email</Text>
      <View style={styles.usernameContainer}>
        <TextInput
          style={styles.inputName}
          value={emailInput}
          editable={editingEmail}
          onChangeText={setEmailInput}
          placeholder="Enter your email"
        />
        {editingEmail ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmail}>
              <Text style={styles.editText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingEmail(false)}>
              <Text style={styles.editText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditingEmail(true)}>
            <Image source={require('../assets/pencil.png')} style={{ width: 15, height: 15 }} />
          </TouchableOpacity>
        )}
      </View>

      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    paddingHorizontal: 30,
    
  },
  backButtonContainer: {
    marginTop: 50,
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
  profileImageWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageContainer: {
    borderRadius: 100,
    // padding: 20, 
    alignItems: 'center',
  },
  profileImage: {
    borderRadius: 100,
    resizeMode: 'cover',
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: colors.textGray,
    marginTop: 30,
  },
  // homeHeaderTop: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-start',
  //   alignItems: 'center',
  //   paddingVertical: 20,
  //   marginTop: 20, // Move the header down
  // },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  inputName: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: colors.textGray,
    backgroundColor: colors.navbarBackground,
    borderRadius: 10,
    padding: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  editButton: {
    backgroundColor: colors.navbarBackground,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: colors.navbarBackground,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: colors.navbarBackground,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  editText: {
    fontFamily: 'Satoshi-Medium',
    fontSize: 14,
    color: colors.textGray,
  },
});

export default MyProfile;
