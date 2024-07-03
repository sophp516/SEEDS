import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../styles';

const Navbar = () => {

    const navigation = useNavigation();

    const handlePress = (dest) => {
        navigation.navigate(dest);
        //changing the styling to orange if the button is pressed
        //document.getElementById(dest).style.backgroundColor = 'orange';
    }


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => handlePress('Home')} style={styles.button}>
                <Image
                  source={require('../assets/home.png')}
                  style={styles.Icon}
                />
                <Text style={styles.buttonText}>Home</Text>
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => handlePress('Discover')} style={styles.button}>
                <Image
                  source={require('../assets/search.png')}
                  style={styles.Icon}
                />
                <Text style={styles.buttonText}>Discover</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('Post')} style={styles.button}>
                <Image
                  source={require('../assets/plus.png')}
                  style={styles.Icon}
                />
                <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('Ranking')} style={styles.button}>
                <Image
                  source={require('../assets/ranking.png')}
                  style={styles.Icon}
                />
                <Text style={styles.buttonText}>Ranking</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('Profile')} style={styles.button}>
                <Image
                  source={require('../assets/user.png')}
                  style={styles.Icon}
                />
                <Text style={styles.buttonText}>Profile</Text>
            </TouchableOpacity>
            {/*<TouchableOpacity onPress={() => handlePress('SignUp')} style={styles.button}>
                <Text style={styles.buttonText}>SignUp</Text>
            </TouchableOpacity>*/}
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
  },
  buttonText: {
      color: 'black',
  },
  Icon: {
      width: 25,
      height: 25,
      margin: 'auto' 
  },
    
});

export default Navbar;
