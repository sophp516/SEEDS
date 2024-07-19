import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const TimeDropdown = ({setSelectedValue, filterFoodLeaderboard}) => {
  return (
    <View style={{zIndex: 1, position:"absolute" , top: 55, left: 240, backgroundColor: '#E7E2DB', width: 95, 
        justifyContent: 'center', alignItems: 'center', borderRadius: 10,}}>
        
        <TouchableOpacity onPress={()=>filterFoodLeaderboard("All-time")} style={styles.dropdown}>
        <Text style={styles.textStyle}>All-time</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>filterFoodLeaderboard("Week")} style={styles.dropdown}>
        <Text style={styles.textStyle}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>filterFoodLeaderboard("Month")} style={styles.dropdown}>
        <Text style={styles.textStyle}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>filterFoodLeaderboard("Year")} style={styles.dropdown}>
        <Text style={styles.textStyle}>Year</Text>
        </TouchableOpacity>

    </View>

  )
}

export default TimeDropdown

const styles = StyleSheet.create({
    dropdown:{
        flexDirection: 'row',
        padding: 5,
        margin: 1,
        // borderRadius: 5,
        // backgroundColor: '#C6C6C5',
        width:'100%',
        justifyContent: 'center'
      },
      textStyle:{
        textAlign:'center',
        lineHeight: 15,
        fontFamily: 'Satoshi',
        fontSize: 14,
      },
})