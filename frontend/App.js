import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './pages/Home.tsx';
import SelectedPost from './pages/SelectedPost.tsx';
import Post from './pages/Post.tsx';
import Profile from './pages/Profile.tsx';
import Discover from './pages/Discover.tsx';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} /> 
        <Stack.Screen name="Post" component={Post} options={{ headerShown: false }} /> 
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        <Stack.Screen name="Discover" component={Discover} options={{ headerShown: false }} /> 
        <Stack.Screen name="SelectedPost" component={SelectedPost} options={{ headerShown: false }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}