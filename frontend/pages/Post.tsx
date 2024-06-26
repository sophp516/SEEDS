import {useState} from 'react';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

interface newPost{
    image: File;
    comment: string;
}
interface newReview {
    foodName: string;
    location: string;
    price: number| null;
    taste: number;
    health: number;
    image: File;
    tags:string[] | null,
    comment: string,
}

// when click send, passes a object to the firebase function
const Post = () => {
    const [tag, setTag] = useState<string>('');
    const navigation = useNavigation();
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [post, setPost] = useState<newPost>();
    const [review, setReview] = useState<newReview>({
        foodName: '',
        location: '',
        price: null,
        taste: 0,
        health: 0,
        image: {} as File,
        tags: [],
        comment: '',
    });
    const handleCreatePost = () => {

    }
    const handleCreateReview = () =>{
        // call firebase function
        navigation.goBack();
    }
    /* function handleExit(): Brings user back to the last visited page
    * Also resets the data stored in the use state
     */
    const handleExit = () => {
        navigation.goBack();
    }
    /* Later we can do food reccomendation from API if time */
    const handleChangeFoodName = (text: string) => {
        setReview(prevReview => ({ ...prevReview, foodName: text }));
    };
    /* Later we can implement dropdown and auto complete text based off locations within the campus*/
    const handleChangeLocation = (text: string) => {
        setReview(prevReview => ({...prevReview, location: text}));
    }
    const handleSubmitTag = () => {
        if (tag){
            review.tags.push(tag);
            setTag('');
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleExit}>
                <Text>Exit</Text>
             </TouchableOpacity>
            <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={()=>setToggle(true)} style={styles.toggleButton}>
                    <Text>Post</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setToggle(false)} style={styles.toggleButton}>
                    <Text>Button</Text>
                </TouchableOpacity>
            </View>
            {toggle ? 
                <View>
    
                </View>
                : 
                <View>
                     <Text> Food Name </Text>
                        <TextInput 
                            value={review.foodName}
                            onChangeText={handleChangeFoodName}
                            placeholder='ex. Apple'
                        />
                    <Text> Location </Text>
                         <TextInput 
                            value={review.location}
                            onChangeText={handleChangeLocation}
                            placeholder='ex. Collis Cafe'
                        />
                    <Text> Price </Text>
                        <TextInput 
                            value={review.price ? review.price.toString() :  null}
                            keyboardType='decimal-pad'
                            onChangeText={(text)=> setReview(prevReview => ({...prevReview, price: parseFloat(text) || -1 }))}
                            placeholder='enter price'
                        />
                     <Text> Taste </Text>
                     <Slider
                        // style={styles.slider}
                        minimumValue={1}
                        maximumValue={5}
                        step={1}
                        value={review.taste}
                        onValueChange={(value)=> setReview(prevReview => ({...prevReview, taste: value }))}
                        minimumTrackTintColor="#1fb28a"
                        maximumTrackTintColor="#d3d3d3"
                        thumbTintColor="#b9e4c9"
                    />
                     <Text> Health</Text>
                     <Slider
                        // style={styles.slider}
                        minimumValue={1}
                        maximumValue={5}
                        step={1}
                        value={review.health}
                        onValueChange={(value)=> setReview(prevReview => ({...prevReview, health: value }))}
                        minimumTrackTintColor="#1fb28a"
                        maximumTrackTintColor="#d3d3d3"
                        thumbTintColor="#b9e4c9"
                    />
                     
                     <Text> Add Tags</Text>
                     <TextInput 
                            value={tag}
                            onChangeText={(tag)=> setTag(tag)}
                            placeholder='enter a tag'
                            onSubmitEditing={handleSubmitTag}
                            returnKeyType='done'
                        />
                    <TouchableOpacity onPress={handleCreateReview}>
                        <Text>Post</Text>
                    </TouchableOpacity>
                </View>
             }

            {/* <Navbar /> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
        backgroundColor: 'white', // Set background color if necessary
    },
    text: {
        fontSize: 24, // Increase font size for prominence
        fontWeight: 'bold', // Add bold style for prominence
        marginBottom: 20, // Add margin bottom to separate from Navbar
    },
    toggleContainer: {
        flexDirection: 'row',
    }, 
    toggleButton:{
        padding: 20,
    },
    textbox: {
        borderColor: 'black',
    },
});

export default Post;
