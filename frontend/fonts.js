import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

const fonts = async () => {
  await Font.loadAsync({
    'SpaceGrotesk-Light': require('./fonts/SpaceGrotesk-Light.ttf'),
    'SpaceGrotesk-Regular': require('./fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('./fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-SemiBold': require('./fonts/SpaceGrotesk-SemiBold.ttf'),
    'SpaceGrotesk-Bold': require('./fonts/SpaceGrotesk-Bold.ttf'),
    'SpaceGrotesk-Variable': require('./fonts/SpaceGrotesk-Variable.ttf'),
  });
};

export default fonts;