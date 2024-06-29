import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Navbar from '../components/Navbar.jsx';

type RootStackParamList = {
    Home: undefined
};

type Props = {
    route: {
        params: {
            placeName: string;
            openingHour: string;
            closingHour: string;
            businessLevel: string;
        }
    }
};

const DiningHome: React.FC<Props> = ({ route }) => {

    const { placeName, openingHour, closingHour, businessLevel } = route.params;
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();


    return (
        <View style={styles.container}>
            <View style={styles.diningHomeHeader}>
                <View style={styles.diningHomeHeaderTop}>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                    <Text>Closes at {closingHour}</Text>
                </View>
                <View style={styles.diningHomeHeaderBottom}>
                    <Text style={styles.placeNameText}>{placeName}</Text>
                </View>
            </View>
            <View>
                <View>
                    <Text>Top rated</Text>
                </View>
            </View>
            <View>
                <View>
                    <Text>On the menu</Text>
                </View>
            </View>
            <View>
                <View>
                    <Text>Recommended for you</Text>
                </View>
            </View>
            <Navbar />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        width: '100%',
    },
    backButton: {
        paddingTop: 10,
        paddingBottom: 20,
    },
    placeNameText: {
        fontSize: 20,
    },
    diningHomeHeader: {
        paddingTop: 60,
        width: '100%',
        padding: 30,
    },
    diningHomeHeaderTop: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    diningHomeHeaderBottom: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 20,
    }
})

export default DiningHome;
