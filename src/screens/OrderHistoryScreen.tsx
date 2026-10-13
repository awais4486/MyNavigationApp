import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { History } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrderHistory } from '../services/authService';

const renderHighlightedOrderNumber = (orderNumber: string, searchText: string) => {
    const query = searchText.trim();

    if (!query) {
        return orderNumber;
    }

    const parts = [];
    const lowerOrderNumber = orderNumber.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let currentIndex = 0;
    let matchIndex = lowerOrderNumber.indexOf(lowerQuery, currentIndex);

    while (matchIndex !== -1) {
        if (matchIndex > currentIndex) {
            parts.push(orderNumber.slice(currentIndex, matchIndex));
        }

        parts.push(
            <Text key={`match-${matchIndex}`} style={styles.highlightedText}>
                {orderNumber.slice(matchIndex, matchIndex + query.length)}
            </Text>
        );

        currentIndex = matchIndex + query.length;
        matchIndex = lowerOrderNumber.indexOf(lowerQuery, currentIndex);
    }

    if (currentIndex < orderNumber.length) {
        parts.push(orderNumber.slice(currentIndex));
    }

    return parts;
};

const OrderHistoryScreen = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

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

    const filteredOrders = orders.filter((order) => (
        String(order.orderNumber || '').toLowerCase().includes(searchText.trim().toLowerCase())
    ));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>ORDER HISTORY</Text>
                <History size={30} color="#2196F3" />
            </View>
            <TextInput
                accessibilityLabel="Search orders by order number"
                autoCapitalize="none"
                onChangeText={setSearchText}
                placeholder="Search by order number"
                placeholderTextColor="#7A878C"
                style={styles.searchInput}
                value={searchText}
            />
            {loading ? (
                <ActivityIndicator style={styles.centered} size="large" color="#2196F3" />
            ) : (
                <FlatList
                    contentContainerStyle={filteredOrders.length === 0 ? styles.emptyState : styles.list}
                    data={filteredOrders}
                    keyExtractor={(order) => String(order.documentId || order.id)}
                    ListEmptyComponent={(
                        <>
                            <History size={56} color="#9aa8ae" />
                            <Text style={styles.emptyTitle}>{orders.length === 0 ? 'No orders yet' : 'No matching orders'}</Text>
                            <Text style={styles.emptyText}>
                                {orders.length === 0 ? 'Your completed orders will appear here.' : 'Try another order number.'}
                            </Text>
                        </>
                    )}
                    renderItem={({ item: order }) => {
                        const orderItems = order.order_items?.data || order.order_items || [];

                        return (
                            <View style={styles.order}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderNumber}>
                                        Order #: {renderHighlightedOrderNumber(String(order.orderNumber || 'Unavailable'), searchText)}
                                    </Text>
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
    searchInput: {
        backgroundColor: '#fff',
        borderColor: '#D5DEE1',
        borderRadius: 8,
        borderWidth: 1,
        color: '#172126',
        fontSize: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
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
    highlightedText: {
        backgroundColor: '#FFE082',
        color: '#172126',
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
