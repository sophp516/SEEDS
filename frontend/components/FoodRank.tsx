import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FoodRank = ({rank, foodName, rating}) => {
  return (
    <View style={styles.rankContainer}>
        <Text style={styles.rankNum}>{rank + 1}</Text>
        <Text>{foodName}</Text>
        <Text>{rating}</Text>
    </View>
  )
}

export default FoodRank

const styles = StyleSheet.create({
    rankContainer:{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 335,
        height: 42,
        backgroundColor: '#F9A05F',
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
    }


})