import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';
import colors from '../styles';

interface SearchBarProps {
  disabled: boolean; // Prop to control if the search bar is disabled
}

const SearchBar: React.FC<SearchBarProps> = ({ disabled }) => {
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
          editable={!disabled} // Disable input based on the prop
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10, 
    marginTop: 25,
  },
  searchSection: {
    flex: 1, 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 20,
    height: 35,
    marginRight: 10,
    backgroundColor: colors.inputGray,
  },
  searchIcon: {
    padding: 8,
    margin: 10,
    height: 15,
    width: 15,
  },
  textInput: {
    flex: 1,
    height: 40,
  },
});

export default SearchBar;
