import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../styles';
import SvgIcon from './SvgIcon';

const Navbar = () => {
    
    const selectedColor = '#E36609';
    const unselectedColor = 'black';

    const navigation = useNavigation();
    const route = useRoute();

    const handlePress = (dest) => {
        navigation.navigate(dest);
    }

    return (
      //changing the color of the navbar base on current routing
      <View style={styles.container}>
      {['Home', 'Discover', 'Post', 'Ranking', 'Profile'].map((dest) => (
          <TouchableOpacity key={dest} onPress={() => handlePress(dest)} style={styles.button}>
              <SvgIcon iconName={dest} color={route.name === dest? selectedColor : unselectedColor} />
              <Text style={[styles.buttonText, {color: route.name === dest ? selectedColor : unselectedColor }]}>{dest}</Text>
          </TouchableOpacity>
      ))}
       </View>
    )
}

const styles = StyleSheet.create({
  container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: colors.navbarBackground, 
      paddingTop: 5, 
      paddingBottom: 5,
      paddingLeft: 10,
      paddingRight: 10,
      shadowColor: 'black',
      shadowOpacity: 0.30,
      shadowRadius: 3.84,
  },
  button: {
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
  },
  buttonText: {
      color: 'black',
  },
    
});

export default Navbar;
