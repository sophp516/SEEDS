import { View, Text, StyleSheet, Platform } from 'react-native'
import React, {useState, useEffect, useRef, useCallback} from 'react'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import { getDocs, collection} from 'firebase/firestore'
import { db } from '../services/firestore'
import colors from '../styles.js'

// parameter: user location
const foodDropdown = ( {onChangeText,onSelectItem,onClear, food}) => {
    const [foodlist, setFoodlist] = useState([]);
    const [suggestionsList, setSuggestionsList] = useState([]);
    const searchRef = useRef(null);
    const dropdownController = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [inputValue, setInputValue] = useState('');

    useEffect(()=>{
        if (fetching){
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
                    setSuggestionsList(foods);
                } catch (error){
                    console.error("Error fetching food: ", error);
                    return [];
                }
            }
            fetchFood();
        }
        setFetching(false);
    }, [])

    const getSuggestions = useCallback(async (q: string) => {
        const filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 3) {
            setSuggestionsList(foodlist);
            return;
        }
        // setLoading(true);
        const items = foodlist;
        const suggestions = items.filter(item => item.title.toLowerCase().includes(filterToken))
            .map(item => ({
                id: item.id,
                title: item.title,
            }));
        // console.log(q);
        // console.log(suggestions)
        setSuggestionsList(suggestions);

        // setLoading(false);
    }, [foodlist]);

    // console.log("food list", value)
    return (
        <View>
            <AutocompleteDropdown
                ref={searchRef}
                controller={(controller) => {
                    dropdownController.current = controller;
                }}
                dataSet={suggestionsList}
                onChangeText={(value)=>{
                    getSuggestions(value);
                    setInputValue(value)
                }}
                onSelectItem={(item) =>{
                    if (item){
                        onSelectItem(item); 
                    }
                 }}
                debounce={600}
                direction={Platform.select({ ios: 'down' })}
                onClear={()=> {
                    onClear();
                    setSuggestionsList(foodlist);
                }}
                renderItem={(item) => (
                    <Text style={{ color: colors.textGray, padding: 15, fontFamily: 'Satoshi-Medium', fontSize: 14 }}>{item.title}</Text>
                )}
                textInputProps ={{
                    placeholder: 'Enter or select a food',
                    placeholderTextColor: colors.textFaintBrown,
                    value: food,
                    autoCorrect: false,
                    autoCapitalize: 'none',
                    onChangeText: (value)=> {
                        getSuggestions(value);
                        onChangeText(value);
                    },
                    style: { 
                        fontFamily: 'Satoshi-Medium',
                        fontSize: 15,
                        color: colors.textGray,
                        // backgroundColor: '#E7E2DB',
                        width: 350,
                        height: 30,
                        borderRadius: 15,                           
                        alignSelf: 'center'
                    }
                }}
                inputContainerStyle={{
                    backgroundColor: colors.commentContainer,
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