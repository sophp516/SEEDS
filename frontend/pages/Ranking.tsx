import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from "../styles.js";
import { getDocs, collection, average, where, query,} from 'firebase/firestore'
import { db } from '../services/firestore'
import FoodRank from "../components/FoodRank.tsx";


const Ranking = () => {
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [foodNames, setFoodNames] = useState<String[]>([]);
    const [foodLeaderboard, setFoodLeaderboards] = useState<any[]>([]);
    const [foodData, setFoodData] = useState<any[]>([]); // can fetch by time, but for demo fetch per update?
    

   
    // fetches the list of food names to get rating data 
    useEffect(()=>{
      const fetchFoodNames = async () => {
          try{
              const res = await getDocs(collection(db,"colleges", "Dartmouth College", "foodList"))
              setFoodNames(res.docs.map(doc => doc.data().foodName))
          }catch{
            console.log("Error fetching food leaderboard")
          }
      }
      fetchFoodNames();
    }, [])

    useEffect(()=>{
      const fetchFoodRating = async () => {
        try{
          const queries = foodNames.map(foodName => 
            getDocs(query(collection(db, "colleges", "Dartmouth College", "foodList"), where("foodName", "==", foodName)))
          );

          const res = await Promise.all(queries); // consist all of the documents

          // Mapping through several documents
          // each document data is a array, but we only want one array of objects which is why flatMap is used (2D array -> 1D array)
          // for each doc in docs, map the data to an object with foodName and averageRating
          const datas = res.flatMap(res => res.docs.map(doc => ({
            foodName: doc.data().foodName,
            averageRating: doc.data().averageRating
          })));

          datas.sort((a,b)=>b.averageRating-a.averageRating) // sort in ascending order
          setFoodLeaderboards(datas)
        }catch{
          console.log("Error fetching food leaderboard")
        }
      }
      fetchFoodRating();
    },[foodNames])

    console.log(foodLeaderboard)




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
         <View>
            {foodLeaderboard.map((food, index) => (
              <View>
                <FoodRank rank={index} foodName={food.foodName} rating={food.averageRating}/>
                {/* <Text>{index+1}. {food.foodName} - {food.averageRating}</Text> */}
              </View>
            ))}
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