import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams as useExpoParams, useRouter as useExpoRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TwilioVoiceService from '../../utils/TwilioVoiceService';

const CallScreen = () => {
    const { id, name, phone } = useExpoParams();
    const router = useExpoRouter();
    
    const [callStatus, setCallStatus] = useState('Initiating Secure Call...');
    const [isFailed, setIsFailed] = useState(false);
    const [timer, setTimer] = useState(0);
    const callInitiated = useRef(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const startCall = async () => {
            if (!phone || callInitiated.current) return;
            callInitiated.current = true;
            
            try {
                await TwilioVoiceService.makeCall(phone, (status) => {
                    setCallStatus(status);
                    if (status === 'Connected') {
                        startTimer();
                    } else if (status === 'Disconnected') {
                        stopTimer();
                        setTimeout(() => router.back(), 2000);
                    }
                });
                setCallStatus("Ringing...");
            } catch (error) {
                setCallStatus("Call Failed");
                setIsFailed(true);
                Alert.alert("Call Failed", error.message || "Something went wrong.");
            }
        };

        startCall();

        return () => {
            TwilioVoiceService.hangup();
            stopTimer();
        };
    }, [phone]);

    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleHangup = () => {
        TwilioVoiceService.hangup();
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleHangup} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Direct Call</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.body}>
                <Ionicons name="person-circle-outline" size={140} color="#b88144" style={styles.avatarPlaceholder} />
                
                <Text style={styles.contactName}>{name || 'Recipient'}</Text>
                <Text style={styles.contactPhone}>{phone || 'Unknown Number'}</Text>
                
                {callStatus === 'Connected' && (
                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                )}

                <View style={styles.statusContainer}>
                    {(!isFailed && callStatus !== 'Disconnected') && <ActivityIndicator size="small" color="#b88144" style={{ marginRight: 8 }} />}
                    <Text style={[styles.callStatus, isFailed && styles.callStatusError]}>
                        {callStatus}
                    </Text>
                </View>
                
                {!isFailed && (
                    <Text style={styles.instructionText}>
                        Connecting to Eritrea (+291) via Twilio Voice.
                    </Text>
                )}

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.endCallButton} onPress={handleHangup}>
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
    timerText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 20,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    callStatus: {
        fontSize: 16,
        color: '#b88144',
        fontWeight: '600',
    },
    callStatusError: {
        color: '#ef4444',
    },
    instructionText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 40,
        marginBottom: 40,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        marginTop: 'auto',
        marginBottom: 80,
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
