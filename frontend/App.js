import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './context/authContext.js';
import { AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import Home from './pages/Home.tsx';
import SelectedPost from './pages/SelectedPost.tsx';
import OnTheMenu from './pages/OnTheMenu.tsx';
import Post from './pages/Post.tsx';
import Profile from './pages/Profile.tsx';
import Discover from './pages/Discover.tsx';
import DiningHome from './pages/DiningHome.tsx';
import SignUp from './pages/SignUp.tsx';
import LogIn from './pages/LogIn.tsx';
import Toast from 'react-native-toast-message';
import Ranking from './pages/Ranking.tsx';
import SelectedMenu from './pages/SelectedMenu.tsx';
import MyActivity from './pages/MyActivity.tsx';
import MyPreferences from './pages/MyPreferences.tsx';
import MyProfile from './pages/MyProfile.tsx';
import React, { useEffect, useState } from 'react';
import TopRated from './pages/TopRated.tsx';
import fonts from './fonts.js';
import { ActivityIndicator, View, Text } from 'react-native';
import { useFonts } from "expo-font";
import RecommendedForYou from './pages/RecommendedForYou.tsx';
import CustomSplashScreen from './pages/CustomSplashScreen.js';
import SurpriseMe from './pages/SurpriseMe.tsx';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk-Light': require('./assets/fonts/SpaceGrotesk-Light.ttf'),
    'SpaceGrotesk-Regular': require('./assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Medium': require('./assets/fonts/SpaceGrotesk-Medium.ttf'),
    'SpaceGrotesk-SemiBold': require('./assets/fonts/SpaceGrotesk-SemiBold.ttf'),
    'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.ttf'),
    'SpaceGrotesk-Variable': require('./assets/fonts/SpaceGrotesk-Variable.ttf'),
    'Satoshi-Light': require('./assets/fonts/Satoshi-Light.otf'),
    'Satoshi-Regular': require('./assets/fonts/Satoshi-Regular.otf'),
    'Satoshi-Medium': require('./assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-Bold': require('./assets/fonts/Satoshi-Bold.otf'),
    // 'Satoshi-Variable': require('./assets/fonts/Satoshi-Variable.ttf'),
  });

  useEffect(() => {
    // Simulate any loading process here
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show splash screen for 2 seconds
  }, []);

  if (!fontsLoaded || isLoading) {
    return <CustomSplashScreen />;
  }

  return (
    <AuthProvider>
      <AutocompleteDropdownContextProvider>
      <NavigationContainer>
        <Stack.Navigator
          // disabled sliding animation 
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forNoAnimation // Disable animation
          }}>

          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} /> 
          <Stack.Screen name="Post" component={Post} options={{ headerShown: false }} /> 
          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          <Stack.Screen name="Discover" component={Discover} options={{ headerShown: false }} /> 
          <Stack.Screen name="SelectedPost" component={SelectedPost} options={{ headerShown: false }} />
          <Stack.Screen name="DiningHome" component={DiningHome} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="LogIn" component={LogIn} options={{ headerShown: false }} />  
          <Stack.Screen name="Ranking" component={Ranking} options={{ headerShown: false }} />  
          <Stack.Screen name="SelectedMenu" component={SelectedMenu} options={{ headerShown: false }} /> 
          <Stack.Screen name="OnTheMenu" component={OnTheMenu} options={{ headerShown: false }} />  
          <Stack.Screen name="TopRated" component={TopRated} options={{ headerShown: false }} /> 
          <Stack.Screen name="RecommendedForYou" component={RecommendedForYou} options={{ headerShown: false }} /> 
          <Stack.Screen name="MyActivity" component={MyActivity} options={{ headerShown: false }} />
          <Stack.Screen name="MyPreferences" component={MyPreferences} options={{ headerShown: false }} />
          <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} /> 
          <Stack.Screen name="SurpriseMe" component={SurpriseMe} options={{ headerShown: false }} /> 
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />  
      </AutocompleteDropdownContextProvider>
    </AuthProvider>
  );
}