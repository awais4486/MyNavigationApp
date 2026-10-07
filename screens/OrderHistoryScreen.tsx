import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { History } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderHistoryScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>ORDER HISTORY</Text>
                <History size={30} color="#2196F3" />
            </View>
            <View style={styles.emptyState}>
                <History size={56} color="#9aa8ae" />
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptyText}>
                    Your completed orders will appear here.
                </Text>
            </View>
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
});

export default OrderHistoryScreen;
