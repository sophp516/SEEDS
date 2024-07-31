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
                <Text style={styles.servingText}>{parsedServing} serving: </Text>
                <Text style={styles.servingText}>{parsedCalories} cal</Text>
            </View>
            <View style={styles.circleContainer}>
                <View style={styles.circle}>
                    <Text style={styles.text1}>{parsedCarbs}g</Text>
                    <Text style={styles.macroText}>carbs</Text>
                </View>
                <View style={styles.circle}>
                    <Text style={styles.text1}>{parsedProtein}g</Text>
                    <Text style={styles.macroText}>protein</Text>
                </View>
                <View style={styles.circle}>
                    <Text style={styles.text1}>{parsedFat}g</Text>
                    <Text style={styles.macroText}>fat</Text>
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
        borderWidth: 1.5,
        borderColor: colors.outlineBrown,
        backgroundColor: colors.backgroundGray,
        margin: 10,
        width: '100%', 
    },
    nutrientHeader:{
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 10,
    },
    servingText: {
        color: colors.textGray,
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
    },
    circleContainer:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10,
        width: '100%', 
    },
    circle:{
        borderColor: colors.outlineBrown,
        borderWidth: 2,
        borderRadius: 100,
        padding: 10,
        height: 80,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    text1:{
        color: colors.textGray,
        textAlign: 'center',
        fontFamily: 'Satoshi-Medium',
        fontSize: 18,
        // lineHeight: 30,
    },
    macroText: {
        color: colors.textGray,
        textAlign: 'center',
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
    }
})