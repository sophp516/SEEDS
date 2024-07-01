import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx';
import Filter from '../components/Filter.tsx';

const Discover = () => {
  const bottomSheetRef = useRef(null);
  return (
    <View style={styles.outerContainer}>

      <View style={styles.containerTop}>
        <View style={styles.searchFilterRow}>

          <View style={styles.searchBarContainer}>
            <SearchBar />
          </View>

          <View>
            <Filter
              items={['Shellfish', 'fish', 'Sushi', 'Pasta', 'Salad', 'Sandwich', 'Soup', 'Dessert', 'Drink']}
              onFilter={(filteredItems) => console.log('Filtered Items:', filteredItems)}
              isBottomSheetOpen={false}
            />
          </View>
          
        </View>
      </View>


      <Text style={styles.text}>Discover</Text>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  containerTop: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 25,
  },
  searchFilterRow: {
    justifyContent: 'flex-start',
    flex: 0,
    flexDirection: 'row',
  },
  searchBarContainer: {
    flex: 1,
  },

  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Discover;