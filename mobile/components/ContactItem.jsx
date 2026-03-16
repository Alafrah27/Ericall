import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColorFromId } from './getColorFormId';

export default function ContactItem({ contact, onPress }) {
    const name = contact.name || 'Unknown';
    const firstChar = name.charAt(0).toUpperCase();

    const phoneNumber = contact.phoneNumbers && contact.phoneNumbers.length > 0
        ? contact.phoneNumbers[0].number
        : 'No phone number';
    const phoneLabel = contact.phoneNumbers && contact.phoneNumbers.length > 0 && contact.phoneNumbers[0].label
        ? contact.phoneNumbers[0].label
        : '';

    const avatarColor = getColorFromId(contact.id);

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
            {/* Avatar with gradient-like look */}
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{firstChar}</Text>
            </View>

            {/* Contact info */}
            <View style={styles.infoContainer}>
                <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
                <View style={styles.phoneRow}>
                    {phoneLabel ? (
                        <View style={styles.labelBadge}>
                            <Text style={styles.labelBadgeText}>{phoneLabel}</Text>
                        </View>
                    ) : null}
                    <Text style={styles.phoneText} numberOfLines={1}>{phoneNumber}</Text>
                </View>
            </View>

            {/* Call icon */}
            {/* <TouchableOpacity style={styles.callIcon} onPress={onPress} activeOpacity={0.5}>
                <Ionicons name="call-outline" size={20} color="#b88144" />
            </TouchableOpacity> */}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginHorizontal: 14,
        marginVertical: 4,
        backgroundColor: '#fff',
        borderRadius: 16,
        // Soft shadow
        // shadowColor: '#000',
        // shadowOpacity: 0.04,
        // shadowRadius: 8,
        // shadowOffset: { width: 0, height: 2 },
        // elevation: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    labelBadge: {
        backgroundColor: '#f0e6d6',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 8,
    },
    labelBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#b88144',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    phoneText: {
        fontSize: 13.5,
        color: '#888',
        fontWeight: '400',
    },
    callIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fdf5eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
