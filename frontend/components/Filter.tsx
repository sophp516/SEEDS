import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, Button } from 'react-native';

const foodCatergory: string[] = [
  'Shellfish',
  'fish',
  'Sushi',
  'Pasta',
  'Salad',
  'Sandwich',
  'Soup',
  'Dessert',
  'Drink',
];

// items: string[] - initial list of food catergory to filter
// onFilter: string[] - callback function to handle the filtered items when applied
interface FilterProps {
  items: string[];
  onFilter: (filteredItems: string[]) => void;
}

const Filter: React.FC<FilterProps> = ({ items, onFilter }) => {
  const [filterText, setFilterText] = useState('');

  // To-Do: connect with firebase and Perform filter logic here
  const applyFilter = () => {
    const filteredItems = items.filter(item =>
      item.toLowerCase().includes(filterText.toLowerCase())
    );
    onFilter(filteredItems);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => {
          setFilterText('');
          applyFilter()
        }} 
        style={styles.button}
      >
        <Image
          source={require('../assets/filter.png')}
          style={styles.filterIcon}
        />
      </TouchableOpacity> 

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
  filterIcon: {
    padding: 5,
    margin: 5,
    height: 20,
    width: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#D9D9E4',
    padding: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
});
export default Filter;