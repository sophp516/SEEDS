import { useState, useEffect , useCallback} from 'react';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import CustomSlider from '../components/CustomSlider';
import * as ImagePicker from 'expo-image-picker';
import { db , storage } from '../services/firestore';
import { collection, addDoc, updateDoc, getDoc, doc, arrayUnion, query, limit , getDocs, setDoc, count} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { ref, uploadBytes,getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useAuth } from '../context/authContext.js';
import diningLocation from '../services/dininglocation.json';
import {debounce} from 'lodash';
// import storage from '@react-native-firebase/storage';

interface newPost{
    images: string[];
    comment: string;
    timestamp?: string;
    postId?: string;
    userId: string;
    likes?:string[];
    isReview: boolean;
    uploadCount?: number;
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
    likes?:string[];
    timestamp?: string;
    subComments?: string[];
    isReview: boolean;
    uploadCount?: number;
}

type RootStackParamList = {
    Post: { toggle: boolean, foodName: string };
};

// when click send, passes a object to the firebase function
const Post = () => {
    const { user, setLoggedInUser } = useAuth();
    const { loggedInUser, displayName } = user;
    const userId = loggedInUser?.loggedInUser?.uid;
    const userSchool = loggedInUser?.loggedInUser?.schoolName;
    // const userRef = doc(db, 'users', userId);
    const [tag, setTag] = useState<string>('');
    // const route = useRoute<RouteProp<RootStackParamList, 'Post'>>();
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [post, setPost] = useState<newPost>({
        comment: '',
        images: [],
        userId: userId,
        likes: [],
        isReview: false,
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
        likes: [],
        timestamp: null,
        isReview: true,
    });
    const [modalVisible, setModalVisible] = useState(false);


    const handleCreatePost = async() => {
        try{
            const userData = await verifyUser();
            if (!userData) return; 

            let finalPost = {...post};
            const images = [];
            let timestamp = new Date().getTime();
            let date = new Date(timestamp);
            finalPost.timestamp = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

            if (post.images.length > 0 ){
                /* Tried to write a upload function, however that resulted in app crashing unless we keep path name the same*/
                for (let i = 0; i < post.images.length; i++){
                    console.log(post.images);
                    const imageUrl = await handleUploadImage(post.images[i]);
                    if (imageUrl) {
                        images.push(imageUrl)
                    };
                }
                finalPost.images = images
            }else{
                delete finalPost.images;
            }

            const postRef = await addDoc(collection(db, 'globalSubmissions'), finalPost);
            const postID = postRef.id;
            const count = await getCount(); 
            if (count === -1) return;
            await updateDoc(doc(db, 'globalSubmissions', postID), {postId: postID, uploadCount: count});
            try{
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {submissions: arrayUnion(postID),
                });
            }catch{
                console.error("Error updating user's review list");
            }

            // Adding reviewID to food collection for destined college and discover  
            await submitDiscover(userData.data().schoolName, postID);
            
            console.log("Post added to Firestore with ID:", postRef.id);
            setPost({ images: [],comment: '', userId: userId, isReview: true}); // reset the post
        }catch{
            console.error("Error adding post to Firestore, have you signed in yet");
        }
    }
    const verifyUser = async() => {
        const userRef = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()){
            return userSnapshot;
        }else {
            console.error("User does not exist");
            return null;
    };}

    const handleCreateReview = async () =>{
        try{
            const userData = await verifyUser();
            if (!userData) return; 

            // current I can't get access to user's school without the full pathname
            // const locationExist = await verifyLocation("Dartmouth College", review.location);
            // if (!locationExist){
            //     console.log(userSnapshot.data().schoolName)
            //     console.error("Location does not exist");
            //     return;
            // }

            let finalReview = {...review};
            const imageURls = [];
            let timestamp = new Date().getTime();
            let date = new Date(timestamp);
            finalReview.timestamp = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;

            if (review.images.length > 0){
                console.log("images in the array:", review.images);
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
            // Adding to review collection
            const reviewRef = await addDoc(collection(db, 'globalSubmissions'), finalReview);
            const reviewId = reviewRef.id;
            const count = await getCount();
            if (count === -1) return;
            await updateDoc(doc(db, 'globalSubmissions', reviewId), {reviewId: reviewId, uploadCount: count});
            // UPDATES FOOD COLLECTION
            try{
                const foodCollectionRef= collection(db,'colleges', 'Dartmouth College', 'diningLocations', review.location, review.foodName);
                const exist = await checkCollectionExist(foodCollectionRef);
                if (exist === false){
                    console.log('exist??:', exist)
                    const foodDocRef = doc(db,'colleges', 'Dartmouth College', 'diningLocations', review.location, review.foodName, 'reviews');
                    await setDoc(foodDocRef,{reviewIds: [reviewId]});
                }
                await updateDoc(doc(db,'colleges', 'Dartmouth College','diningLocations',review.location, review.foodName, 'reviews'),{reviewIds: arrayUnion(reviewId)})
               
            }catch{
                console.error("Error adding review to food collection");
                return;
            }

            // UPDATES DISOCVER COLLECTION
            await submitDiscover(review.location, reviewId);
            // Add ID to user 
            try{
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {submissions: arrayUnion(reviewId),
                });
            }catch{
                console.error("Error updating user's review list");
            }
            
            console.log("Review added to Firestore with ID:", reviewRef.id);
            setReview({ userId: userId, foodName: '',location: '',price: null, taste: 0,health: 0,
                images:[],tags: [],comment: '',likes: [],timestamp: null,isReview: false,
            }); // reset the review
            navigation.goBack();
        }catch{
            console.error("Error adding review to Firestore, have you signed in yet?");
            alert("Error adding review to Firestore");
        }
    }

    // Full path: Colleges/CollegeName/Location/Collection/
    const verifyLocation = async(college, location: string) => {
        try{
            const locationRef = doc(db, 'colleges', `${college}`,'diningLocations', `${location}`); // post and review must exist
            console.log("Location path:", locationRef);
            const snapshop = await getDoc(locationRef);
            if (snapshop.exists()){
                console.log("Location exists");
                return true;
            }else{
                console.error("Location does not exist");
                return false;
            }
        }catch{
            console.log("Error verifying location");
        }
    }

    const checkCollectionExist = async(ref) => {
        try{
            const querySnapshot = await getDocs(ref)
            return querySnapshot.size > 0;
        }catch(e){
            console.log("There is error with checking the existence of the collection");
            return false;
        }
    };
    const checkDocExist = async(ref) => {
        try{
            const docSnap = await getDoc(ref);
            return docSnap.exists();
        }catch(e){console.log("There is error with checking the existence of the document"); return}
    }

    const submitDiscover = async(location, id) => {
        try{
            const discoveryRef = doc(db,'colleges', 'Dartmouth College', 'discover', 'submissions');
            const discoverExistent = await checkDocExist(discoveryRef);
            console.log("Discover exist?:", discoverExistent);
            if (discoverExistent === false) {
               await setDoc(discoveryRef,{submissions: [id]});
            }else{
               updateDoc(discoveryRef,{submissions: arrayUnion(id)});
            }
       }catch{
           console.error("Error adding review to discover collection");
           return;
       }
    }
    const getCount = async() => {
        try{
            const getCount = await getDoc(doc(db, 'globalData', 'uploadCount'));
            updateDoc(doc(db, 'globalData', 'uploadCount'), {count: getCount.data().count + 1});
            return getCount.data().count;
        }catch{
            console.error("Error getting count");
            return -1;
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
            // allowsEditing: true,
            aspect:[4,3],
            allowsMultipleSelection: true,
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
            likes: [],
            isReview: true
        });
    }
    /* Later we can do food reccomendation from API if time */
    const handleChangeFoodName = (text: string) => {
        setReview(prevReview => ({ ...prevReview, foodName: text }));
    };
    /* Later we can implement dropdown and auto complete text based off locations within the campus*/
    const handleChangeLocation = useCallback(debounce((text: string) => {
        setReview(prevReview => ({ ...prevReview, location: text }));
    }, 1000), []);

    const [locationInput, setLocationInput] = useState<string>('');
    // Using useeffect to reduce re render, but still slow

    useEffect(()=>{
        const timeout = setTimeout(() => (handleChangeLocation(locationInput)), 1000);
        return () => clearTimeout(timeout);
    }, [locationInput]);


    const handleSelectItem = (item) => {
        if (item) {
        //   setReview(prevReview => ({ ...prevReview, location: item.title })); // Adjust item.title to the correct property
            setLocationInput(item.title);} };
    
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
                // Post Section
                <View style={{justifyContent: 'center'}}>

                    <Text style={[styles.text, {flexDirection:'row', alignItems:'flex-start'}]}> Comments </Text>

                    <TextInput 
                        style={styles.commentBox}
                        value={post.comment}
                        numberOfLines={100}
                        multiline={true}
                        onChangeText={(text)=> setPost(prevPost => ({...prevPost, comment: text}))}
                        placeholder='enter comment'
                    />
                    <View >
                        {post.images.length > 0 ? 
                            <View style={styles.postUploadedImages}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{}}>
                                    {post.images.map((image, index) =>(
                                        <View>
                                        {modalVisible ? 
                                        <Modal
                                            animationType="slide"
                                            transparent={true}
                                            visible={modalVisible}
                                            onRequestClose={() => {
                                                setModalVisible(!modalVisible);
                                            }}
                                        >
                                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                                                <Image source={{uri: post.images[index] || null}} style={{width: 400, height: 400, margin: 10}} />
                                                <TouchableOpacity onPress={()=>setModalVisible(false)}>
                                                    <Text>Close</Text>
                                                </TouchableOpacity>
                                            </View>

                                        </Modal>
                                        :
                                         <TouchableOpacity onPress={()=>setModalVisible(true)}>
                                         <Image key={index} source={{uri: post.images[index] || null}} style={{width: 100, height: 100, margin: 10}} />
                                     
                                         </TouchableOpacity>
                                        }
                                       
                                        </View>
                                      

                                    ))}
                                </ScrollView>
                                <TouchableOpacity onPress={selectImage} >
                                    <Image source={require('../assets/postImg.png')} style={styles.postImgicon} />
                                </TouchableOpacity>
                        </View>
                    :
                        <TouchableOpacity onPress={selectImage} >
                            <Image source={require('../assets/postImg.png')} style={styles.postImgicon} />
                        </TouchableOpacity>
                    }
                   
                        <View style={{alignItems: 'center', justifyContent: 'center'}}>
                            <TouchableOpacity style={styles.addPostBtn} onPress={handleCreatePost}>
                                <Text style={styles.btnText1}>Add post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
    
                </View>
                : 

                // Review Section
                <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>   
                    <View style={styles.reviewContainer}>
                
                    {review.images.length > 0 ?   
                        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{}}>
                           {review.images.map((image, index) =>(
                                <Image source={{uri: review.images[index] || null}} style={styles.uploadedImageContainer} />
                            ))}
                            <TouchableOpacity onPress={selectImage} style={styles.imagebox} >
                                <Image source={require('../assets/image.png')} style={styles.cameraIcon}/>
                            </TouchableOpacity>
                       </ScrollView>
                        
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
                           
                            <AutocompleteDropdown 
                                dataSet={diningLocation}
                                onChangeText={(text)=> {setLocationInput (text)}}
                                onSelectItem={handleSelectItem}
                                direction={Platform.select({ ios: 'down' })}
                                onClear={() => setLocationInput('')}
                                initialValue={locationInput}
                                textInputProps ={{
                                    placeholder: 'Enter location',
                                    value: locationInput,
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
        height: 180,
        margin: 10,
    },
    textbox: {
        borderColor: 'black',
        backgroundColor: '#E7E2DB',
        width: 350,
        height: 35,
        borderRadius: 10,
        paddingHorizontal: 10,
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
    uploadedImageContainer : {
        width: 350, 
        height: 180, 
        borderRadius: 10, 
        margin: 10,
    },
    postUploadedImages:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        width: 350,
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