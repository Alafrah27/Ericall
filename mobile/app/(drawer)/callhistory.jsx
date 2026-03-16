import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/store';
import DrawerToggleButton from '@/components/DrawerToggleButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CallHistory() {
    const { GetCallHistory } = useStore();
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        setLoading(true);
        const res = await GetCallHistory();
        if (res.success) {
            setCalls(res.calls);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        const res = await GetCallHistory();
        if (res.success) setCalls(res.calls);
        setRefreshing(false);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const renderItem = ({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: item.status === 'completed' ? '#ecfdf5' : '#fef2f2' }]}>
                <Ionicons 
                    name={item.status === 'completed' ? "call-outline" : "close-circle-outline"} 
                    size={24} 
                    color={item.status === 'completed' ? "#10b981" : "#ef4444"} 
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.phone}>{item.phoneNumber}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
                </View>
            </View>
            <View style={styles.rightContainer}>
                <Text style={styles.cost}>-${item.TotalCost.toFixed(3)}</Text>
                <Text style={[styles.statusText, { color: item.status === 'completed' ? '#10b981' : '#ef4444' }]}>
                    {item.status}
                </Text>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />
                <Text style={styles.headerTitle}>Call History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading && !refreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#b88144" />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : calls.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="call-outline" size={60} color="#cbd5e1" />
                    <Text style={styles.emptyText}>No recent calls</Text>
                </View>
            ) : (
                <FlatList
                    data={calls}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b88144" />
                    }
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
        backgroundColor: '#ffffff',
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    details: { flex: 1 },
    phone: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    date: { fontSize: 13, color: '#6b7280' },
    dot: { marginHorizontal: 6, color: '#9ca3af' },
    duration: { fontSize: 13, color: '#6b7280' },
    rightContainer: { alignItems: 'flex-end' },
    cost: { fontSize: 15, fontWeight: '700', color: '#374151' },
    statusText: { fontSize: 12, fontWeight: '600', marginTop: 4, textTransform: 'capitalize' },
    emptyText: { marginTop: 12, fontSize: 16, color: '#94a3b8' },
    errorText: { color: '#ef4444', fontSize: 16 },
});
