import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import colors from '../styles';

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/dino.png')} style={styles.dinoImage} />
            <View style={styles.thinkingContainer}>
                <View style={styles.overlayContainer}>
                    <Image source={require('../assets/Thinking.gif')} style={styles.thinkingGif} />
                    <Image source={require('../assets/loadingDot.gif')} style={styles.loadingDotGif} />
                    <Text style={styles.text}>Just a Moment, Please...</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderColor: colors.backgroundGray,
        borderWidth: 1,
        paddingBottom: 10,
        paddingTop: 7,
        paddingHorizontal: 7,
        borderRadius: 10,

    },
    thinkingContainer: {
        position: 'relative',
        width: 100,
        height: 100,
    },
    overlayContainer: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    thinkingGif: {
        width: 120,
        height: 96,
        position: 'absolute',
        top: -60,
        left: -90,
    },
    loadingDotGif: {
        width: 210,
        height: 210,
        position: 'absolute',
        top: -125,
        left: -135,
    },
    text: {
        fontSize: 20,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textGray,
        top: 60,
        left: -10,
        
    },
    image: {
        width: 100,
        height: 50,

    },

    dinoImage: {
        width: 100,
        height: 140,
        marginRight: 10,
        marginTop: 10,
    },
});

export default LoadingScreen;
