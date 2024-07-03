import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import colors from '../styles.js';

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
                    <Text style={styles.placeNameText}>{placeName}</Text>
                    <View style={styles.diningInfoContainer}>
                        <View style={styles.hoursContainer}>
                            <Text style={styles.diningInfoText}>Opens: {openingHour}</Text>
                            <Text style={styles.diningInfoText}>Closes: {closingHour}</Text>
                        </View>
                        <View style={styles.businessContainer}>
                            <Text style={styles.diningInfoText}>Business: {businessLevel}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    diningPlaceContainer: {
        flexDirection: 'column',
        backgroundColor: colors.primaryWhite,
        borderColor: colors.grayStroke,
        borderWidth: 1,
        paddingTop: 13,
        paddingBottom: 13,
        paddingLeft: 13,
        paddingRight: 13,
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 10,
    },
    diningPlaceImage: {
        width: '100%',
        height: 170,
        backgroundColor: 'gray',
        marginRight: 20,
        marginBottom: 20,
        borderRadius: 7,
    },
    diningPlaceInfo: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
    }, 
    businessContainer: {

    },
    hoursContainer: {
        flexDirection: 'column',
    },
    placeNameText: {
        fontSize: 16,
    },
    diningInfoText: {
        fontSize: 12,
        marginBottom: 3,
    },
    diningInfoContainer: {
        paddingTop: 12,
        justifyContent: 'space-between',
        flexDirection: 'row',
        bottom: 0,
    }
})

export default DiningPlaceHome;
