import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FoodRank = ({rank, foodName, rating}) => {
  return (
    <View>
       <Text>{rank + 1} {foodName} - {rating}</Text>
    </View>
  )
}

export default FoodRank

const styles = StyleSheet.create({})