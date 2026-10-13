import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import { createOrder, createOrderItem, decreaseProductStock, getAuthenticatedCart, removeCartItem, updateCart } from '../services/cartService';
import { removeCartItemFromStore, setCart } from '../../components/redux/action';
import { showNotification } from '../services/notifications';

const CartScreen = () => {
    const dispatch = useDispatch();
    const products = useSelector((state: any): any[] => state.cart.items);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

    const getCartItemKey = (cartItem: any) => String(cartItem.documentId || cartItem.id);

    const loadCart = useCallback(async (isRefresh = false) => {
        isRefresh ? setRefreshing(true) : setLoading(true);

        try {
            const result = await getAuthenticatedCart();
            const nextItems = result?.cart.items || [];
            dispatch(setCart(nextItems));
            setSelectedItemIds((currentIds) => currentIds.filter((id) => (
                nextItems.some((item: any) => getCartItemKey(item) === id)
            )));
        } catch (error) {
            console.log('LOAD CART ERROR:', error);
        } finally {
            isRefresh ? setRefreshing(false) : setLoading(false);
        }
    }, [dispatch]);

    useFocusEffect(useCallback(() => {
        loadCart();
    }, [loadCart]));

    const removeFromCart = async (cartItem: any) => {
        try {
            await removeCartItem(cartItem);
            setSelectedItemIds((currentIds) => currentIds.filter((id) => id !== getCartItemKey(cartItem)));
            dispatch(removeCartItemFromStore(cartItem.id));
        } catch (error: any) {
            console.log('REMOVE CART ITEM ERROR:', error);
        }
    };

    const changeQuantity = async (cartItem: any, nextQuantity: number) => {
        const product = cartItem.product?.data || cartItem.product;

        try {
            if (nextQuantity < 1) {
                await removeFromCart(cartItem);
                return;
            }

            await updateCart(product.id, nextQuantity, false, product.documentId);
            const result = await getAuthenticatedCart();
            dispatch(setCart(result?.cart.items || []));
        } catch (error: any) {
            Alert.alert('Cart error', error.message || 'Could not update this item.');
        }
    };

    const placeOrder = async () => {
        const selectedProducts = products.filter((cartItem) => selectedItemIds.includes(getCartItemKey(cartItem)));

        if (placingOrder || selectedProducts.length === 0) {
            if (products.length > 0 && selectedProducts.length === 0) {
                Alert.alert('Select items', 'Select at least one item before placing your order.');
            }
            return;
        }

        setPlacingOrder(true);

        try {
            const cartResult = await getAuthenticatedCart();
            if (!cartResult) {
                throw new Error('Please log in before placing an order.');
            }

            const totalAmount = selectedProducts.reduce((total, cartItem) => {
                const product = cartItem.product?.data || cartItem.product;
                return total + Number(product?.price || 0) * Number(cartItem.quantity || 0);
            }, 0);
            const order = await createOrder({ totalAmount });

            if (!order) {
                throw new Error('Could not create order.');
            }

            await Promise.all(selectedProducts.map((cartItem) => {
                const product = cartItem.product?.data || cartItem.product;
                const unitPrice = Number(product?.price || 0);

                return createOrderItem({
                    order,
                    product,
                    quantity: Number(cartItem.quantity),
                    unitPrice,
                });
            }));
            await Promise.all(selectedProducts.map((cartItem) => {
                const product = cartItem.product?.data || cartItem.product;
                return decreaseProductStock(product, cartItem.quantity);
            }));
            await Promise.all(selectedProducts.map(removeCartItem));
            const selectedKeys = new Set(selectedProducts.map(getCartItemKey));
            const remainingProducts = products.filter((cartItem) => !selectedKeys.has(getCartItemKey(cartItem)));
            dispatch(setCart(remainingProducts));
            setSelectedItemIds([]);
            showNotification('Order placed', 'Your selected items were ordered successfully.');
        } catch (error: any) {
            Alert.alert('Order error', error.message || 'Could not clear your cart.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={styles.centered} size="large" color="#2196F3" />;
    }

    return (
        <View style={styles.container}>
            <View
                style={{
                    marginTop: '10%',
                }}
            >
                <Text style={styles.heading}>My Cart</Text>
            </View>
            <View style={styles.listContainer}>
                {products.length > 0 && (
                    <View style={styles.selectionControls}>
                        <Text style={styles.selectedCount}>
                            {selectedItemIds.length} of {products.length} selected
                        </Text>
                        <View style={styles.selectionButtons}>
                            <TouchableOpacity
                                onPress={() => setSelectedItemIds(products.map(getCartItemKey))}
                                accessibilityRole="button"
                                accessibilityLabel="Select all cart items"
                            >
                                <Text style={styles.selectionButtonText}>Select all</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setSelectedItemIds([])}
                                accessibilityRole="button"
                                accessibilityLabel="Deselect all cart items"
                            >
                                <Text style={styles.selectionButtonText}>Deselect all</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {/* <ScrollView> */}
                    <FlatList
                        data={products}
                        keyExtractor={item => String(item.id)}
                        refreshing={refreshing}
                        onRefresh={() => loadCart(true)}
                        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <Pressable
                                    accessibilityRole="checkbox"
                                    accessibilityLabel={`Select ${(item.product?.data || item.product)?.title || 'cart item'}`}
                                    accessibilityState={{ checked: selectedItemIds.includes(getCartItemKey(item)) }}
                                    onPress={() => setSelectedItemIds((currentIds) => {
                                        const itemKey = getCartItemKey(item);
                                        return currentIds.includes(itemKey)
                                            ? currentIds.filter((id) => id !== itemKey)
                                            : [...currentIds, itemKey];
                                    })}
                                    style={[
                                        styles.checkbox,
                                        selectedItemIds.includes(getCartItemKey(item)) && styles.checkboxSelected,
                                    ]}
                                >
                                    {selectedItemIds.includes(getCartItemKey(item)) && <Text style={styles.checkboxText}>✓</Text>}
                                </Pressable>
                                <Image source={{ uri: (item.product?.data || item.product)?.thumbnail }} style={styles.image} />
                                <View style={styles.details}>
                                    <Text style={styles.title} numberOfLines={2}>{(item.product?.data || item.product)?.title}</Text>
                                    <Text style={styles.price}>${(item.product?.data || item.product)?.price} x {item.quantity}</Text>
                                    <View style={styles.quantityControls}>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => void changeQuantity(item, item.quantity - 1)}
                                            accessibilityLabel="Decrease cart quantity"
                                        >
                                            <Text style={styles.quantityButtonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantity}>{item.quantity}</Text>
                                        <TouchableOpacity
                                            style={styles.quantityButton}
                                            onPress={() => void changeQuantity(item, item.quantity + 1)}
                                            accessibilityLabel="Increase cart quantity"
                                        >
                                            <Text style={styles.quantityButtonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => removeFromCart(item)} accessibilityLabel={`Remove ${(item.product?.data || item.product)?.title || 'cart item'}`}>
                                    <Trash2 size={22} color="#C62828" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    <View style={styles.summary}>
                        <Text style={styles.summaryText}>Selected items: {products.filter((item) => selectedItemIds.includes(getCartItemKey(item))).reduce((total, item) => total + Number(item.quantity || 0), 0)}</Text>
                        <Text style={styles.summaryTotal}>Total: ${products.filter((item) => selectedItemIds.includes(getCartItemKey(item))).reduce((total, item) => {
                            const product = item.product?.data || item.product;
                            return total + Number(product?.price || 0) * Number(item.quantity || 0);
                        }, 0).toFixed(2)}</Text>
                    </View>
                {/* </ScrollView> */}
                {products.length > 0 && (
                    <TouchableOpacity
                        style={[styles.placeOrderButton, placingOrder && styles.disabledButton]}
                        onPress={placeOrder}
                        disabled={placingOrder}
                        accessibilityLabel="Place order"
                    >
                        {placingOrder ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.placeOrderText}>Place Order</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: { 
        flex: 1 
    },
    container: { 
        flex: 1, 
        backgroundColor: '#F4F7F8', 
        padding: 16 
    },
    listContainer: { 
        flex: 1 
    },
    selectionControls: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    selectedCount: {
        color: '#555',
        fontSize: 15,
    },
    selectionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    selectionButtonText: {
        color: '#2196F3',
        fontSize: 15,
        fontWeight: '600',
    },
    heading: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        marginBottom: 16 
    },
    empty: 
    { 
        color: '#666', 
        fontSize: 17, 
        marginTop: 24, 
        textAlign: 'center' 
    },
    item: 
    { 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        flexDirection: 'row', marginBottom: 12, padding: 12 },
    checkbox: {
        alignItems: 'center',
        borderColor: '#9AA8AE',
        borderRadius: 4,
        borderWidth: 1,
        height: 22,
        justifyContent: 'center',
        marginRight: 10,
        width: 22,
    },
    checkboxSelected: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    checkboxText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    image: 
    { 
        backgroundColor: '#F4F7F8', 
        height: 78, 
        width: 78 
    },
    details: 
    { 
        flex: 1, 
        marginHorizontal: 12 

    },
    title: 
    { 
        fontSize: 17, 
        fontWeight: '600' 

    },
    price: 
    { 
        color: '#2196F3', 
        fontSize: 18, fontWeight: 'bold', 
        marginTop: 8 
    },
    quantityControls: 
    { 
        alignItems: 'center', 
        flexDirection: 'row', 
        marginTop: 8 
    },
    quantityButton: 
    { 
        alignItems: 'center', 
        borderColor: '#ccd4d7', 
        borderRadius: 6, 
        borderWidth: 1, 
        height: 28, 
        justifyContent: 'center', 
        width: 28 
    },
    quantityButtonText: 
    { 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    quantity: 
    { 
        fontSize: 16, 
        fontWeight: '600', 
        minWidth: 32, 
        textAlign: 'center' 
    },
    summary: 
    { 
        borderTopColor: '#d9e0e3', 
        borderTopWidth: 1, 
        paddingTop: 14 
    },
    summaryText: 
    { 
        color: '#555', 
        fontSize: 17 

    },
    summaryTotal: 
    { 
        fontSize: 22, 
        fontWeight: 'bold', 
        marginTop: 4 
    },
    placeOrderButton: 
    { 
        alignItems: 'center', 
        backgroundColor: '#2196F3', 
        borderRadius: 8, 
        marginTop: 8, 
        paddingVertical: 14 
    },
    disabledButton: 
    { 
        opacity: 0.6 

    },
    placeOrderText: 
    { 
        color: '#fff', 
        fontSize: 17, 
        fontWeight: 'bold' },
});

export default CartScreen;
