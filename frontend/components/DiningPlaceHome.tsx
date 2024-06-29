import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
    DiningHome: {
        placeName: string;
        openingHour: string;
        closingHour: string;
        businessLevel: string;
    };
};

type Props = {
    placeName: string;
    openingHour: string;
    closingHour: string;
    businessLevel: string;
};

const DiningPlaceHome: React.FC<Props> = ({ placeName, openingHour, closingHour, businessLevel }) => {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const handlePress = () => {
        navigation.navigate('DiningHome', {
            placeName,
            openingHour,
            closingHour,
            businessLevel,
        });
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={styles.diningPlaceContainer}>
                <View style={styles.diningPlaceImage}></View>
                <View style={styles.diningPlaceInfo}>
                    <View style={styles.nameContainer}><Text style={styles.placeNameText}>{placeName}</Text></View>
                    <View style={styles.diningInfoContainer}>
                        <Text style={styles.diningInfoText}>Opens: {openingHour}</Text>
                        <Text style={styles.diningInfoText}>Closes: {closingHour}</Text>
                        <Text style={styles.diningInfoText}>Business: {businessLevel}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    diningPlaceContainer: {
        flexDirection: 'row',
        backgroundColor: 'gray',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 5,
    },
    diningPlaceImage: {
        width: 140,
        height: 140,
        backgroundColor: 'white',
        marginRight: 20,
        borderRadius: 5,
    },
    diningPlaceInfo: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
    }, 
    placeNameText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    diningInfoText: {
        fontSize: 12,
    },
    nameContainer: {
        width: 95,
    },
    diningInfoContainer: {
        bottom: 0,
    }
})

export default DiningPlaceHome;
