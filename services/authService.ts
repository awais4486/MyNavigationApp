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

export const getAuthenticatedCart = async () => {
    const token = await getStoredToken();

    if (!token) {
        return null;
    }

    const userResponse = await fetch(`${BASE_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (userResponse.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        return null;
    }

    if (!userResponse.ok) {
        const data = await userResponse.json();
        throw new Error(data.error?.message || 'Could not load your account.');
    }

    const user = await userResponse.json();
    const itemsResponse = await fetch(
        `${BASE_URL}/cart-items?filters[Users][id][$eq]=${user.id}&populate=product`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const itemsData = await itemsResponse.json();

    if (!itemsResponse.ok) {
        throw new Error(itemsData.error?.message || 'Could not load cart items.');
    }

    return { token, user, cart: { items: itemsData.data || [] } };
};

export const updateCart = async (productId: number, quantity: number, shouldRemove: boolean) => {
    const result = await getAuthenticatedCart();

    if (!result) {
        return null;
    }

    const existingItem = result.cart.items.find((item: any) => {
        const product = item.product?.data || item.product;
        return product?.id === productId;
    });

    if (shouldRemove) {
        if (!existingItem) {
            return null;
        }

        const response = await fetch(`${BASE_URL}/cart-items/${existingItem.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${result.token}` },
        });

        if (!response.ok) {
            throw new Error('Could not remove this item from your cart.');
        }

        return response.json();
    }

    const response = await fetch(
        existingItem ? `${BASE_URL}/cart-items/${existingItem.id}` : `${BASE_URL}/cart-items`,
        { method: existingItem ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.token}`,
        },
        body: JSON.stringify({
            data: {
                Users: result.user.id,
                product: productId,
                quantity,
            },
        }),
        }
    );
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Could not update cart.');
    }

    return data;
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