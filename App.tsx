import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfilePictureEditorScreen from './screens/ProfilePictureEditorScreen';
import FavouriteScreen from './screens/FavouriteScreen';
import CartScreen from './screens/CartScreen';
import ForgotScreen from './screens/ForgotScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { House } from 'lucide-react-native';
import { Heart } from 'lucide-react-native';
import { Scissors } from 'lucide-react-native';
import { ShoppingCart } from 'lucide-react-native';
import { Provider } from 'react-redux';
import store from './components/redux/store';
import * as NotificationService from './services/notifications';

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
    </Tab.Navigator>
  )
}

export default App;