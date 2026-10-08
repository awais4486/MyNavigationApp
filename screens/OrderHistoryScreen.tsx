import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { History } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrderHistory } from '../services/authService';

const OrderHistoryScreen = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        setLoading(true);

        try {
            setOrders((await getOrderHistory()) || []);
        } catch (error) {
            Alert.alert('Order history error', error instanceof Error ? error.message : 'Could not load order history.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        loadOrders();
    }, [loadOrders]));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>ORDER HISTORY</Text>
                <History size={30} color="#2196F3" />
            </View>
            {loading ? (
                <ActivityIndicator style={styles.centered} size="large" color="#2196F3" />
            ) : (
                <FlatList
                    contentContainerStyle={orders.length === 0 ? styles.emptyState : styles.list}
                    data={orders}
                    keyExtractor={(order) => String(order.documentId || order.id)}
                    ListEmptyComponent={(
                        <>
                            <History size={56} color="#9aa8ae" />
                            <Text style={styles.emptyTitle}>No orders yet</Text>
                            <Text style={styles.emptyText}>
                                Your completed orders will appear here.
                            </Text>
                        </>
                    )}
                    renderItem={({ item: order }) => {
                        const orderItems = order.order_items?.data || order.order_items || [];

                        return (
                            <View style={styles.order}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderNumber}>{order.orderNumber || 'Order'}</Text>
                                    <Text style={styles.status}>{order.orderStatus}</Text>
                                </View>
                                <Text style={styles.date}>{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</Text>
                                {orderItems.map((orderItem: any) => {
                                    const product = orderItem.product?.data || orderItem.product;
                                    return (
                                        <Text key={String(orderItem.documentId || orderItem.id)} style={styles.item}>
                                            {product?.title || 'Product'} x {orderItem.quantity}
                                        </Text>
                                    );
                                })}
                                <Text style={styles.total}>Total: ${Number(order.totalAmount || 0).toFixed(2)}</Text>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F4F7F8',
        flex: 1,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 18,
    },
    heading: {
        color: '#172126',
        fontSize: 26,
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#172126',
        fontSize: 21,
        fontWeight: '700',
        marginTop: 16,
    },
    emptyText: {
        color: '#68757A',
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    centered: {
        flex: 1,
    },
    list: {
        padding: 16,
    },
    order: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        padding: 16,
    },
    orderHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    orderNumber: {
        color: '#172126',
        fontSize: 17,
        fontWeight: '700',
    },
    status: {
        color: '#2196F3',
        fontWeight: '700',
    },
    date: {
        color: '#68757A',
        marginTop: 6,
    },
    item: {
        color: '#172126',
        marginTop: 12,
    },
    total: {
        color: '#172126',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 14,
        textAlign: 'right',
    },
});

export default OrderHistoryScreen;
