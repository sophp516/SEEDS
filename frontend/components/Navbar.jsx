import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {

    const navigation = useNavigation();

    const handlePress = (dest) => {
        navigation.navigate(dest);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => handlePress('Home')} style={styles.button}>
                <Text style={styles.buttonText}>home</Text>
            </TouchableOpacity> 
            <TouchableOpacity onPress={() => handlePress('Post')} style={styles.button}>
                <Text style={styles.buttonText}>post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('Discover')} style={styles.button}>
                <Text style={styles.buttonText}>discover</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('Profile')} style={styles.button}>
                <Text style={styles.buttonText}>profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePress('SignUp')} style={styles.button}>
                <Text style={styles.buttonText}>SignUp</Text>
            </TouchableOpacity>
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
        backgroundColor: 'gray', 
        paddingTop: 20, 
        paddingBottom: 20,
        borderTopWidth: 1,
    },
    button: {
        padding: 10,
    },
    buttonText: {
        color: 'white',
    },
});

export default Navbar;
