import { createStackNavigator } from '@react-navigation/stack';
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

import React, { useEffect, useState } from 'react';
import fonts from './fonts.js';
import { ActivityIndicator, View } from 'react-native';


const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await fonts();
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AutocompleteDropdownContextProvider>
      <NavigationContainer>
        <Stack.Navigator>
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
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />  
      </AutocompleteDropdownContextProvider>
    </AuthProvider>
  );
}