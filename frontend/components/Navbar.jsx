import { Button, StyleSheet, Text, View } from 'react-native';
import { addUser } from '../services/firestore.js';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {

    const navigation = useNavigation();

    const handlePress = (dest) => {
        navigation.navigate(dest);
    }

    return (
        <View style={styles.container}>
            <Button onPress={() => handlePress('Home')} title="home"/>
            <Button onPress={() => handlePress('SelectedPost')} title="selected post"/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // Set background color if necessary
    },
});

export default Navbar;
