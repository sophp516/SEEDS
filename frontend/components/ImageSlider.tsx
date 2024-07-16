import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const ImageSlider = () => {
    const width = Dimensions.get('window').width;
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <View style={{ flex: 1 }}>
            <Carousel
                loop
                width={width}
                height={width / 2}
                autoPlay={false}
                data={[...new Array(6).keys()]}
                // scrollAnimationDuration={1000}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({ index }) => (
                    <View
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ textAlign: 'center', fontSize: 30 }}>
                            {index}
                        </Text>
                    </View>
                )}
            />
            <View style={styles.indicatorContainer}>
                {[...new Array(6).keys()].map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            { backgroundColor: currentIndex === index ? 'black' : 'gray' }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

export default ImageSlider;

const styles = StyleSheet.create({
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    dot: {
        height: 10,
        width: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});