import React from 'react';
import { useState, useEffect , useCallback} from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal , KeyboardAvoidingView} from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import CustomSlider from '../components/CustomSlider';
import * as ImagePicker from 'expo-image-picker';
import { db , storage } from '../services/firestore';
import { collection, addDoc, updateDoc, getDoc, doc, arrayUnion, query, limit , getDocs, setDoc, count, Timestamp} from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { ref, uploadBytes,getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useAuth } from '../context/authContext.js';
import diningLocation from '../services/dininglocation.json';
import {debounce} from 'lodash';
import FoodDropdown from '../components/FoodDropdown.tsx';
import GeneralDropdown from '../components/GeneralDropdown.tsx';
import TagDropdown from '../components/TagDropdown.tsx';
import ImageSlider from '../components/ImageSlider.tsx';
import preferences from '../services/Preferences.json';
import Allergens from '../services/Allergens.json';
import Toast from 'react-native-toast-message';
import colors from '../styles.js';
import {ACCESS_TOKEN} from "@env";

interface newPost{
    images: string[];
    comment: string;
    timestamp?: Timestamp;
    postId?: string;
    userId: string;
    likes?:string[];
    isReview: boolean;
    uploadCount?: number;
    subComments: [];
}
interface newReview {
    reviewId?: string;
    userId: string;
    foodName: string;
    location: string;
    price?: number| null;
    taste: number;
    health: number;
    images: string[];
    tags:string[] | null,
    allergens: string[] | null,
    comment: string|null,
    likes?:string[];
    timestamp?: Timestamp;
    subComments: [];
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
    const userId = user.id
    const userSchool = loggedInUser?.loggedInUser?.schoolName;
    // const userRef = doc(db, 'users', userId);
    const [tag, setTag] = useState<string>('');
    const [allergen, setAllergen] = useState<string>('');
    // const route = useRoute<RouteProp<RootStackParamList, 'Post'>>();
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [toggle, setToggle] = useState<boolean>(true); // true = post, false = review 
    const [loading, setLoading] = useState<boolean>(false);
    const [post, setPost] = useState<newPost>({
        comment: '',
        images: [],
        userId: userId,
        likes: [],
        isReview: false,
        subComments: [],
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
        allergens: [],
        comment: '',
        likes: [],
        timestamp: null,
        isReview: true,
        subComments: [],
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [tagsData, setTagsData] = useState(preferences.id.map((tag, index)=>{
        return{
            id: index.toString(),
            title: tag
        }
    })); 
    const [allergensData, setAllergensData] = useState(Allergens.id.map((allergen, index)=>{
        return{
            id: index.toString(),
            title: allergen
        }
    }));

    const handleCreatePost = async() => {
        try{
            setLoading(true);
            console.log(userId);
            const userData = await verifyUser();
            if (!userData) return; 

            let finalPost = {...post};
            const images = [];
            let timestamp = new Date().getTime();
            let date = new Date(timestamp);
            const updatedAtTime = Timestamp.fromDate(new Date()); // curr date and time as in firestore
            finalPost.timestamp = updatedAtTime;

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
            setPost({ images: [],comment: '', userId: userId, isReview: true, subComments: []}); // reset the post
            setLoading(false);
            navigation.goBack();
            Toast.show({
                type: 'success',
                position: 'bottom',
                text1: 'Post submitted',
                text2: 'Thank you for sharing!',
                visibilityTime: 2000,
                autoHide: true,
            });
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
            // Verifies user
            const userData = await verifyUser();
            if (!userData) return; 
            setLoading(true);
            let finalReview = {...review};
            const imageURls = [];
            // // object version of the timestamp for firebase filtering 
            const updatedAtTime = Timestamp.fromDate(new Date()); // curr date and time as in firestore
            finalReview.timestamp = updatedAtTime;
            // proccesses the images 
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

            // Adding to review in the global collection where the information of each individual reviews are stored
            // console.log(finalReview);
            const reviewRef = await addDoc(collection(db, 'globalSubmissions'), finalReview);
            const reviewId = reviewRef.id;
            console.log("userID:", reviewId);
            const count = await getCount();
            if (count === -1) return;
            await updateDoc(doc(db, 'globalSubmissions', reviewId), {reviewId: reviewId, uploadCount: count});

            // UPDATES FOOD COLLECTION and FOODLIST 
            // checks whether the item is new and update document accordingly 
            // for item that exist, updates will be made to reviews, time, and tags frequency 
            await updateFoodCollection(review, reviewId, updatedAtTime, imageURls);
            await updateTagFrequency(review.foodName, review.tags, review.allergens);
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
                images:[],tags: [], allergens:[], comment: '',likes: [],timestamp: null,isReview: false, subComments: [],
            }); // reset the review
            setLoading(false);
            navigation.goBack();
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Review submitted',
                text2: 'Thank you for your review!',
                visibilityTime: 4000,
                autoHide: false,
            });
        }catch{
            console.error("Error adding review to Firestore, have you signed in yet?");
            alert("Error adding review to Firestore");
        }
    }
    // console.log("Review:", review.foodName);
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

    const updateFoodCollection = async(review, reviewId, updatedAtTime, imageURls) => {
        try{
            //paths
            const foodCollectionRef= collection(db,'colleges', 'Dartmouth College', 'diningLocations', review.location, review.foodName); // checks if food collection exist in location
            const localFoodlistRef = collection(db,'colleges', 'Dartmouth College', 'diningLocations', review.location, 'foodList'); // path for local foodlist within the dining hall
            const localFoodListDoc = doc(localFoodlistRef, review.foodName); // local foodlist doc, for ex. is smoothie in collis yet?
            const collegeFoodListDoc = doc(db, 'colleges', 'Dartmouth College', 'foodList', review.foodName); // used for checking if food already in global list
            // check for edge cases for if the food collection/doc exist or not
            const exist = await checkCollectionExist(foodCollectionRef); // if food collection exist
            const collegeFoodlistDocExist = await checkDocExist(collegeFoodListDoc); // if food already in global list
            const foodlistExist = await checkDocExist(collegeFoodListDoc); // add if not there
            
            // if food is not already in the global list, then we will add it there. 
            // Initializes the data with the review information 
            // Initalize nutrient data from api if available 
            if (collegeFoodlistDocExist === false){
                const [serving, calories, fat, carbs, protein] = await fetchNutrients(review.foodName);
                await setDoc(collegeFoodListDoc, {foodName: review.foodName, location: review.location,likes: [], tags: review.tags, allergens: review.allergens,
                    health:review.health, price: review.price, taste: review.taste, images: imageURls, averageRating: (review.taste + review.health)/2,
                    createdAt: updatedAtTime, updatedAt: updatedAtTime, serving: serving, calories: calories, fat: fat, carbs: carbs, protein: protein});
            }else{
                const [newAverage, newHealth, newTaste] = await calculateAverageRating(review.foodName, review.location, review.health, review.taste);
                console.log("new avg", newAverage)
                await updateDoc(collegeFoodListDoc, {averageRating: newAverage, health: newHealth, taste: newTaste, updatedAt: updatedAtTime});
            }
            
            // Adds the foodID to the food collection 
            if (exist === false){
                console.log('exist??:', exist)
                const foodDocRef = doc(db,'colleges', 'Dartmouth College', 'diningLocations', review.location, review.foodName, 'reviews');
                await setDoc(foodDocRef,{reviewIds: [reviewId]});
                await setDoc(localFoodListDoc, {foodName: review.foodName});
            }
            await updateDoc(doc(db,'colleges', 'Dartmouth College','diningLocations',review.location, review.foodName, 'reviews'),{reviewIds: arrayUnion(reviewId)});
           
        }catch{
            console.error("Error adding review to food collection");
            return;
        }
    }

    const fetchNutrients = async (foodName) => {
        const baseUrl = 'https://platform.fatsecret.com/rest/server.api';
        // takes the first search result, which is the most relevant and match closest to the search query
        const params = new URLSearchParams({
            method: 'foods.search',
            search_expression: foodName,
            max_results: '1',
            format: 'json'
        }).toString();
    
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${ACCESS_TOKEN}` 
        };
    
        try {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: headers,
                body: params  // Send parameters as the request body
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("Data:", data);
                if (!data || !data.foods || !data.foods.food) {
                    console.log("Food data is missing or incomplete");
                    return ["N/A", "N/A", "N/A", "N/A", "N/A"];
                }
                const fetchedName = data.foods.food.food_name;
                const nutrients = data.foods.food.food_description;
                // \d+ means matching more than one digit, | divides the nutrients string into 4 categories
                // \. means optional decimal
                // \d* will match zero or more digits
                // parentheses are used to capture the values
                const nutritionRegex = /Per (\d+) ?(g| bowl| package| cup|oz| | cups| container| serving | burger) - Calories: (\d+)kcal \| Fat: (\d+\.?\d*)g \| Carbs: (\d+\.?\d*)g \| Protein: (\d+\.?\d*)g/;
                const matches = nutrients.match(nutritionRegex);
                const serving = matches[1] + matches[2];     // Serving size
                const calories = matches[3];   // Calories value
                const fat = matches[4];       // Fat value
                const carbs = matches[5];     // Carbs value
                const protein = matches[6];   // Protein value
    
                console.log(`Serving size: ${serving}`);
                console.log(`Calories: ${calories} kcal`);
                console.log(`Fat: ${fat} g`);
                console.log(`Carbs: ${carbs} g`);
                console.log(`Protein: ${protein} g`);
                console.log(nutrients);

                return [serving, calories, fat, carbs, protein];
            } else {
                return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
            }
        } catch (error) {
            console.log("Error fetching nutrient data");
            return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
        }
    };


    //code for updating nutrients for a specific food item, turn test as false when no need to make any updates
    // handles when nutrients fetching fails, which commonly due to serving not matching the regex
    const [test, setTest] = useState(false);
    const editFirebase = async()=>{
        if (test === true){
            const foodNames = ["Korean Bulgogi Bowl", "Yogurt Parfait", "Tofu Burger"]
            for (const foodName of foodNames){
                try{
                    const docpath = doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName);
                    const [serving, calories, fat, carbs, protein] = await fetchNutrients(foodName);
                    console.log("Nutrients:", foodName,  serving, calories, fat, carbs, protein);
                    await updateDoc(docpath, {serving: serving, calories: calories, fat: fat, carbs: carbs, protein: protein});
                }catch{
                    console.error("Error updating nutrients");
                }
            }
        }
        setTest(false);
    }
    useEffect(()=>{
        editFirebase();
    }, [])


    const updateTagFrequency = async(foodName, tags, allergens) =>{
        const tagCollectionRef = collection(db,'colleges', 'Dartmouth College', "foodList", foodName, "tagsCollection")
        const allergenCollectionRef = collection(db,'colleges', 'Dartmouth College', "foodList", foodName, "allergensCollection");
        try{
            for (const tag of tags){
                const tagDocRef = doc(tagCollectionRef, tag)
                const tagDoc = await getDoc(tagDocRef)
                if (!tagDoc.exists()){
                    await setDoc(tagDocRef, {frequency: 1})
                }else{
                    const newCount = tagDoc.data().frequency + 1
                    await updateDoc(tagDocRef, {frequency: newCount})
                }   
            }
        }catch{
            console.log("Error updating tags frequency on firestore")
            return
        }
        try{
            for (const allergen of allergens){
                const allergenDocRef = doc(allergenCollectionRef, allergen)
                const allergenDoc = await getDoc(allergenDocRef)
                console.log("Does allergenDoc exist?", allergenDoc.exists());
                if (!allergenDoc.exists()){
                    await setDoc(allergenDocRef, {frequency: 1})
                }else{
                    const newCount = allergenDoc.data().frequency + 1
                    await updateDoc(allergenDocRef, {frequency: newCount})
                }
            }
        }catch{
            console.log("Error updating allergens frequency on firestore")
            return
        }
    }

    const calculateAverageRating = async (foodName, location, health, taste) => {
        try{
            const getAverage = await getDoc(doc(db, 'colleges', 'Dartmouth College', 'foodList', foodName));
            if (!getAverage.exists()) {
                console.error("avergage Document does not exist!");
                return; // Optionally handle this case more gracefully
            }
            const currAverage = getAverage.data().averageRating;
            const currHealth = getAverage.data().health;
            const currTaste = getAverage.data().taste; 
            console.log("curr rating:", currAverage);
            const reviews = await getDoc(doc(db, 'colleges', 'Dartmouth College',"diningLocations", location, foodName, 'reviews')); // Error with the logic here
            if (!reviews.exists()) {
                console.error(" review Document does not exist!");
                return; // Optionally handle this case more gracefully
            }
            const reviewIds = reviews.data().reviewIds;
            const length = reviewIds.length
            const newAverage = ((currAverage * length ) + ((health + taste)/2)) / (length + 1);
            const newHealth = ((currHealth * length) + health) / (length + 1);
            const newTaste = ((currTaste * length) + taste) / (length + 1);
            return [newAverage, newHealth, newTaste];

        }catch{
            console.error("Error calculating average rating");
        }
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
    // If have time, can set as a component 
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
        // const foodItem = fetchReviews(review.location);
        // console.log("foodItem:", foodItem);
        const permissionStatus = await getPermission();
        if (!permissionStatus) return; 

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: true,
            aspect:[4,3],
            allowsMultipleSelection: true,
            quality:0.8, // we can edit later for more
        })
        // console.log("image:", result);        
        if (!result.canceled){ // if image is selected, then save the latest upload
            let selected = result.assets.map((image, index) => image.uri);
            if (toggle == true){
                setPost(prevPost => ({...prevPost, images: [...(prevPost.images || []), ...selected]}));
            }else{
                setReview(prevReview => ({...prevReview, images: [...(prevReview.images || []), ...selected]}));
            }
        }
    }
    // console.log("review:", review.foodName);

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
            const imgName = `img-${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}`;
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

    const removeImage = (index) =>{
        const newImages = review.images.filter((_, idx) => idx !== index);
        setReview(prevReview => ({...prevReview, images: newImages}));
    }

    const removePostImage = (index) =>{
        const newImages = post.images.filter((_, idx) => idx !== index);
        setPost(prevPost => ({...prevPost, images: newImages}));
    }
   
    /* function handleExit(): Brings user back to the last visited page
    * Also resets the data stored in the use state
     */
    const handleExit = () => {
        navigation.goBack();
        navigation.addListener
        setReview({ userId: userId, foodName: '',location: '',price: null, taste: 0, health: 0, images: [],tags: [],allergens:[],
            comment: '',likes: [],isReview: true,subComments: []});
    }

    /* HANDLE USER INTERACTION FUNCTIONS*/
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

    const handlePriceChange = (text) => {
        // Check if the last character is numeric or if it's a valid float string
        if (text === '' || /^-?\d*\.?\d*$/.test(text)) {
            setReview(prevReview => ({
                ...prevReview,
                price: text === '' ? null : text  // Store the raw text for now
            }));
        }
    };

    const handleSelectItem = (item) => {
        if (item) {
        //   setReview(prevReview => ({ ...prevReview, location: item.title })); // Adjust item.title to the correct property
            setLocationInput(item.title);} };
    const handleSelectedFood = (food) => {
        if (food){
            setReview(prevReview => ({ ...prevReview, foodName: food.title }));
        }
    }
    
    const handleSubmitTag = () => {
        if (tag){
            review.tags.push(tag);
            setTag('');
        }
    }
    const handleSelectTag = (item) => {
        if (item){
            setReview(prevReview => ({...prevReview, tags: [...prevReview.tags, item.title]}));
        }
    }
    const handleSubmitAllergen = () => {
        if (allergen){
            review.allergens.push(allergen);
            setAllergen('');
    }}
    const handleSelectAllergen = (item) => {
        if (item){
            setReview(prevReview => ({...prevReview, allergens: [...prevReview.allergens, item.title]}));
        }
    }
    const handleDeleteTag = (index) => {
        const newTags = review.tags.filter((tags, i) => i !== index);
        setReview((prev => ({...prev, tags: newTags})));
    }
    const handleDeleteAllergen = (index) => {
        const newAllergens = review.allergens.filter((allergen, i) => i !== index);
        setReview((prev => ({...prev, allergens: newAllergens})));
    }
    // tag color: 
    const tagsContainer = (type, tags, handleDelete) => {

        return tags.map((tag, index) => (
            <View key={index} style={[styles.tags, {backgroundColor: getTagColor(type, tag)}]}>
                <Text style={styles.tagsText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleDelete(index)}>
                    <Image source={require('../assets/x_icon.png')} style={{width: 8, height: 8, marginLeft: 10}} />
                    {/* <Text style={styles.tagsText}> x </Text> */}
                </TouchableOpacity>
            </View>
        ));
    }

    const getTagColor = (type, tag) =>{
        const verifiedTags = preferences.id;
        const allergens = Allergens.id;
        let times = ['breakfast', 'lunch', 'dinner'];
        if (type === 'tags' && times.includes(tag.toLowerCase())){
            return '#F2C897';
        }
        else if (type === 'tags' && verifiedTags.includes(tag)){
            return '#7FB676';
        }else if(allergens.includes(tag)){
            return '#FF7D84'
        }
        else{
            return '#E7E2DB';
        }

    }

    return (
        <View style={styles.container}>
          <View style={{ margin: 15 }}></View>
          {loading === true ? (
            <View style={{ zIndex: 1, position: 'absolute', backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', height: '100%' }}>
              <Image source={require('../assets/Loading.gif')} style={{ width: 30, height: 30, marginBottom: 10, top: 430, left: 180 }} />
            </View>
          ) : (
            <View />
          )}
      
          {toggle ? (
            <View style={styles.headerContainer}>
              {/* <TouchableOpacity onPress={handleExit}>
                <Text>Exit</Text>
              </TouchableOpacity> */}
              <Text style={styles.header}>Create a new post</Text>
            </View>
          ) : (
            <View style={styles.headerContainer}>
              {/* <TouchableOpacity onPress={handleExit}>
                <Text>Exit</Text>
              </TouchableOpacity> */}
              <Text style={styles.header}>Create a new review</Text>
            </View>
          )}
      
          <View style={styles.toggleContainer}>
            <TouchableOpacity onPress={() => setToggle(true)} style={toggle ? styles.activeToggle : styles.inactiveToggle}>
              <Text style={toggle ? styles.btnText1 : styles.btnText1}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setToggle(false)} style={toggle ? styles.inactiveToggle : styles.activeToggle}>
              <Text style={!toggle ? styles.btnText1 : styles.btnText1}>Review</Text>
            </TouchableOpacity>
          </View>
      
          {toggle ? (
            // Post Section
            <View style={{ justifyContent: 'center' }}>
              <Text style={[styles.text, { flexDirection: 'row', alignItems: 'flex-start' }]}>Comments </Text>
      
              <TextInput
                style={styles.commentBox}
                value={post.comment}
                numberOfLines={100}
                multiline={true}
                onChangeText={(text) => setPost(prevPost => ({ ...prevPost, comment: text }))}
                placeholder='Share thoughts, updates, or questions about your campus dining!'
                placeholderTextColor={colors.textFaintBrown}
                autoCapitalize="none"
              />
              <View>
                {post.images.length > 0 ? (
                  <View style={styles.postUploadedImages}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{}}>
                      {post.images.map((image, index) => (
                        <View>
                          <TouchableOpacity style={styles.removePostImgBtn} onPress={()=> removePostImage(index)}>
                          <Image style={{ width: '25%', height: '25%', resizeMode: 'contain' }} source={require('../assets/x_icon.png')} />
                         </TouchableOpacity>
                        <View key={index}>
                          {modalVisible ? (
                            <Modal
                              animationType="slide"
                              transparent={true}
                              visible={modalVisible}
                              onRequestClose={() => {
                                setModalVisible(!modalVisible);
                              }}
                            >
                              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <Image source={{ uri: post.images[index] || null }} style={{ width: 400, height: 400, margin: 10, borderRadius: 10 }} />
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                  <Text style={{ fontFamily: 'Satoshi-Medium', fontSize: 16, color: colors.textGray }}>Close</Text>
                                </TouchableOpacity>
                                
                              </View>


                            </Modal>
                            
                          ) : (
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                              <Image source={{ uri: post.images[index] || null }} style={{ width: 100, height: 100, marginRight: 10, marginBottom: 10, borderRadius: 10 }} />
                            </TouchableOpacity>
                          )}
                        </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                <TouchableOpacity onPress={selectImage}>
                  <View style={styles.postImgIconContainer}>
                      <Image source={require('../assets/imageBrown.png')} style={styles.postImgicon} />
                    <Text style={styles.addImageText2}>Add image</Text>
                  </View>
                  </TouchableOpacity>
                )}
      
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <TouchableOpacity style={styles.addPostBtn} onPress={handleCreatePost}>
                    <Text style={styles.btnText2}>Add post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            // Review Section
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, width: '100%' }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 10}
            >
              <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={styles.reviewContainer}>
                  {review.images.length > 0 ? (
                    <View>
                        {/* doesn't work well rn, but at least allow remove something */}
                      <ImageSlider images={review.images} />
                      {review.images.map((image, index) => (
                        <TouchableOpacity style={styles.removeImageButton} onPress={()=> removeImage(index)}>
                            <Image style={{ width: '20%', height: '20%', resizeMode: 'contain' }} source={require('../assets/x_icon.png')} />
                        </TouchableOpacity>
                      ))}

                      <TouchableOpacity style={styles.addImageButton} onPress={selectImage}>
                        <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }} source={require('../assets/addMoreImage.png')} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={selectImage} style={styles.imagebox}>
                      <Image source={require('../assets/imageBrown.png')} style={styles.cameraIcon} />
                      <Text style={styles.addImageText}>Add image</Text>
                    </TouchableOpacity>
                  )}
      
                  <View style={styles.reviewContentContainer}>
                    <Text style={styles.text}>Food name</Text>
                    <View style={{ position: 'relative', marginTop: 0 }}>
                      <FoodDropdown
                        onChangeText={handleChangeFoodName}
                        onSelectItem={handleSelectedFood}
                        onClear={() => setReview(prevReview => ({ ...prevReview, foodName: '' }))}
                        food={review.foodName}
                      />
                    </View>
      
                    <Text style={styles.text}>Location</Text>
                    <GeneralDropdown
                      data={diningLocation}
                      onChangeText={(text) => { setLocationInput(text) }}
                      onClear={() => setLocationInput('')}
                      value={locationInput}
                      onSelectItem={handleSelectItem}
                      placeholder='Enter location'
                    />
      
                    <Text style={styles.text}>Price</Text>
                    <TextInput
                      style={styles.textbox}
                      value={review.price ? review.price.toString() : null}
                      keyboardType='decimal-pad'
                      onChangeText={handlePriceChange}
                      placeholder='Enter price (if none, leave blank)'
                      placeholderTextColor={colors.textFaintBrown}
                    />
                    <Text style={styles.text}>Taste</Text>
                    <CustomSlider
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      onValueChange={(value) => setReview(prevReview => ({ ...prevReview, taste: value }))}
                      value={review.taste}
                      sliderColor='#F9A05F'
                      trackColor='#E7E2DB'
                    />
                    <Text style={styles.text}>Health</Text>
                    <CustomSlider
                      minimumValue={1}
                      maximumValue={5}
                      step={1}
                      onValueChange={(value) => setReview(prevReview => ({ ...prevReview, health: value }))}
                      value={review.health}
                      sliderColor='#7FB676'
                      trackColor='#E7E2DB'
                    />
      
                    <Text style={styles.text}>Add tags</Text>
      
                    {review.tags.length > 0 ? (
                      <View style={styles.tagsContainer}>
                        {tagsContainer("tags", review.tags, handleDeleteTag)}
                      </View>
                    ) : (
                      <View />
                    )}
      
                    <TagDropdown
                      data={tagsData}
                      onChangeText={(text) => {setTag(text) }}
                      onClear={() => setTag('')}
                      value={tag}
                      onSelectItem={handleSelectTag}
                      placeholder={'Enter a tag'}
                      handleSubmit={handleSubmitTag}
                    />
      
                    <Text style={styles.text}>Add allergens</Text>
                    {review.allergens.length > 0 ? (
                      <View style={styles.tagsContainer}>
                        {tagsContainer("allergens", review.allergens, handleDeleteAllergen)}
                      </View>
                    ) : (
                      <View />
                    )}
                    <TagDropdown
                      data={allergensData}
                      onChangeText={(text) => { setAllergen(text) }}
                      onClear={() => setAllergen('')}
                      value={allergen}
                      onSelectItem={handleSelectAllergen}
                      placeholder={'Enter an allergen'}
                      handleSubmit={handleSubmitAllergen}
                    />
      
                    <Text style={styles.text}>Comment</Text>
                    <TextInput
                      style={styles.commentBox}
                      value={review.comment}
                      numberOfLines={100}
                      multiline={true}
                      onChangeText={(text) => setReview(prevReview => ({ ...prevReview, comment: text }))}
                      placeholder='Share your thoughts here'
                      autoCapitalize="none"
                    />
                  </View>
      
                  <TouchableOpacity onPress={handleCreateReview} style={styles.addReviewBtn}>
                    <Text style={styles.btnText2}>Add review</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
      
          <Navbar />
        </View>
      );      
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
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
        color: colors.textGray,
        fontFamily: 'Satoshi-Medium',
        fontSize: 17,
        // lineHeight: 18,
        // textAlign: 'left',
        paddingVertical: 10,
        marginLeft: 3,
    },
    header:{
        color: colors.textGray,
        fontFamily: 'SpaceGrotesk-SemiBold', 
        fontSize: 24,
        fontStyle: 'normal',
        lineHeight: 36,
        textAlign: 'left',
        // letterSpacing: -0.264,
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 40, 
        alignItems: 'flex-start',
        flexDirection: 'row',
      },
    btnText1:{ // white
        color: '#35353E',
        fontFamily: 'Satoshi-Medium', 
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 21, 
        // letterSpacing: -0.154,
        textAlign: 'center',
    },
    btnText2:{ // white
        color: colors.backgroundGray,
        fontFamily: 'SpaceGrotesk-SemiBold', 
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 21, 
        textAlign: 'center',
        // letterSpacing: -0.154,
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
    reviewContentContainer:{
        justifyContent: 'flex-start',
         flexGrow: 1,
        // justifyContent: 'space-between'
    },
    imagebox:{
        backgroundColor: colors.commentContainer,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 350,
        height: 180,
        margin: 10,
    },
    addImageButton:{
        position: 'absolute',
        bottom: 0,  // Adjust top and right as needed to position the button in the desired corner
        right: -60,
        width: 65,  // Set the size of the button
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageButton:{
        position: 'absolute',
        bottom: 180,  
        right: -75,
        width: 50,  // Set the size of the button
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
       
    },
    removePostImgBtn:{
        backgroundColor:'#EEE9E3', 
        width: 18, 
        height: 18, 
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        position: 'absolute',
        top: 5,
        right: 15,
        zIndex: 1,
        
    },
    addImageText: {
        color: colors.textFaintBrown,
        fontFamily: 'Satoshi-Medium',
        fontSize: 16,
        marginTop: 5,
    },
    addImageText2: {
        color: colors.textFaintBrown,
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        marginLeft: 5,
    },
    textbox: {
        // borderColor: 'black',
        fontFamily: 'Satoshi-Medium',
        fontSize: 15,
        color: colors.textGray,
        backgroundColor: colors.commentContainer,
        width: 350,
        height: 35,
        borderRadius: 10,
        paddingHorizontal: 12,
    },
    commentContainer:{
        justifyContent: 'center',  // Centers children vertically
        width: '100%',
    },
    commentBox:{
        fontFamily: 'Satoshi-Medium',
        fontSize: 15,
        color: colors.textGray,
        backgroundColor: colors.commentContainer,
        height: 200,
        width: 350,
        borderColor: 'black',
        borderRadius: 10,
        padding: 13,
        textAlign: 'left',
        textAlignVertical: 'top',
        flexWrap: 'wrap',
    },
    cameraIcon:{
        width: "30%",
        height: "30%",
        justifyContent: 'center',
        resizeMode: 'contain',
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
        marginTop: 10,
        // width: 350,
    },
    postImgicon:{
        width: 25,
        height: 25,
        // margin: 10,
        resizeMode: 'contain',
        marginRight: 5,
    },
    postImgIconContainer:{
        backgroundColor: colors.commentContainer,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        width: 125,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignItems: 'center',
        // justifyContent: 'center',
        flexDirection: 'row',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 10,
        borderColor: '#D1CABF',
        borderStyle: 'solid',
        borderWidth: 2,
        alignItems: 'center',
        width: 350,
        paddingVertical: 4,
        paddingLeft: 5,
        marginVertical: 10,
        marginTop:-2,
    },
    tags:{
        paddingHorizontal: 10,
        paddingVertical: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        flexDirection: 'row',
        marginHorizontal: 5,
        marginVertical: 5,
    },
    tagsText: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        color: colors.textGray,
    },
    tagsX: {
        fontFamily: 'Satoshi-Medium',
        fontSize: 14,
        color: colors.textGray,
    },
    allergens:{
        paddingHorizontal: 10,
        paddingVertical: 3,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
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
        margin: 15,
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