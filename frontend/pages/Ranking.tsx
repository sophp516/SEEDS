import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from "../styles.js";


const Ranking = () => {
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [foodLeaderboard, setFoodLeaderboards] = useState<any[]>([]);
    

    // can fetch by time, but for demo fetch per update?

    useEffect(()=>{
      
    })




    return (
      <View style={styles.container}>
      <View style={{margin: 40}}></View>
      <View style={{  alignItems: 'flex-start', flexDirection:'row', marginRight: '50%'}}>
      <Text style={styles.header}>Leaderboard</Text>
      </View>
        <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={()=>setToggle(true)} style={toggle ? styles.activeToggle : styles.inactiveToggle}>
                    <Text style={toggle ? styles.btnText1 : styles.btnText2}>Food</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setToggle(false)} style={toggle ?  styles.inactiveToggle : styles.activeToggle }>
                    <Text style={!toggle ? styles.btnText1 : styles.btnText2}>Review</Text>
                </TouchableOpacity>
            </View>

        <Navbar />
      </View>

    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundGray,
      alignItems: 'center',
      flexDirection: 'column',
      width: '100%',
    },
    leaderboardText: {
      marginTop: 60,
      fontSize: 20,
    },
    header:{
      color: '#35353E',
      fontFamily: 'Space Grotesk', 
      fontSize: 24,
      fontStyle: 'normal',
      fontWeight: '500', 
      lineHeight: 36,
      letterSpacing: -0.264,
      textAlign: 'left',
  },
    toggleContainer: {
      flexDirection: 'row',
      borderRadius: 20,
      borderColor: '#B7B7B7',
      borderStyle: 'solid',
      // borderWidth: 2,
      backgroundColor: '#E7E2DB',
      width: '70%',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 15,
  }, 
  activeToggle: {
      padding: 5,
      width: '50%',
      justifyContent: 'center',
      alignContent: 'center',
      backgroundColor: '#F9A05F',
      borderRadius: 20,
      borderColor: '#B7B7B7',
      borderStyle: 'solid',
  },
  inactiveToggle: {
      padding: 5,
      width: '50%',
      borderRadius: 20,
      justifyContent: 'center',
      alignContent: 'center',
  },
  btnText1:{ // white
      color: '#35353E',
      fontFamily: 'Satoshi', 
      fontSize: 14,
      fontStyle: 'normal',
      fontWeight: '500',
      lineHeight: 21, 
      letterSpacing: -0.154,
      textAlign: 'center',
  },
  btnText2:{ // white
    color: '#35353E',
    fontFamily: 'Satoshi', 
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 21, 
    letterSpacing: -0.154,
      textAlign: 'center',
  },
  });
export default Ranking;