import { StyleSheet, Text, View , Image} from 'react-native'
import React from 'react'
import DropDownPicker from 'react-native-dropdown-picker';

const FoodRank = ({rank, foodName, rating}) => {
    const formattedRating = parseFloat(rating).toFixed(2);
    return (
        <View style={rank < 3 ?  [styles.rankContainer,{backgroundColor: '#F9A05F'} ]: [styles.rankContainer, {backgroundColor: '#E7E2DB'}] }>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.rankNum}>{rank + 1}</Text>
                <Text style={styles.foodText}>{foodName}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.rating}>{formattedRating}</Text>
                <Image style={styles.star}source={require('../assets/star.png')}/>
            </View>
        </View>
    )
}

export default FoodRank

const styles = StyleSheet.create({
    rankContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: 335,
        height: 42,
        marginBottom: 10,
        // padding: 10,
        borderRadius: 15,
    },
    rankNum: {
        color: '#35353E',
        fontSize: 24,
        fontStyle: 'normal',
        fontWeight: 'bold', // closest to '700' in React Native
        // lineHeight: 36, // Explicit pixel value
        letterSpacing: -0.264,
        fontFamily: 'Satoshi',
        alignItems: 'center', 
        justifyContent: 'center',
        paddingRight: 15,
        paddingLeft: 15,
        textAlign: 'left',
    },
    foodText:{
        color: '#35353E',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500', 
        lineHeight: 24,
        letterSpacing: -0.176,
        fontFamily: 'Satoshi' 
    },
    rating:{
        color: '#35353E',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500', 
        lineHeight: 24,
        letterSpacing: -0.176,
        fontFamily: 'Satoshi', 
        paddingRight: 4,
    },
    star:{
        width: 20,
        height: 20,
        paddingRight: 15,
        marginRight: 10,
    }


})