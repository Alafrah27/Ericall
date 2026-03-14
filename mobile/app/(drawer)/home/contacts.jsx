import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, RefreshControl } from 'react-native'
import React, { useState, useMemo, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import DrawerToggleButton from '@/components/DrawerToggleButton'
import { UseContact } from '@/context/contactContext'
import ContactItem from '@/components/ContactItem'
import { Ionicons } from '@expo/vector-icons'

const Contacts = () => {
    const { contacts, permissionGranted, loading, refreshContacts } = UseContact();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Sort + filter contacts
    const filteredContacts = useMemo(() => {
        const sorted = [...(contacts || [])].sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
        });
        if (!searchQuery.trim()) return sorted;
        const q = searchQuery.toLowerCase();
        return sorted.filter(c => {
            const name = (c.name || '').toLowerCase();
            const phone = c.phoneNumbers?.[0]?.number || '';
            return name.includes(q) || phone.includes(q);
        });
    }, [contacts, searchQuery]);

    // Group contacts by first letter for section headers
    const groupedData = useMemo(() => {
        const result = [];
        let lastLetter = '';
        filteredContacts.forEach(contact => {
            const letter = (contact.name || '#').charAt(0).toUpperCase();
            if (letter !== lastLetter) {
                result.push({ type: 'header', letter, id: `header-${letter}` });
                lastLetter = letter;
            }
            result.push({ type: 'contact', ...contact });
        });
        return result;
    }, [filteredContacts]);

    const renderItem = useCallback(({ item }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{item.letter}</Text>
                </View>
            );
        }
        return (
            <ContactItem
                contact={item}
                onPress={() => console.log('Contact selected:', item.name)}
            />
        );
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshContacts();
        setRefreshing(false);
    }, [refreshContacts]);

    // --- Permission denied state ---
    if (!permissionGranted && !loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <DrawerToggleButton />
                    <Text style={styles.headerTitle}>Contacts</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="lock-closed-outline" size={60} color="#d4d4d4" />
                    <Text style={styles.emptyTitle}>Permission Required</Text>
                    <Text style={styles.emptyText}>Allow access to contacts to view them here.</Text>
                </View>
            </SafeAreaView>
        )
    }

    // --- Loading state ---
    if (loading || !contacts || contacts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <DrawerToggleButton />
                    <Text style={styles.headerTitle}>Contacts</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#b88144" />
                    <Text style={[styles.emptyText, { marginTop: 14 }]}>Loading contacts...</Text>
                </View>
            </SafeAreaView>
        )
    }

    // --- Main contacts list ---
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />
                <Text style={styles.headerTitle}>Contacts</Text>
                <Text style={styles.contactCount}>{contacts.length}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color="#aaa" style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or number"
                        placeholderTextColor="#bbb"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color="#ccc"
                            onPress={() => setSearchQuery('')}
                        />
                    )}
                </View>
            </View>

            <FlatList
                data={groupedData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                initialNumToRender={20}
                maxToRenderPerBatch={25}
                windowSize={5}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#b88144']}
                        tintColor="#b88144"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.centerContainer}>
                        <Ionicons name="search-outline" size={50} color="#d4d4d4" />
                        <Text style={styles.emptyTitle}>No results</Text>
                        <Text style={styles.emptyText}>Try a different search term.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 8,
        backgroundColor: '#f8f8fa',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        marginLeft: 12,
        color: '#1a1a1a',
        flex: 1,
    },
    contactCount: {
        fontSize: 14,
        color: '#b88144',
        fontWeight: '700',
        backgroundColor: '#fdf5eb',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: '#f8f8fa',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        paddingVertical: 0,
    },
    sectionHeader: {
        paddingHorizontal: 32,
        paddingTop: 18,
        paddingBottom: 6,
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#b88144',
        letterSpacing: 1,
    },
    listContainer: {
        paddingBottom: 30,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
        marginTop: 16,
        marginBottom: 6,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    }
});

export default Contacts;