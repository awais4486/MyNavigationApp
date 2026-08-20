import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:1337/api';

export const getStoredToken = async () => {
    return AsyncStorage.getItem('token');
};

export const getAuthenticatedUser = async () => {
    const token = await getStoredToken();

    if (!token) {
        return null;
    }

    const response = await fetch(`${BASE_URL}/users/me?populate=favourites`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        return null;
    }

    const user = await response.json();
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return { token, user };
};

export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    const response = await fetch(
        `${BASE_URL}/auth/local/register`,
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

    if (typeof data.jwt !== 'string' || !data.jwt) {
        throw new Error('Strapi login did not return a JWT.');
    }

    await AsyncStorage.setItem('token', data.jwt);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));

    return data;
};