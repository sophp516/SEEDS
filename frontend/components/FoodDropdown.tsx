import { View, Text, StyleSheet, Platform } from 'react-native'
import React, {useState, useEffect} from 'react'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import { getDocs, collection} from 'firebase/firestore'
import { db } from '../services/firestore'

// parameter: user location
const foodDropdown = ( {onChangeText,onSelectItem,onClear, value}) => {
    const [foodlist, setFoodlist] = useState([]);


    useEffect(()=>{
        const fetchFood = async()=>{
            try{
                const foodRef = collection(db, 'colleges', 'Dartmouth College', 'foodList');
                const foodSnapshot = await getDocs(foodRef);
                const foods = foodSnapshot.docs.map((food, index) => {
                    const foodName = food.data().foodName;
                    return{
                        id: index,
                        title: foodName
                    }
                });
                setFoodlist(foods);
            
               
            } catch (error){
                console.error("Error fetching food: ", error);
                return [];
            }
        }
        fetchFood();
    }, [])

    console.log("food list", foodlist)
    return (
        <View>
            <AutocompleteDropdown
                 dataSet={foodlist}
                 onChangeText={onChangeText}
                 onSelectItem={onSelectItem}
                 direction={Platform.select({ ios: 'down' })}
                 onClear={onClear}
                //  initialValue={locationInput}
                 textInputProps ={{
                     placeholder: 'Ex. Apple',
                     value: value,
                     autoCorrect: false,
                     autoCapitalize: 'none',
                     style: { 
                         color: 'black',
                         backgroundColor: '#E7E2DB',
                         width: 350,
                         height: 30,
                         borderRadius: 10,                           
                         alignSelf: 'center'
                     }
                 }}
                 inputContainerStyle={{
                     backgroundColor: '#E7E2DB',
                     width: 350,
                     height: 35,
                     borderRadius: 10,
                     
                 }}
            
            >

            </AutocompleteDropdown>
        
        </View>
    )
}

export default foodDropdown

const styles = StyleSheet.create({})