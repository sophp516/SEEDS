import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from './pages/Home.jsx';
import SelectedPost from './pages/SelectedPost.jsx';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} /> 
        <Stack.Screen name="SelectedPost" component={SelectedPost} options={{ headerShown: false }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}