import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfilePictureEditorScreen from './src/screens/ProfilePictureEditorScreen';
import ProfileCameraScreen from './src/screens/ProfileCameraScreen';
import FavouriteScreen from './src/screens/FavouriteScreen';
import CartScreen from './src/screens/CartScreen';
import OrderHistoryScreen from './src/screens/OrderHistoryScreen';
import ForgotScreen from './src/screens/ForgotScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { House } from 'lucide-react-native';
import { Heart } from 'lucide-react-native';
import { Scissors } from 'lucide-react-native';
import { ShoppingCart } from 'lucide-react-native';
import { History } from 'lucide-react-native';
import { Provider } from 'react-redux';
import store from './components/redux/store';
import * as NotificationService from './src/services/notifications';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  useEffect(() => {
    const initializeNotifications = async () => {
      if (typeof NotificationService.setupNotifications === 'function') {
        await NotificationService.setupNotifications();
      }
    };

    void initializeNotifications();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, 
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
        />

        <Stack.Screen
          name="RegisterScreen"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="ProfilePictureEditor"
          component={ProfilePictureEditorScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="ProfileCamera"
          component={ProfileCameraScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={BottomTabs}
        />

        <Stack.Screen
          name="DetailScreen"
          component={DetailScreen}
        />

        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
        />

        <Stack.Screen
          name="ForgotScreen"
          component={ForgotScreen}
        />
        
      </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen
        name="Products"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <House size={24} color={color} />
          )
        }}
      />

      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Scissors size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Favourite"
        component={FavouriteScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Heart size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <ShoppingCart size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color }) => (
            <History size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

export default App;