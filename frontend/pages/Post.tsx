import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import SearchBar from '../components/Searchbar.tsx';

type PostProps = () => {}

const Post = () => {
    return (

        <View style={styles.container}>
          <View style={styles.containerTop}>
            <SearchBar />
          </View>
          
          <Text style={styles.text}>Post</Text>
          <Navbar /> 
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
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
});

export default Post;
