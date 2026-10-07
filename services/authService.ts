import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.86.46:1337/api';

export const getStoredToken = async () => {
    return AsyncStorage.getItem('token');
};

export const getAuthenticatedUser = async () => {
    const token = await getStoredToken();

    if (!token) {
        return null;
    }

    const response = await fetch(`${BASE_URL}/users/me?populate[0]=favourites&populate[1]=profilePicture`, {
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

export const updateCart = async (
    productId: number,
    quantity: number,
    shouldRemove: boolean,
    productDocumentId?: string
) => {
    const result = await getAuthenticatedCart();

    if (!result) {
        return null;
    }

    const existingItem = result.cart.items.find((item: any) => {
        const product = item.product?.data || item.product;
        return product?.id === productId;
    });

    const product = existingItem?.product?.data || existingItem?.product;
    const availableStock = Number(product?.stock);

    if (!shouldRemove && Number.isFinite(availableStock) && quantity > availableStock) {
        throw new Error(`Only ${availableStock} item${availableStock === 1 ? '' : 's'} available for ${product.title || 'this product'}.`);
    }

    if (shouldRemove) {
        if (!existingItem) {
            return null;
        }

        const response = await fetch(
            `${BASE_URL}/cart-items/${existingItem.documentId || existingItem.id}`,
            {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${result.token}` },
            }
        );

        if (!response.ok) {
            throw new Error('Could not remove this item from your cart.');
        }

        return response.status === 204 ? null : response.json();
    }

    const response = await fetch(
        existingItem
            ? `${BASE_URL}/cart-items/${existingItem.documentId || existingItem.id}`
            : `${BASE_URL}/cart-items`,
        { method: existingItem ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.token}`,
        },
        body: JSON.stringify({
            data: {
                Users: result.user.id,
                product: productDocumentId
                    ? { connect: [productDocumentId] }
                    : productId,
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

export const addProductToCart = async (product: any, quantity = 1) => {
    if (typeof product?.id !== 'number') {
        throw new Error('Product numeric id is missing.');
    }

    const result = await getAuthenticatedCart();

    if (!result) {
        return null;
    }

    const existingItem = result.cart.items.find((item: any) => {
        const cartProduct = item.product?.data || item.product;
        return cartProduct?.id === product.id;
    });

    await updateCart(
        product.id,
        existingItem ? existingItem.quantity + quantity : quantity,
        false,
        product.documentId
    );

    return getAuthenticatedCart();
};

export const removeCartItem = async (cartItem: any) => {
    const result = await getAuthenticatedCart();

    if (!result) {
        return null;
    }

    const response = await fetch(
        `${BASE_URL}/cart-items/${cartItem.documentId || cartItem.id}`,
        {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${result.token}` },
        }
    );

    if (!response.ok) {
        throw new Error('Could not remove this item from your cart.');
    }

    return response.status === 204 ? null : response.json();
};

export const decreaseProductStock = async (product: any, quantity: number) => {
    const result = await getAuthenticatedCart();

    if (!result) {
        return null;
    }

    const currentStock = Number(product?.stock);
    const purchaseQuantity = Number(quantity);
    const productIdentifier = product?.documentId || product?.id;

    if (!productIdentifier || !Number.isFinite(currentStock) || !Number.isFinite(purchaseQuantity)) {
        throw new Error('Product stock information is missing.');
    }

    if (purchaseQuantity < 1 || purchaseQuantity > currentStock) {
        throw new Error(`Only ${currentStock} item${currentStock === 1 ? '' : 's'} available for ${product.title || 'this product'}.`);
    }

    const response = await fetch(`${BASE_URL}/products/${productIdentifier}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.token}`,
        },
        body: JSON.stringify({
            data: {
                stock: currentStock - purchaseQuantity,
            },
        }),
    });
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Could not update product stock.');
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

export const sendPasswordResetEmail = async (email: string) => {
    const response = await fetch(
        `${BASE_URL}/auth/forgot-password`,
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