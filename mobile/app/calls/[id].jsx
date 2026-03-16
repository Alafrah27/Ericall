import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams as useExpoParams, useRouter as useExpoRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CallScreen = () => {
    const { id, name, phone } = useExpoParams();
    const router = useExpoRouter();
    const [isMuted, setIsMuted] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Calling Contact</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.body}>
                <Ionicons name="person-circle-outline" size={140} color="#b88144" style={styles.avatarPlaceholder} />
                
                <Text style={styles.contactName}>{name || 'Unknown Caller'}</Text>
                <Text style={styles.contactPhone}>{phone || 'Unknown Number'}</Text>
                <Text style={styles.callStatus}>Ringing...</Text>

                <View style={styles.actionsRow}>
                    <TouchableOpacity 
                        style={[styles.actionButton, isMuted && styles.actionButtonActive]} 
                        onPress={() => setIsMuted(!isMuted)}
                    >
                        <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? "#fff" : "#4b5563"} />
                        <Text style={[styles.actionText, isMuted && styles.actionTextActive]}>
                            {isMuted ? 'Muted' : 'Mute'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.endCallButton} onPress={() => router.back()}>
                        <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    body: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    avatarPlaceholder: {
        marginBottom: 20,
    },
    contactName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    contactPhone: {
        fontSize: 18,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 12,
    },
    callStatus: {
        fontSize: 16,
        color: '#b88144',
        fontWeight: '600',
        marginBottom: 60,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        marginTop: 'auto',
        marginBottom: 80,
    },
    actionButton: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonActive: {
        backgroundColor: '#6b7280',
    },
    actionText: {
        fontSize: 12,
        color: '#4b5563',
        marginTop: 4,
        fontWeight: '600',
        position: 'absolute',
        bottom: -24,
    },
    actionTextActive: {
        color: '#6b7280',
    },
    endCallButton: {
        backgroundColor: '#ef4444',
        width: 75,
        height: 75,
        borderRadius: 37.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    }
});

export default CallScreen;
