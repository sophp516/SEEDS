import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import colors from '../styles';
import SvgIcon from './SvgIcon';

const Navbar = () => {
    
    const selectedColor = '#E36609';
    const unselectedColor = colors.textGray;

    const navigation = useNavigation();
    const route = useRoute();

    const handlePress = (dest) => {
        navigation.navigate(dest);
    }

    //There is a bug occur where not all route is on nav bar change color
    //Function to determine if the current route is home
    const isHomeRouteSelected = () => {
      const homeRoutes = ['Home', 'DiningHome', 'SelectedMenu', 'OnTheMenu', 'TopRated', ];
      return homeRoutes.includes(route.name);
    };

    return (
      //changing the color of the navbar base on current routing
      //if the current route is home, the color will be selectedColor
      <View style={styles.container}>
      {['Home', 'Discover', 'Post', 'Ranking', 'Profile'].map((dest) => (
          <TouchableOpacity key={dest} onPress={() => handlePress(dest)} style={styles.button}>
      <SvgIcon iconName={dest} color={isHomeRouteSelected() && dest === 'Home' ? selectedColor : route.name === dest ? selectedColor : unselectedColor} />
      <Text style={[styles.buttonText, {color: isHomeRouteSelected() && dest === 'Home' ? selectedColor : route.name === dest ? selectedColor : unselectedColor }]}>{dest}</Text>
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
    paddingBottom: 9,
    paddingLeft: 10,
    paddingRight: 10,
    shadowColor: 'black',
    shadowOpacity: 0.15,
    shadowRadius: 3.9,
  },
  button: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Satoshi-Medium',
    color: colors.textGray,
  },
    
});

export default Navbar;
