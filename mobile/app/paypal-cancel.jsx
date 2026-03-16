import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PaypalCancel() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={ZoomIn.duration(600).springify().damping(12)} style={styles.centerBox}>
                    <View style={styles.iconCircleWarning}>
                        <Ionicons name="warning-sharp" size={60} color="#ffffff" />
                    </View>
                    <Text style={styles.titleWarning}>Payment Cancelled</Text>
                    <Text style={styles.subtitle}>
                        You have cancelled the PayPal checkout. No charges were made to your account.
                    </Text>
                </Animated.View>
            </View>

            <Animated.View style={styles.footer} entering={FadeInDown.delay(300).duration(500)}>
                <TouchableOpacity 
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => router.replace('/(drawer)/addcredit')}
                >
                    <Text style={styles.buttonText}>Return to Checkout</Text>
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
    iconCircleWarning: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F59E0B', // Amber 500
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    titleWarning: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#F59E0B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginTop: 12,
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
        backgroundColor: '#374151', // Gray 800
        shadowColor: '#374151',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
