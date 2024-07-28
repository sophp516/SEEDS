import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import colors from '../styles.js';

const TagDropdown = ({value, data, onChangeText, onClear, onSelectItem, placeholder, handleSubmit }) => {
    const [suggestionsList, setSuggestionsList] = useState(data);
    const searchRef = useRef(null);
    const dropdownController = useRef(null);
    const [Initalize, setInitalize] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const getSuggestions = useCallback(async (q: string) => {
        const filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 1) {
            setSuggestionsList(data);
            return;
        }
        setLoading(true);
        const items = data;
        const suggestions = items
            .filter(item => item.title.toLowerCase().includes(filterToken))
            .map(item => ({
                id: item.id,
                title: item.title,
            }));
        setSuggestionsList(suggestions);
        setLoading(false);
    }, []);

  return (
    <View>
    <AutocompleteDropdown
        dataSet={suggestionsList}
        onChangeText={(value)=>{
            onChangeText(value);
            getSuggestions(value);
        }}
        onSelectItem={(item)=>{
            if (item){  
                onSelectItem(item);
                setInput('');
            }
        }}
        loading={loading}
        direction={Platform.select({ ios: 'down' })}
        onClear={()=> {
            onClear();
            setSuggestionsList(data);
        }}
        renderItem={(item) => (
            <Text style={{ color: colors.textGray, padding: 15, fontFamily: 'Satoshi-Medium', fontSize: 15 }}>{item.title}</Text>
        )}
        textInputProps ={{
            placeholder: placeholder,
            placeholderTextColor: colors.textFaintBrown,
            value: input,
            autoCorrect: false,
            autoCapitalize: 'none',
            onSubmitEditing(e) {
                handleSubmit(e);
            },
            onChangeText: (value) => {
                onChangeText(value);
                getSuggestions(value);
            },
            style: { 
                fontFamily: 'Satoshi-Medium',
                fontSize: 15,
                color: colors.textGray,
                backgroundColor: colors.commentContainer,
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

export default TagDropdown

const styles = StyleSheet.create({})