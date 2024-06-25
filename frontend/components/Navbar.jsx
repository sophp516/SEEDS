import { Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {

    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Home');
    }

    return (
        <View>
            <Button onPress={handlePress} title="home"/>
        </View>
    )
}

export default Navbar;
