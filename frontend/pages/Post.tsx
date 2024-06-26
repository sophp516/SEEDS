import {useState} from 'react';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { db , storage } from '../services/firestore';
import { collection, addDoc} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { ref, uploadBytes,getDownloadURL } from 'firebase/storage';

// import storage from '@react-native-firebase/storage';

interface newPost{
    image: string | null;
    comment: string;
}
interface newReview {
    foodName: string;
    location: string;
    price: number| null;
    taste: number;
    health: number;
    image: string | null;
    tags:string[] | null,
    comment: string|null,
}

// when click send, passes a object to the firebase function
const Post = () => {
    const [tag, setTag] = useState<string>('');
    const navigation = useNavigation();
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [post, setPost] = useState<newPost>({
        comment: '',
        image: '',
    });
    const [review, setReview] = useState<newReview>({
        foodName: '',
        location: '',
        price: null,
        taste: 0,
        health: 0,
        image: '',
        tags: [],
        comment: '',
    });

    const handleCreatePost = async() => {
        try{
            let finalPost = {...post};
            if (post.image){
                /* Tried to write a upload function, however that resulted in app crashing unless we keep path name the same*/
                const response = await fetch(post.image);
                const blob = await response.blob(); // convert 
                const imgName = "img-" + new Date().getTime();
                const storageRef = ref(storage, `posts/${imgName}.jpg`)
                const snapshop = await uploadBytes(storageRef, blob);
                const imageUrl = await getDownloadURL(storageRef);
                finalPost.image = imageUrl;
            }else{
                delete finalPost.image;
            }
            const postRef = await addDoc(collection(db, 'posts'), finalPost);
            console.log("Post added to Firestore with ID:", postRef.id);
            setPost({ image: '',comment: '',}); // reset the post
        }catch{
            console.error("Error adding post to Firestore");
        }
    }

    const handleCreateReview = async () =>{
        try{
            let finalReview = {...review};
            console.log("Review added to Firestore with ID:");
            // ERROR: Image upload doesn't work but else wise it does update on the database
            if (review.image){
                const response = await fetch(review.image);
                const blob = await response.blob(); // convert 
                const imgName = "img-" + new Date().getTime();
                const storageRef = ref(storage, `reviews/${imgName}.jpg`)
                const snapshop = await uploadBytes(storageRef, blob);
                const imageUrl = await getDownloadURL(storageRef);
                finalReview.image = imageUrl;
                console.log("Review added to Firestore with ID:");
            }else{  
                delete finalReview.image;
            }

            const reviewRef = await addDoc(collection(db, 'reviews'), finalReview);
            console.log("Review added to Firestore with ID:", reviewRef.id);
            setReview({ foodName: '',
                location: '',
                price: null,
                taste: 0,
                health: 0,
                image: '',
                tags: [],
                comment: '',}); // reset the review
            navigation.goBack();
        }catch{
            console.error("Error adding review to Firestore");
            alert("Error adding review to Firestore");
        }
    }

    /******* FUNCTIONS FOR UPLOAD IMAGES ******/
    // Read more about documentation here: https://docs.expo.dev/versions/latest/sdk/imagepicker/ 
    const getPermission = async() =>{
        if (Platform.OS === 'ios'){
            const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted'){
                alert('Please grant access to library to upload photos')
                return false;
            }
        }
        return true;
    }
    const selectImage = async() => {
        const permissionStatus = await getPermission();
        if (!permissionStatus) return; 

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect:[4,3],
            quality:1, // we can edit later for more
        })
        // console.log("image:", result);        
        if (!result.canceled){ // if image is selected, then save the latest upload
            if (toggle == true){
                setPost(prevPost => ({...prevPost, image: result.assets[0].uri}));
            }else{
                setReview(prevReview => ({...prevReview, image: result.assets[0].uri}))
            }
        }
    }
  
    /* function handleExit(): Brings user back to the last visited page
    * Also resets the data stored in the use state
     */
    const handleExit = () => {
        navigation.goBack();
        setReview({ foodName: '',
            location: '',
            price: null,
            taste: 0,
            health: 0,
            image: '',
            tags: [],
            comment: '',});
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
               
            {/* <TouchableOpacity onPress={handleExit}>
                <Text>Exit</Text>
             </TouchableOpacity> */}

            <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={()=>setToggle(true)} style={toggle ? styles.activeToggle : styles.inactiveToggle}>
                    <Text>Post</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setToggle(false)} style={toggle ?  styles.inactiveToggle : styles.activeToggle }>
                    <Text>Review</Text>
                </TouchableOpacity>
            </View>
            
            {toggle ? 
                <View>
                    
                    <Text> Comment </Text>
                    <TextInput 
                        style={styles.commentBox}
                        value={post.comment}
                        onChangeText={(text)=> setPost(prevPost => ({...prevPost, comment: text}))}
                        placeholder='enter comment'
                    />

                    <TouchableOpacity onPress={selectImage} >
                        <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleCreatePost}>
                        <Text>Add post</Text>
                    </TouchableOpacity>
    
                </View>
                : 
                <View style={styles.reviewContainer}>
                    
                    <TouchableOpacity onPress={selectImage} style={styles.imagebox}>
                        <Image source={require('../assets/camera.png')} style={styles.cameraIcon} />
                    </TouchableOpacity>
                     <Text> Food Name </Text>
                        <TextInput 
                            style={styles.textbox}
                            value={review.foodName}
                            onChangeText={handleChangeFoodName}
                            placeholder='ex. Apple'
                        />
                    <Text> Location </Text>
                         <TextInput 
                            style={styles.textbox}
                            value={review.location}
                            onChangeText={handleChangeLocation}
                            placeholder='ex. Collis Cafe'
                        />
                    <Text> Price </Text>
                        <TextInput 
                            style={styles.textbox}
                            value={review.price ? review.price.toString() :  null}
                            keyboardType='decimal-pad'
                            onChangeText={(text)=> setReview(prevReview => ({...prevReview, price: parseFloat(text) || -1 }))}
                            placeholder='enter price'
                        />
                     <Text> Taste </Text>
                     <Slider
                        style={styles.slider}
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
                        style={styles.slider}
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
                            style={styles.textbox}
                            value={tag}
                            onChangeText={(tag)=> setTag(tag)}
                            placeholder='enter a tag'
                            onSubmitEditing={handleSubmitTag}
                            returnKeyType='done'
                        />
                    <TouchableOpacity onPress={handleCreateReview} style={styles.addReviewBtn}>
                        <Text>Add review</Text>
                    </TouchableOpacity>
                </View>
             }

            <Navbar />
        </View>

    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:60,
        alignItems: 'center',
        backgroundColor: 'white', 
        
    },
    containerTop: {
      padding: 20,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white', 
    },
    text: {
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20, 
    },
    slider:{
        width: 300, 
        height: 40, 
        marginTop: 20, 
        marginBottom: 20,
        padding: 10, 
    },
    reviewContainer: {
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        borderColor: '#B7B7B7',
        borderStyle: 'solid',
        borderWidth: 2,
        width: '60%',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15,
    }, 
    activeToggle: {
        padding: 10,
        width: '50%',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#B7B7B7',
        borderRadius: 20,
        borderColor: '#B7B7B7',
        borderStyle: 'solid',
    },
    inactiveToggle: {
        padding: 9,
        width: '50%',
        borderRadius: 20,
        justifyContent: 'center',
        alignContent: 'center',
    },
    imagebox:{
        backgroundColor: '#D9D9D9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
        height: 179,
    },
    textbox: {
        borderColor: 'black',
        backgroundColor: '#D9D9D9',
        width: 300,
        height: 30,
        borderRadius: 10,
        padding: 10,
    },
    commentBox:{
        borderColor: 'black',
        backgroundColor: '#D9D9D9',
        width: 300,
        height: 100,
        borderRadius: 10,
        padding: 10,
    },
    cameraIcon:{
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    addReviewBtn: {
        borderRadius: 15,
        backgroundColor: '#B0B0B0',
        width: 124,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
});

export default Post;