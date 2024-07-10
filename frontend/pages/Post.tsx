import { useState, useEffect } from 'react';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import CustomSlider from '../components/CustomSlider';
import * as ImagePicker from 'expo-image-picker';
import { db , storage } from '../services/firestore';
import { collection, addDoc, updateDoc, getDoc, doc, arrayUnion} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { ref, uploadBytes,getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useAuth } from '../context/authContext.js';
import diningLocation from '../services/dininglocation.json';
// import storage from '@react-native-firebase/storage';

interface newPost{
    images: string[];
    comment: string;
    timestamp?: string;
    postId?: string;
    userId: string;
}
interface newReview {
    reviewId?: string;
    userId: string;
    foodName: string;
    location: string;
    price: number| null;
    taste: number;
    health: number;
    images: string[];
    tags:string[] | null,
    comment: string|null,
    likes: number;
    timestamp?: string;
    subComments?: string[];
}

type RootStackParamList = {
    Post: { toggle: boolean, foodName: string };
};

// when click send, passes a object to the firebase function
const Post = () => {
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;
    const userId = loggedInUser?.loggedInUser?.uid;

    const [tag, setTag] = useState<string>('');
    // const route = useRoute<RouteProp<RootStackParamList, 'Post'>>();
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [post, setPost] = useState<newPost>({
        comment: '',
        images: [],
        userId: userId,
    });
    const [review, setReview] = useState<newReview>({
        userId: userId,
        foodName: '',
        location: '',
        price: null,
        taste: 0,
        health: 0,
        images: [],
        tags: [],
        comment: '',
        likes: 0,
        timestamp: null,
    });


    // How multiple images upload will work:
    // 1. User selects multiple images from gallery
    // 2. Images are stored in an array
    // 3. User clicks submit
    // 4. Images are uploaded to Firebase Storage one by one, the images in the final array are the URLs
    // 5. The URLs are stored in the Firestore document

    const handleUploadImage = async (image: string) => {
        try{
            const response = await fetch(image);
            const blob = await response.blob(); // convert 
            const imgName = "img-" + new Date().getTime();
            let refName;
            if (toggle == true){
                refName = 'posts';
            }else{
                refName = 'reviews';
            }
            const storageRef = ref(storage, `${refName}/${imgName}.jpg`)
            const snapshop = await uploadBytesResumable(storageRef, blob);
            const imageUrl = await getDownloadURL(storageRef);
            return imageUrl
        }
        catch{
            console.error("Error uploading image to Firestore");
        }
    }
    const handleCreatePost = async() => {
        try{
            let finalPost = {...post};
            const images = [];
            let timestamp = new Date().getTime();
            let date = new Date(timestamp);
            finalPost.timestamp = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

            if (post.images.length > 0 ){
                /* Tried to write a upload function, however that resulted in app crashing unless we keep path name the same*/
                for (let i = 0; i < post.images.length; i++){
                    // const response = await fetch(post.images[i]);
                    // const blob = await response.blob(); // convert 
                    // const imgName = "img-" + new Date().getTime();

                    // const storageRef = ref(storage, `post/${imgName}.jpg`)
                    // const snapshop = await uploadBytes(storageRef, blob);
                    // const imageUrl = await getDownloadURL(storageRef);
                    // setFinalPost((prevPost) => ({...prevPost, image: imageUrl}));
                    const imageUrl = await handleUploadImage(post.images[i]);
                    if (imageUrl) {
                        images.push(imageUrl)
                    };
                }
                finalPost.images = images
            }else{
                delete finalPost.images;
            }
            const postRef = await addDoc(collection(db, 'posts'), finalPost);
            const postID = postRef.id;
            await updateDoc(doc(db, 'reviews', postID), {reviewId: postID}); 
            
            console.log("Post added to Firestore with ID:", postRef.id);
            setPost({ images: [],comment: '', userId: userId}); // reset the post
        }catch{
            console.error("Error adding post to Firestore");
        }
    }


    const handleCreateReview = async () =>{
        try{
            let finalReview = {...review};
            const imageURls = [];
            let timestamp = new Date().getTime();
            let date = new Date(timestamp);
            finalReview.timestamp = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

            if (review.images.length + 1  > 0){
                console.error(review.images);
                for (let i = 0; i < review.images.length; i++){
                    try{
                        const url = await handleUploadImage(review.images[i]);
                        if (url) {
                            console.log("Image pushed:", url)
                            imageURls.push(url)
                        };
                    }catch{
                        console.error("Error uploading image to Firestore");
                    } 
                }
                finalReview.images = imageURls;
            }else{  
                delete finalReview.images;
            }
            // add to review Collection
            const reviewRef = await addDoc(collection(db, 'reviews'), finalReview);
            const reviewId = reviewRef.id;
            await updateDoc(doc(db, 'reviews', reviewId), {reviewId: reviewId}); 
            
            // ISSUE: The user ID does not mathc the user path in firebase 
            const userRef = doc(db, 'users', userId);
            console.log("userID:" , userId);
            const userSnapshot = await getDoc(userRef);
            if (!userSnapshot.exists()){
                console.error("User does not exist");
                // return;
            }
            try{
                await updateDoc(userRef, {reviews: arrayUnion(reviewId),
                });
            }catch{
                console.error("Error updating user's review list");
            }
            console.log("Review added to Firestore with ID:", reviewRef.id);
            setReview({ 
                userId: userId,
                foodName: '',
                location: '',
                price: null,
                taste: 0,
                health: 0,
                images:[],
                tags: [],
                comment: '',
                likes: 0,
                timestamp: null,
            }); // reset the review
            navigation.goBack();
        }catch{
            console.error("Error adding review to Firestore, have you signed in yet?");
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
            // allowsMultipleSelection: true,
            quality:1, // we can edit later for more
        })
        // console.log("image:", result);        
        if (!result.canceled){ // if image is selected, then save the latest upload
            let selected = result.assets.map((image) => image.uri);
            if (toggle == true){
                setPost(prevPost => ({...prevPost, images: [...(prevPost.images || []), ...selected]}));
            }else{
                setReview(prevReview => ({...prevReview, images: [...(prevReview.images || []), ...selected]}));
            }
        }
    }
   
    /* function handleExit(): Brings user back to the last visited page
    * Also resets the data stored in the use state
     */
    const handleExit = () => {
        navigation.goBack();
        navigation.addListener
        setReview({ 
            userId: userId,
            foodName: '',
            location: '',
            price: null,
            taste: 0,
            health: 0,
            images: [],
            tags: [],
            comment: '',
            likes: 0,
        });
    }
    /* Later we can do food reccomendation from API if time */
    const handleChangeFoodName = (text: string) => {
        setReview(prevReview => ({ ...prevReview, foodName: text }));
    };
    /* Later we can implement dropdown and auto complete text based off locations within the campus*/
    const handleChangeLocation = (text: string) => {
        setReview(prevReview => ({...prevReview, location: text}));
    }
    const handleSelectItem = (item) => {
        if (item) {
          setReview(prevReview => ({ ...prevReview, location: item.title })); // Adjust item.title to the correct property
        }
      };
    
    const handleSubmitTag = () => {
        if (tag){
            review.tags.push(tag);
            setTag('');
        }
    }
    const handleDeleteTag = (index) => {
        const newTags = review.tags.filter((tags, i) => i !== index);
        setReview((prev => ({...prev, tags: newTags})));
    }


    return (
        <View style={styles.container}>
               
            {/* <TouchableOpacity onPress={handleExit}>
                <Text>Exit</Text>
             </TouchableOpacity> */}

            <View style={styles.toggleContainer}>
                <TouchableOpacity onPress={()=>setToggle(true)} style={toggle ? styles.activeToggle : styles.inactiveToggle}>
                    <Text style={toggle ? styles.btnText1 : styles.btnText2}>Post</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setToggle(false)} style={toggle ?  styles.inactiveToggle : styles.activeToggle }>
                    <Text style={!toggle ? styles.btnText1 : styles.btnText2}>Review</Text>
                </TouchableOpacity>
            </View>
            
            {toggle ? 
                <View>
                    
                    <Text style={styles.text}> Comments </Text>
                    <TextInput 
                        style={styles.commentBox}
                        value={post.comment}
                        numberOfLines={100}
                        multiline={true}
                        onChangeText={(text)=> setPost(prevPost => ({...prevPost, comment: text}))}
                        placeholder='enter comment'
                    />
                    <TouchableOpacity onPress={selectImage} >
                        <Image source={require('../assets/postImg.png')} style={styles.postImgicon} />
                    </TouchableOpacity>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <TouchableOpacity style={styles.addPostBtn} onPress={handleCreatePost}>
                            <Text style={styles.btnText1}>Add post</Text>
                        </TouchableOpacity>
                    </View>
    
                </View>
                : 
                <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>   
                    <View style={styles.reviewContainer}>
                    {review.images.length > 0 ?   
                        <TouchableOpacity onPress={selectImage} >
                            <Image source={{uri: review.images[0] || null}} style={{width: 350, height: 179, borderRadius: 10, margin: 10,}} />
                        </TouchableOpacity>
                        :
                        <TouchableOpacity onPress={selectImage} style={styles.imagebox}>
                          <Image source={require('../assets/image.png')} style={styles.cameraIcon} />
                      </TouchableOpacity>
                    
                    }
                  
                    <View style={styles.reviewContentContainer}>
                        <Text style={styles.text}> Food name </Text>
                            <TextInput 
                                style={styles.textbox}
                                value={review.foodName}
                                onChangeText={handleChangeFoodName}
                                placeholder='ex. Apple'
                            />
                        <Text style={styles.text}> Location </Text>
                            {/* <TextInput 
                                style={styles.textbox}
                                value={review.location}
                                onChangeText={handleChangeLocation}
                                placeholder='ex. Collis Cafe'
                            /> */}
                            <AutocompleteDropdown 
                                dataSet={diningLocation}
                                onChangeText={handleChangeLocation}
                                onSelectItem={handleSelectItem}
                                direction={Platform.select({ ios: 'down' })}
                                onClear={() => handleChangeLocation('')}
                                initialValue={review.location}
                                textInputProps ={{
                                    placeholder: 'Enter location',
                                    value: review.location,
                                    autoCorrect: false,
                                     autoCapitalize: 'none',
                                    style: { 
                                        color: 'black',
                                        backgroundColor: '#E7E2DB',
                                        width: 325,
                                        maxWidth: 325,
                                        height: 30,
                                        borderRadius: 10,
                                        padding: 15,
                                    }
                                }}
                                inputContainerStyle={{
                                    backgroundColor: '#E7E2DB',
                                    width: 350,
                                }}
                            />

                        <Text style={styles.text}> Price </Text>
                            <TextInput 
                                style={styles.textbox}
                                value={review.price ? review.price.toString() :  null}
                                keyboardType='decimal-pad'
                                onChangeText={(text)=> setReview(prevReview => ({...prevReview, price: parseFloat(text) || null }))}
                                placeholder='0.00'
                            />
                        <Text style={styles.text}> Taste </Text>
                            <CustomSlider 
                                    minimumValue={1} 
                                    maximumValue={5}
                                    step={1}
                                    onValueChange={(value)=> setReview(prevReview => ({...prevReview, taste: value }))}
                                    value={review.taste}
                                    sliderColor='#F9A05F'
                                    trackColor='#E7E2DB'         
                            />
                        <Text style={styles.text}> Health</Text>
                            <CustomSlider 
                                    minimumValue={1} 
                                    maximumValue={5}
                                    step={1}
                                    onValueChange={(value)=> setReview(prevReview => ({...prevReview, health: value }))}
                                    value={review.health}
                                    sliderColor='#7FB676'
                                    trackColor='#E7E2DB'         
                            />
                        <Text style={styles.text}> Add Tags</Text>
                        <TextInput 
                                style={styles.textbox}
                                value={tag}
                                onChangeText={(tag)=> setTag(tag)}
                                placeholder='enter a tag'
                                onSubmitEditing={handleSubmitTag}
                                returnKeyType='done'
                        />
                        <View style={styles.tagsContainer} > 
                            {review.tags && review.tags.map((tag, index) =>
                                <View key={index} style={styles.tags}>
                                    <Text >{tag}</Text>
                                    <TouchableOpacity onPress={()=>handleDeleteTag(index)}>
                                        <Text> x </Text>
                                    </TouchableOpacity>
                                </View>)}   
                        </View>

                        <Text style={styles.text}> Comment </Text>
                             <TextInput 
                                style={styles.commentBox}
                                value={review.comment}
                                numberOfLines={100}
                                multiline={true}
                                onChangeText={(text)=> setReview(prevReview => ({...prevReview, comment: text}))}
                                placeholder='enter comment'/>
                        </View>
                        <TouchableOpacity onPress={handleCreateReview} style={styles.addReviewBtn}>
                            <Text style={styles.btnText1}>Add review</Text>
                        </TouchableOpacity>
                    </View>   
                </ScrollView>
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
        backgroundColor: '#FBFAF5', 
        
    },
    containerTop: {
      padding: 20,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white', 
    },
    text: {
        color: '#000',
        fontFamily: 'Satoshi',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: 0.1,
        textAlign: 'left',
        paddingVertical: 12,
    },
    btnText1:{ // white
        color: 'white',
        fontFamily: 'Satoshi',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: 0.1,
        textAlign: 'center',
    },
    btnText2:{ // white
        color: '#000',
        fontFamily: 'Satoshi',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 18,
        letterSpacing: 0.1,
        textAlign: 'center',
    },
    slider:{
        width: 200, 
        height: 40, 
        marginTop: 20, 
        marginBottom: 20,
        padding: 10, 
    },
    reviewContainer: {
        flex: 1,
        marginBottom: 60,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        //  backgroundColor: 'whitesmoke'
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        borderColor: '#B7B7B7',
        borderStyle: 'solid',
        borderWidth: 2,
        width: '70%',
        height: '4%',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15,
    }, 
    activeToggle: {
        padding: 5,
        width: '50%',
        justifyContent: 'center',
        alignContent: 'center',
        backgroundColor: '#E36609',
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
    reviewContentContainer:{
        justifyContent: 'flex-start',
    },
    imagebox:{
        backgroundColor: '#E7E2DB',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
        height: 179,
    },
    textbox: {
        borderColor: 'black',
        backgroundColor: '#E7E2DB',
        width: 350,
        height: 30,
        borderRadius: 10,
        padding: 10,
    },
    commentBox:{
        backgroundColor: '#E7E2DB',
        height: 200,
        width: 350,
        borderColor: 'black',
        borderRadius: 10,
        padding: 20,
        textAlign: 'left',
        textAlignVertical: 'top',
        flexWrap: 'wrap',
    },
    cameraIcon:{
        width: "30%",
        height: "50%",
        justifyContent: 'center',
    },
    postImgicon:{
        width: 45,
        height: 31,
        margin: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 10,
        borderColor: '#D1CABF',
        borderStyle: 'solid',
        borderWidth: 1,
        alignItems: 'center',
        width: 350,
        paddingVertical: 5,
        marginVertical: 10,
    },
    tags:{
        paddingHorizontal: 10,
        paddingVertical: 3,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: '#D9D9D9',
        flexDirection: 'row',
        marginHorizontal: 5,
        marginVertical: 5,
    },
    addReviewBtn: {
        borderRadius: 15,
        backgroundColor: '#E36609',
        width: 124,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    addPostBtn:{ // incase there may be difference styles
        borderRadius: 15,
        backgroundColor: '#E36609',
        width: 124,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
});

export default Post;