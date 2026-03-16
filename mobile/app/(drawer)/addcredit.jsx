import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import DrawerToggleButton from '@/components/DrawerToggleButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useStore } from '../../store/store';

const { width } = Dimensions.get('window');

const AMOUNTS = [3, 5, 10];

export default function Addcredit() {
    const { user, CreatePaypalPayment, CapturePaypalPayment } = useStore();
    const [selectedAmount, setSelectedAmount] = useState(AMOUNTS[1]); // Default to $5
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayPalPress = async () => {
        setIsProcessing(true);
        Toast.show({
            type: 'info',
            text1: 'Initializing Checkout',
            text2: `Connecting securely to PayPal...`,
        });

        // 1. Ask Backend to create payment and get the approveUrl
        const res = await CreatePaypalPayment(selectedAmount);
        
        if (!res.success) {
            setIsProcessing(false);
            Toast.show({ type: 'error', text1: 'Error', text2: res.message });
            return;
        }

        // 2. Open PayPal securely in the embedded WebBrowser
        try {
            // Using standard WebBrowser to open the URL
            const result = await WebBrowser.openBrowserAsync(res.approveUrl);
            console.log("Browser Result:", result);

            // Note: Since `openBrowserAsync` doesn't strictly act like `openAuthSessionAsync` 
            // returning the exact redirect URL inherently on Android if not misconfigured, 
            // we will need the user to close the browser if the deep link doesn't snap back automatically, 
            // or the explicit Deep Link handles it if the OS supports catching it while WebBrowser is up.
        } catch (error) {
            console.error("WebBrowser Error:", error);
            Toast.show({ type: 'error', text1: 'Browser Error', text2: 'Could not open PayPal window.' });
        }
        setIsProcessing(false);
    };

    // 3. Listen for Deep Links from PayPal redirects
    React.useEffect(() => {
        const handleDeepLink = async (event) => {
            const data = Linking.parse(event.url);
            
            if (data.hostname === 'paypal-success' || data.path === 'paypal-success' || data.hostname === 'paypal-cancel' || data.path === 'paypal-cancel' || data.queryParams?.paypal === 'success' || data.queryParams?.paypal === 'cancel') {
                WebBrowser.dismissBrowser(); // Close the embedded browser safely to reveal the new paypal-success screen
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        return () => {
            subscription.remove();
        };
    }, [selectedAmount]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />
                <Text style={styles.headerTitle}>My Wallet</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(600).springify().damping(15)} style={styles.cardContainer}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardLabel}>Available Balance</Text>
                        <Text style={styles.balanceText}>${user?.balance?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="wallet" size={40} color="#ffffff" />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(100).springify().damping(15)} style={styles.selectionSection}>
                    <Text style={styles.sectionTitle}>Select Top-up Amount</Text>
                    
                    <View style={styles.amountGrid}>
                        {AMOUNTS.map((amt) => {
                            const isSelected = selectedAmount === amt;
                            return (
                                <TouchableOpacity
                                    key={amt}
                                    style={[styles.amountBox, isSelected && styles.amountBoxSelected]}
                                    onPress={() => setSelectedAmount(amt)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.amountValue, isSelected && styles.amountValueSelected]}>
                                        ${amt}
                                    </Text>
                                    <Text style={[styles.amountCurrency, isSelected && styles.amountCurrencySelected]}>
                                        USD
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>

            </ScrollView>

            <Animated.View entering={ZoomIn.duration(500).delay(300)} style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.paypalButton, isProcessing && styles.paypalButtonDisabled]} 
                    onPress={handlePayPalPress} 
                    activeOpacity={0.8}
                    disabled={isProcessing}
                >
                    <Ionicons name="logo-paypal" size={24} color="#ffffff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{isProcessing ? "Processing..." : `Pay $${selectedAmount} with PayPal`}</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    cardContainer: {
        backgroundColor: '#b88144',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#b88144',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 40,
    },
    cardLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceText: {
        color: '#ffffff',
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 16,
    },
    amountGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    amountBox: {
        flex: 1,
        height: 90,
        borderRadius: 20,
        backgroundColor: '#f9fafb',
        borderWidth: 2,
        borderColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    amountBoxSelected: {
        backgroundColor: '#fffbeb',
        borderColor: '#b88144',
    },
    amountValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#4b5563',
    },
    amountValueSelected: {
        color: '#b88144',
    },
    amountCurrency: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9ca3af',
        marginTop: 4,
    },
    amountCurrencySelected: {
        color: '#b88144',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 30,
        paddingTop: 10,
    },
    paypalButton: {
        backgroundColor: '#003087', // Official PayPal blue
        borderRadius: 16,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#003087',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    paypalButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
    },
    buttonIcon: {
        marginRight: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});