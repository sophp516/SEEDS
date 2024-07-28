import React from 'react';
import { View, Image, Dimensions } from 'react-native';

const CustomSplashScreen = () => {

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', width: '100%', height: '100%' }}>
      <Image
        source={require('../assets/launch4.jpg')}
        style={{
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
            position: 'absolute',
        }}
      />
    </View>
  );
};

export default CustomSplashScreen;