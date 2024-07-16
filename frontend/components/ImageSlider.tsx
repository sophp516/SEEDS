import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions , Image, TouchableOpacity} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const ImageSlider = ({images}) => {
    const width = Dimensions.get('window').width - 50;
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', width: 200}}>
            <Carousel
                // loop
                width={width}
                height={width / 2}
                autoPlay={false}
                data={images}
                // scrollAnimationDuration={1000}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({ index }) => (
                    <View
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderRadius: 10,
                            justifyContent: 'center',
                            
                        }}
                    >   
              
                        <Image style={{ width: '100%', height: '100%' }} source={{uri: images[index]}}  />

                         
                    </View>
                )}
            />
            <View style={styles.indicatorContainer}>
                {images.map((item, index) => (
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