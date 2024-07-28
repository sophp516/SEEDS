import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import colors from '../styles.js';
const GeneralDropdown = ({value, data, onChangeText, onClear, onSelectItem, placeholder}) => {
    const [suggestionsList, setSuggestionsList] = useState([]);
    const searchRef = useRef(null);
    const dropdownController = useRef(null);
    const [Initalize, setInitalize] = useState(true);
    const [input, setInput] = useState('');
    useEffect(()=>{
        if (Initalize){
            setInitalize(false);
            setSuggestionsList(data);
        }

        setInitalize(false);
    }, [] )

    const getSuggestions = useCallback(async (q: string) => {
        const filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 2) {
            setSuggestionsList(data);
            return;
        }
        // setLoading(true);
        const items = data;
        const suggestions = items
            .filter(item => item.title.toLowerCase().includes(filterToken))
            .map(item => ({
                id: item.id,
                title: item.title,
            }));
        setSuggestionsList(suggestions);
        // setLoading(false);
    }, []);



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
            setInput(value);
        }}
        onSelectItem={onSelectItem}
        direction={Platform.select({ ios: 'down' })}
        onClear={()=> {
            onClear();
            setSuggestionsList(data);
        }}
        renderItem={(item) => (
            <Text style={{ color: colors.textGray, padding: 15, fontFamily: 'Satoshi-Medium', fontSize: 14 }}>{item.title}</Text>
        )}
        textInputProps ={{
            placeholder: placeholder,
            placeholderTextColor: colors.textFaintBrown,
            value: value,
            autoCorrect: false,
            autoCapitalize: 'none',
            onSubmitEditing(e) {
                onChangeText(input);
            },
            style: { 
                fontFamily: 'Satoshi-Medium',
                fontSize: 15,
                color: '#35353E',
                backgroundColor: '#E7E2DB',
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

export default GeneralDropdown

const styles = StyleSheet.create({})