import { View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import colors from '../styles';

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
  toggleBottomSheet: () => void;
}

const Filter: React.FC<FilterProps> = ({ items, onFilter, toggleBottomSheet }) => {

  // To-Do: connect with firebase and Perform filter logic here
  // const applyFilter = () => {
  //   const filteredItems = items.filter(item =>
  //     item.toLowerCase().includes(filterText.toLowerCase())
  //   );
  //   onFilter(filteredItems);
  // };



  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => {
          //apply filter logic
          toggleBottomSheet();
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
    alignItems: 'flex-end',
    borderRadius: 10, 
  },
  filterIcon: {
    margin: 5,
    height: 20,
    width: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.inputGray,
    padding: 5,
    borderRadius: 15,
    marginBottom: -15,
  },
});
export default Filter;