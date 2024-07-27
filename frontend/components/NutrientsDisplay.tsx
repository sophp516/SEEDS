import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import colors from '../styles.js'
const NutrientsDisplay = ({serving, calories, protein, fat, carbs}) => {
    let parsedCalories = 'N/A', parsedProtein = 'N/A', parsedFat = 'N/A', parsedCarbs = 'N/A'
    let parsedServing = 1;
    if(calories !== undefined){
        let temp = Math.round(parseFloat(calories))
        parsedCalories = (temp).toString()
    }
    if(protein!==undefined){
        let temp = Math.round(parseFloat(protein))
        parsedProtein = (temp).toString()
    }
    if(fat){
        let temp = Math.round(parseFloat(fat))
        parsedFat = (temp).toString()
    }
    if(carbs){
        let temp = Math.round(parseFloat(carbs))
        parsedCarbs = (temp).toString()
    }
    if(serving){
        parsedServing = serving
    }

    return (
        <View style={styles.nutrientContainer}>
            <View style={styles.nutrientHeader}>
                <Text>{parsedServing} serving:  </Text>
                <Text>{parsedCalories} cal</Text>
            </View>
            <View style={styles.circleContainer}>
                <View style={styles.circle}>
                    <Text style={styles.text1}>{parsedCarbs}g</Text>
                    <Text>carbs</Text>
                </View>
                <View style={styles.circle}>
                    <Text style={styles.text1}>{parsedProtein}g</Text>
                    <Text>protein</Text>
                </View>
                <View style={styles.circle}>
                    <Text style={styles.text1}>{parsedFat}g</Text>
                    <Text>fat</Text>
                </View>
            </View>
        </View>
    )
}

export default NutrientsDisplay

const styles = StyleSheet.create({
    nutrientContainer:{
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth:2,
        borderColor: '#91836E',
        backgroundColor: colors.backgroundGray,
        margin: 10,
        width: '100%', 
    },
    nutrientHeader:{
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 10,
    },
    circleContainer:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10,
        width: '100%', 
    },
    circle:{
        borderColor: '#BCBCBC',
        borderWidth: 3,
        borderRadius: 100,
        padding: 10,
        height: 80,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    text1:{
        color: '#35353E',
        textAlign: 'center',
        fontFamily: 'Manrope', // Ensure this font is included in your project
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 30, // Previously 150% of 20px; in React Native use direct pixel value
        letterSpacing: -0.22
    }
})