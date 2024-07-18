import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Profile: undefined;
};

const MyActivity = () => {
  const [postHistory, setPostHistory] = useState(true); // State for toggling between My Posts and Favorites

  const handleTogglePosts = () => {
    setPostHistory(true);
  };

  const handleToggleFavorites = () => {
    setPostHistory(false);
  };

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.homeHeaderTop}>
        <TouchableOpacity onPress={navigateToProfile}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.text}>MyActivity</Text>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, postHistory ? styles.activeButton : null]}
          onPress={handleTogglePosts}
        >
          <Text>My Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !postHistory ? styles.activeButton : null]}
          onPress={handleToggleFavorites}
        >
          <Text>Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Placeholder for content based on toggle state */}
      {postHistory ? (
        <Text>My Posts Content Here</Text>
      ) : (
        <Text>Favorites Content Here</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  toggleButton: {
    paddingHorizontal: 50,
    paddingVertical: 10,
    backgroundColor: '#d9d9d9',
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'gray',
  },
});

export default MyActivity;