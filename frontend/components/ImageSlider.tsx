import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const ImageSlider = ({ images }) => {
    const width = Dimensions.get('window').width - 50;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loadingStates, setLoadingStates] = useState(new Array(images.length).fill(true)); // All images are initially loading

    const handleLoad = (index) => {
        const updatedLoadingStates = [...loadingStates];
        updatedLoadingStates[index] = false; // Set loading state to false when the image is loaded
        setLoadingStates(updatedLoadingStates);
    };

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', width: 200}}>
            <Carousel
                width={width}
                height={width / 1.5}
                autoPlay={false}
                data={images}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({ index }) => (
                    <View style={styles.imageContainer}>
                        {loadingStates[index] && (
                            <ActivityIndicator size="small" color="grey" style={styles.activityIndicator} />
                        )}
                        <Image 
                            style={{ width: '100%', height: '100%' }} 
                            source={{ uri: images[index] }} 
                            onLoad={() => handleLoad(index)}
                        />
                    </View>
                )}
            />
            <View style={styles.indicatorContainer}>
                {images.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: currentIndex === index ? '#606060' : '#FBFAF5' }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export default ImageSlider;

const styles = StyleSheet.create({
    imageContainer: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {
        position: 'absolute',
        zIndex: 1,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        position: 'absolute',
        bottom: 0,
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});