import React, { useState } from 'react';
import { View, TextInput, Image, StyleSheet } from 'react-native';
import Filter from './Filter';

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

      <Filter
        items={['Shellfish', 'fish', 'Sushi', 'Pasta', 'Salad', 'Sandwich', 'Soup', 'Dessert', 'Drink']}
        onFilter={(filteredItems) => console.log('Filtered Items:', filteredItems)}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10, 
    marginTop: 25,
  },
  searchSection: {
    flex: 8, 
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 20,
    height: 40,
    marginRight: 10,
  },
  searchIcon: {
    padding: 10,
    margin: 5,
    height: 20,
    width: 20,
  },
  textInput: {
    flex: 1,
    height: 40,

  },
});

export default SearchBar;
