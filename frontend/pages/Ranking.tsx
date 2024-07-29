import Navbar from "../components/Navbar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View , Image, ScrollView} from 'react-native';
import colors from "../styles.js";
import { getDocs, collection, average, where, query, Timestamp} from 'firebase/firestore'
import { db } from '../services/firestore'
import FoodRank from "../components/FoodRank.tsx";
import UserRank from "../components/UserRank.tsx";
import TimeDropdown from "../components/TimeDropdown.tsx";


const Ranking = () => {
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [foodNames, setFoodNames] = useState<String[]>([]);
    const [foodLeaderboard, setFoodLeaderboards] = useState<any[]>([]);
    const [filteredFoodLeaderboard, setFilteredFoodLeaderboard] = useState<any[]>([]);  
    const [foodData, setFoodData] = useState<any[]>([]); // can fetch by time, but for demo fetch per update?
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("All-time");

    const [users, setUsers] = useState<any>([]);


    useEffect(() => {
      const fetchUsers = async () => {
          try {
              const usersRef = collection(db, 'users');
              const usersSnapshot = await getDocs(usersRef);
              const usersData = usersSnapshot.docs.flatMap(doc => {
                  return [{
                     displayName: doc.data().displayName ?? 'Anonymous',
                     likesCount: doc.data().likesCount ?? '0',
                      profilePicture: doc.data().profileImage ?? 'N/A',
                  }];
              });

              const sortedUsers = usersData.sort((a, b) => b.likesCount - a.likesCount);
              setUsers(sortedUsers);
          } catch (error) {
              console.error("Error fetching users: ", error);
          }
      }
      fetchUsers();
    },[])

    // fetches the list of food names to get rating data once the component mounts
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

  
  
    useEffect(() => {
        const fetchFoodRating = async () => {
          try {
    
            const queries = foodNames.map(foodName => 
              getDocs(query(collection(db, "colleges", "Dartmouth College", "foodList"), 
                            where("foodName", "==", foodName),)));
    
            const res = await Promise.all(queries);
    
            const datas = res.flatMap(res => res.docs.map(doc => ({
              foodName: doc.data().foodName,
              averageRating: doc.data().averageRating,
              createdAt: doc.data().createdAt,
              location: doc.data().location,
            })));
    
            datas.sort((a, b) => b.averageRating - a.averageRating); // Sort in descending order
            setFoodLeaderboards(datas);
            setFilteredFoodLeaderboard(datas);
          } catch (error) {
            console.log("Error fetching food leaderboard:", error);
          }
        };
    
        fetchFoodRating();
      }, [foodNames]);

    //Test cases: Peanut butter sandwich is created last year
    // Test cases: roasted cabbage is created weeks ago, so does not show in the week
    const filterFoodLeaderboard = (text: string) => {
      const time = new Date();
      setOpen(false);
      setSelectedValue(text);
  
      if (text === "All-time") {
          setFilteredFoodLeaderboard(foodLeaderboard);
      } else {
          // Define the threshold date based on the selected time range
          let thresholdDate;
          if (text === 'Week') {
              thresholdDate = new Date(time.getFullYear(), time.getMonth(), time.getDate() - 7);
          } else if (text === 'Month') {
              thresholdDate = new Date(time.getFullYear(), time.getMonth() - 1, time.getDate());
          } else if (text === 'Year') {
              thresholdDate = new Date(time.getFullYear() - 1, time.getMonth(), time.getDate());
          }
          // Filter the leaderboard
          const filtered = foodLeaderboard.filter(food => {
              // Convert Firestore Timestamp to JavaScript Date object
              const foodDate = food.createdAt.toDate();
              return foodDate > thresholdDate;
          });
  
          setFilteredFoodLeaderboard(filtered);
      }
  };

    return (
      <View style={styles.container}>
        <View style={{alignItems: 'flex-start', flexDirection:'row', marginRight: '45%'}}>
          <Text style={styles.header}>Leaderboard</Text>
        </View>
        
        {/* Section toggle */}
        <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={()=>setToggle(true)} style={toggle ? styles.activeToggle : styles.inactiveToggle}>
                    <Text style={toggle ? styles.btnText1 : styles.btnText2}>Food</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setToggle(false)} style={toggle ?  styles.inactiveToggle : styles.activeToggle }>
                    <Text style={!toggle ? styles.btnText1 : styles.btnText2}>Reviews</Text>
                </TouchableOpacity>
         </View>

        {/* Dropdown toggle */}
         <View style={{justifyContent:'center'}}>
            <View style={styles.sortContainer}>
                <TouchableOpacity onPress={()=>setOpen(!open)} style={{ paddingHorizontal: 10, paddingVertical: 7 ,flexDirection: 'row', justifyContent: 'space-between'} }>
                  <Text style={{fontFamily: 'Satoshi-Medium', color: colors.textGray, marginRight: 3}}> {selectedValue} </Text>
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Image source={require('../assets/dropdown.png')} style={{width: 13, height: 10, marginLeft: 1, resizeMode: 'contain'}} />
                  </View>
                </TouchableOpacity>
            </View>

          {open ?
            <TimeDropdown setSelectedValue={setSelectedValue} filterFoodLeaderboard={filterFoodLeaderboard} />:<View/>}
          </View>

        {/* Displays the leader board based off fetching  */}
        {toggle ? 
        <ScrollView style={{zIndex: -1}}>
          {filteredFoodLeaderboard.map((food, index) => (
            <View key={index} style={{marginHorizontal: 20}}>
              <FoodRank rank={index} foodName={food.foodName} rating={food.averageRating} location={food.location}/>
            </View>
          ))}
        </ScrollView >: 
        <ScrollView style={{zIndex: -1, }}>
          {users.map((user, index) => (
            <View key={index}>
              <UserRank rank={index} displayName={user.displayName} likesCount={user.likesCount} profilePicture={user.profilePicture} />
            </View>
          ))}
        </ScrollView>}

        <View></View>


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
    header:{
      fontFamily: 'SpaceGrotesk-SemiBold', 
      fontSize: 24,
      color: colors.textGray,
      textAlign: 'left',
      marginTop: 96,
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
  btnText1:{ 
    color: '#35353E',
    fontFamily: 'Satoshi-Medium', 
    fontSize: 14,
    lineHeight: 21, 
    textAlign: 'center',
  },
  btnText2:{ 
    color: '#35353E',
    fontFamily: 'Satoshi-Medium', 
    fontSize: 14,
    lineHeight: 21, 
    textAlign: 'center',
  },
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
  dropDownContainer:{
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    height: 100,
  },
  sortContainer: {
    backgroundColor: '#E7E2DB', 
    marginBottom: 15,
    marginTop: 5, 
    marginLeft: "60%",
    borderRadius: 30,
    justifyContent:'center', 
    alignContent: 'center',
    alignItems: "center", 
    // height: 35, 
    // width: 100
  }
  });
export default Ranking;