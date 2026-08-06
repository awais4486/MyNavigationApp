import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const BASE_URL = 'http://localhost:1337/api';

export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {

    Alert.alert("Inside register()");
    console.log("Inside register()");

    console.log("Sending request...");
    const response = await fetch(
        
        `${BASE_URL}/auth/local/register`,
        {
            // console.log("Request sent");    
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        }
        
    );
    Alert.alert("Request completed");

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || 'Registration Failed'
        );
    }

    return data;
};
export const loginUser = async (
    identifier: string,
    password: string
) => {

    const response = await fetch(
        `${BASE_URL}/auth/local`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || 'Login Failed'
        );
    }

    await AsyncStorage.setItem('token', data.jwt);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
};