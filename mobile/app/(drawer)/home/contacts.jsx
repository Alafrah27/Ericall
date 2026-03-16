import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useMemo, useCallback, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import DrawerToggleButton from '@/components/DrawerToggleButton'
import { UseContact } from '@/context/contactContext'
import ContactItem from '@/components/ContactItem'
import { Ionicons } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { getColorFromId } from '@/components/getColorFormId';
import { useRouter } from 'expo-router';

const Contacts = () => {
    const router = useRouter();
    const { contacts, permissionGranted, loading, refreshContacts } = UseContact();
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    
    // Bottom Sheet Ref & State
    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => ['40%'], []);
    const [selectedContact, setSelectedContact] = useState(null);

    const handlePresentModalPress = useCallback((contact) => {
        console.log('Opening Bottom Sheet for:', contact.name);
        setSelectedContact(contact);
        bottomSheetModalRef.current?.present();
    }, []);

    const renderBackdrop = useCallback(
        props => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close"
            />
        ),
        []
    );

    const handleCallPress = () => {
        if (selectedContact) {
            bottomSheetModalRef.current?.dismiss();
            
            const name = selectedContact.name || 'Unknown';
            const phone = selectedContact.phoneNumbers?.[0]?.number || 'No phone number';
            
            router.push({
                pathname: `/calls/${selectedContact.id}`,
                params: { name, phone }
            });
        }
    };

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
                onPress={() => handlePresentModalPress(item)}
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

            {/* Jetpack-Compose Style Bottom Sheet */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.bottomSheetIndicator}
            >
                <BottomSheetView style={styles.sheetContentContainer}>
                    {selectedContact && (
                        <>
                            {/* Header / Avatar */}
                            <View style={[styles.sheetAvatar, { backgroundColor: getColorFromId(selectedContact.id) }]}>
                                <Text style={styles.sheetAvatarText}>
                                    {(selectedContact.name || '#').charAt(0).toUpperCase()}
                                </Text>
                            </View>

                            <Text style={styles.sheetContactName}>{selectedContact.name || 'Unknown'}</Text>
                            
                            <View style={styles.sheetPhoneContainer}>
                                <Ionicons name="call" size={16} color="#888" style={{ marginRight: 6 }} />
                                <Text style={styles.sheetContactPhone}>
                                    {selectedContact.phoneNumbers?.[0]?.number || 'No phone number'}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.sheetActionsContainer}>
                                <TouchableOpacity 
                                    style={styles.actionButtonPrimary}
                                    onPress={handleCallPress}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="call" size={20} color="#fff" />
                                    <Text style={styles.actionButtonTextPrimary}>Call Contact</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.actionButtonSecondary}
                                    onPress={() => bottomSheetModalRef.current?.dismiss()}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.actionButtonTextSecondary}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheetModal>
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
    },
    // Bottom Sheet Custom Styles
    bottomSheetBackground: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
    },
    bottomSheetIndicator: {
        backgroundColor: '#e5e7eb',
        width: 40,
        height: 4,
    },
    sheetContentContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    sheetAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sheetAvatarText: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: '700',
    },
    sheetContactName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    sheetPhoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 24,
    },
    sheetContactPhone: {
        fontSize: 16,
        color: '#4b5563',
        fontWeight: '500',
    },
    sheetActionsContainer: {
        width: '100%',
        gap: 12,
    },
    actionButtonPrimary: {
        flexDirection: 'row',
        backgroundColor: '#b88144',
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#b88144',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    actionButtonTextPrimary: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 8,
    },
    actionButtonSecondary: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 16,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonTextSecondary: {
        color: '#4b5563',
        fontSize: 16,
        fontWeight: '600',
    }
});

export default Contacts;