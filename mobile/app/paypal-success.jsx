import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/store';

const { width } = Dimensions.get('window');

export default function PaypalSuccess() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { CapturePaypalPayment } = useStore();

    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
    const [message, setMessage] = useState('Verifying your payment...');
    const [newBalance, setNewBalance] = useState(null);

    useEffect(() => {
        const capture = async () => {
            const token = params.token;
            if (!token) {
                setStatus('error');
                setMessage('No payment token found. Please try again.');
                return;
            }

            try {
                const res = await CapturePaypalPayment(token);
                if (res.success) {
                    setStatus('success');
                    setMessage('Payment verified successfully!');
                    setNewBalance(res.newBalance);
                } else {
                    setStatus('error');
                    setMessage(res.message || 'Failed to capture payment.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An unexpected error occurred.');
            }
        };

        capture();
    }, [params.token]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {status === 'processing' && (
                    <Animated.View entering={FadeIn.duration(500)} style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#10B981" style={{ marginBottom: 20, transform: [{ scale: 1.5 }] }} />
                        <Text style={styles.title}>Processing Payment</Text>
                        <Text style={styles.subtitle}>{message}</Text>
                    </Animated.View>
                )}

                {status === 'success' && (
                    <Animated.View entering={ZoomIn.duration(600).springify().damping(12)} style={styles.centerBox}>
                        <View style={styles.iconCircleSuccess}>
                            <Ionicons name="checkmark-sharp" size={60} color="#ffffff" />
                        </View>
                        <Text style={styles.titleSuccess}>Payment Successful!</Text>
                        <Text style={styles.subtitle}>{message}</Text>

                        {newBalance !== null && (
                            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.balanceCard}>
                                <Text style={styles.balanceLabel}>New Wallet Balance</Text>
                                <Text style={styles.balanceAmount}>${newBalance.toFixed(2)}</Text>
                            </Animated.View>
                        )}
                    </Animated.View>
                )}

                {status === 'error' && (
                    <Animated.View entering={ZoomIn.duration(600).springify().damping(12)} style={styles.centerBox}>
                        <View style={styles.iconCircleError}>
                            <Ionicons name="close-sharp" size={60} color="#ffffff" />
                        </View>
                        <Text style={styles.titleError}>Payment Failed</Text>
                        <Text style={styles.subtitleError}>{message}</Text>
                    </Animated.View>
                )}
            </View>

            <Animated.View style={styles.footer} entering={FadeInDown.delay(600).duration(500)}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        status === 'error' ? styles.buttonError : styles.buttonSuccess,
                        status === 'processing' && styles.buttonDisabled
                    ]}
                    activeOpacity={0.8}
                    onPress={() => router.replace('/(drawer)/addcredit')}
                    disabled={status === 'processing'}
                >
                    <Text style={styles.buttonText}>
                        {status === 'error' ? 'Try Again' : 'Back to Wallet'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    centerBox: {
        alignItems: 'center',
        width: '100%',
    },
    iconCircleSuccess: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#10B981', // Emerald 500
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconCircleError: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EF4444', // Red 500
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    titleSuccess: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#10B981',
        marginBottom: 8,
    },
    titleError: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    subtitleError: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    balanceCard: {
        marginTop: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 32,
        alignItems: 'center',
        width: width * 0.8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    balanceLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonSuccess: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
    },
    buttonError: {
        backgroundColor: '#EF4444',
        shadowColor: '#EF4444',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
