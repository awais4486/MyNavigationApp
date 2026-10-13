import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRAPI_API_URL } from '../../config/api';

export const getStoredToken = async () => {
    return AsyncStorage.getItem('token');
};

export const getAuthenticatedUser = async () => {
    const token = await getStoredToken();

    if (!token) {
        return null;
    }

    const response = await fetch(`${STRAPI_API_URL}/users/me?populate[0]=favourites&populate[1]=profilePicture`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        return null;
    }

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Could not load your account.');
    }

    const user = await response.json();
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return { token, user };
};

export const getOrderHistory = async () => {
    const result = await getAuthenticatedUser();

    if (!result) {
        return null;
    }

    const response = await fetch(
        `${STRAPI_API_URL}/orders?filters[user][id][$eq]=${result.user.id}&populate[order_items][populate][product]=true&sort=orderDate:desc`,
        { headers: { Authorization: `Bearer ${result.token}` } }
    );
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Could not load order history.');
    }

    return data.data || [];
};



export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    const response = await fetch(
        `${STRAPI_API_URL}/auth/local/register`,
        {
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
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || 'Registration Failed'
        );
    }

    return data;
};

export const sendPasswordResetEmail = async (email: string) => {
    const response = await fetch(
        `${STRAPI_API_URL}/auth/forgot-password`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || 'Password reset request failed'
        );
    }

    return data;
};

export const loginUser = async (
    identifier: string,
    password: string
) => {

    const response = await fetch(
        `${STRAPI_API_URL}/auth/local`,
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

    if (typeof data.jwt !== 'string' || !data.jwt) {
        throw new Error('Strapi login did not return a JWT.');
    }

    await AsyncStorage.setItem('token', data.jwt);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
};
