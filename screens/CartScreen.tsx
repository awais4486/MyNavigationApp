import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';

import { getAuthenticatedCart, updateCart } from '../services/authService';

const CartScreen = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadCart = useCallback(async (isRefresh = false) => {
        isRefresh ? setRefreshing(true) : setLoading(true);

        try {
            const result = await getAuthenticatedCart();
            setProducts(result?.cart.items || []);
        } catch (error) {
            console.log('LOAD CART ERROR:', error);
        } finally {
            isRefresh ? setRefreshing(false) : setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        loadCart();
    }, [loadCart]));

    const removeFromCart = async (productId: number) => {
        try {
            await updateCart(productId, 0, true);
            setProducts(current => current.filter(item => {
                const product = item.product?.data || item.product;
                return product?.id !== productId;
            }));
        } catch (error: any) {
            console.log('REMOVE CART ITEM ERROR:', error);
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
                {/* <ScrollView> */}
                    <FlatList
                        data={products}
                        keyExtractor={item => String(item.id)}
                        refreshing={refreshing}
                        onRefresh={() => loadCart(true)}
                        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.item}>
                                <Image source={{ uri: (item.product?.data || item.product)?.thumbnail }} style={styles.image} />
                                <View style={styles.details}>
                                    <Text style={styles.title} numberOfLines={2}>{(item.product?.data || item.product)?.title}</Text>
                                    <Text style={styles.price}>${(item.product?.data || item.product)?.price} x {item.quantity}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeFromCart((item.product?.data || item.product)?.id)} accessibilityLabel={`Remove ${(item.product?.data || item.product)?.title}`}>
                                    <Trash2 size={22} color="#C62828" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                {/* </ScrollView> */}
                <TouchableOpacity style={styles.placeOrderButton} accessibilityLabel="Place order">
                    <Text style={styles.placeOrderText}>Place Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1 },
    container: { flex: 1, backgroundColor: '#F4F7F8', padding: 16 },
    listContainer: { flex: 1 },
    heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
    empty: { color: '#666', fontSize: 17, marginTop: 24, textAlign: 'center' },
    item: { alignItems: 'center', backgroundColor: '#fff', flexDirection: 'row', marginBottom: 12, padding: 12 },
    image: { backgroundColor: '#F4F7F8', height: 78, width: 78 },
    details: { flex: 1, marginHorizontal: 12 },
    title: { fontSize: 17, fontWeight: '600' },
    price: { color: '#2196F3', fontSize: 18, fontWeight: 'bold', marginTop: 8 },
    placeOrderButton: { alignItems: 'center', backgroundColor: '#2196F3', borderRadius: 8, marginTop: 8, paddingVertical: 14 },
    placeOrderText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});

export default CartScreen;
