import { Platform, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

const TagDropdown = ({value, data, onChangeText, onClear, onSelectItem, placeholder, handleSubmit }) => {
    const [suggestionsList, setSuggestionsList] = useState([]);
    const searchRef = useRef(null);
    const dropdownController = useRef(null);
    const [Initalize, setInitalize] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);



    const getSuggestions = useCallback(async (q: string) => {
        const filterToken = q.toLowerCase();
        if (typeof q !== 'string' || q.length < 3) {
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
                getSuggestions(value);
                setInput(value);
         }}
         onSelectItem={(item)=>{
            if (item){  
                onSelectItem(item);
                setInput(item.title);
            }
         }}
         loading={loading}
         direction={Platform.select({ ios: 'down' })}
         onClear={()=> {
                onClear();
                setSuggestionsList(data);
         }}
        //  renderItem={(item) => (
        //     <Text style={{ color: '#35353E', padding: 15 }}>{item.title}</Text>
        // )}
         textInputProps ={{
             placeholder: placeholder,
             placeholderTextColor: '#888',
             value: input,
             autoCorrect: false,
             autoCapitalize: 'none',
             onSubmitEditing(e) {
                handleSubmit(e);
            },
            onChangeText: (value) => {
                setInput(value);
                getSuggestions(value);
            },
             style: { 
                 color: '#35353E',
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

export default TagDropdown

const styles = StyleSheet.create({})