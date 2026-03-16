import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/store';
import DrawerToggleButton from '@/components/DrawerToggleButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function Transations() {
    const { GetTransations } = useStore();
    const [transations, setTransations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTransations();
    }, []);

    const fetchTransations = async () => {
        setLoading(true);
        const res = await GetTransations();
        if (res.success) {
            setTransations(res.transations);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).duration(400)} style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name="card-outline" size={24} color="#b88144" />
            </View>
            <View style={styles.details}>
                <Text style={styles.title}>{item.reference || 'Transaction'}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: item.type === 'credit' ? '#10B981' : '#EF4444' }]}>
                    {item.type === 'credit' ? '+' : '-'}${item.amount.toFixed(2)}
                </Text>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />
                <Text style={styles.headerTitle}>Transactions</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#b88144" />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : transations.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="receipt-outline" size={60} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No transactions found</Text>
                </View>
            ) : (
                <FlatList
                    data={transations}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fffbeb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    details: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' },
    date: { fontSize: 13, color: '#6b7280', marginTop: 4 },
    amountContainer: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: 'bold' },
    emptyText: { marginTop: 12, fontSize: 16, color: '#94a3b8' },
    errorText: { color: '#ef4444', fontSize: 16 },
});
