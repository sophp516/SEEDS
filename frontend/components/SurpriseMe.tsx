import React from 'react';
import { Text, View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import colors from '../styles';

const SurpriseMe = () => {
    return (
        <View style={styles.container}>
          <View style= {styles.top}>
          <Text style={styles.text}>Don't Know what to eat?</Text>
          <Image source={require('../assets/present.gif')} style={styles.image} />

          </View>

            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Surprise Me!</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    top:{
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    container: {
        backgroundColor: '#FFFFFF', // Set the background color to white
        borderColor: colors.grayStroke,
        borderWidth: 1,
        paddingBottom: 10,
        paddingTop: 7,
        paddingHorizontal: 7,
        borderRadius: 10,
        marginRight: 18,
        
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
        fontFamily: 'SpaceGrotesk-Bold',
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.orangeHighlight,
    },
    image: {
        width: 100,
        height: 50,
    },
    button: {
        backgroundColor: colors.orangeHighlight, // You can customize the button color
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF', // You can customize the text color
        fontSize: 16,
    },
});

export default SurpriseMe;
