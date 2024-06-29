import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';

// SearchBar component: (functional component)
const SearchBar: React.FC = () => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    // !!To-Do: connect with firebase and Perform search logic here
    console.log('Searching for:', searchText);
  };


  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Image
          source={require('../assets/search.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10, 
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  searchIcon: {
    padding: 10,
    margin: 5,
    height: 20,
    width: 20,
    resizeMode: 'stretch',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,

  },
});

export default SearchBar;
