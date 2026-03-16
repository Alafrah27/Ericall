import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OTPTextView from 'react-native-otp-textinput';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useStore } from '../../store/store';

// Form validation schema using Zod for a 6 digit OTP
const otpSchema = z.object({
    otp: z
        .string()
        .length(6, 'Please enter a valid 6-digit code')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
});

export default function VerifyOtp() {
    const router = useRouter();
    const { phone } = useLocalSearchParams();
    const otpInput = useRef(null);
    const [timer, setTimer] = useState(30);
    const [isLoading, setIsLoading] = useState(false);
    const { VerifyOtp, RegisterWithTwilio } = useStore();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: '',
        },
        mode: 'onChange',
    });

    // Simple countdown timer for resend
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleResend = async () => {
        if (timer === 0) {
            setTimer(30);
            console.log("Resending OTP...");
            const result = await RegisterWithTwilio(phone);
            if (result.success) {
                Toast.show({ type: 'success', text1: 'Sent', text2: 'A new OTP has been sent' });
            } else {
                Toast.show({ type: 'error', text1: 'Error', text2: result.message });
            }
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        console.log(`Verifying OTP: ${data.otp}`);
        const result = await VerifyOtp(phone, data.otp);
        setIsLoading(false);
        if (result.success) {
            Toast.show({ type: 'success', text1: 'Verified', text2: 'Welcome to Ericall!' });
            router.replace('/home');
        } else {
            Toast.show({ type: 'error', text1: 'Verification Failed', text2: result.message });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        <View style={styles.content}>
                            {/* Header Section */}
                            <View style={styles.headerContainer}>
                                <Text style={styles.greeting}>Verify Your Number</Text>
                                <Text style={styles.subtitle}>
                                    We've sent a 6-digit authentication code to your phone.
                                </Text>
                            </View>

                            {/* OTP Input Section */}
                            <View style={styles.otpContainer}>
                                <Controller
                                    control={control}
                                    name="otp"
                                    render={({ field: { onChange, value } }) => (
                                        <OTPTextView
                                            ref={otpInput}
                                            handleTextChange={onChange}
                                            inputCount={6}
                                            keyboardType="numeric"
                                            tintColor="#b88144"
                                            offTintColor="#d1d5db"
                                            textInputStyle={styles.otpInput}
                                            containerStyle={styles.otpInputContainer}
                                        />
                                    )}
                                />

                                {errors.otp && (
                                    <Text style={styles.errorText}>
                                        {errors.otp.message}
                                    </Text>
                                )}
                            </View>

                            {/* Resend Action */}
                            <View style={styles.resendContainer}>
                                <Text style={styles.resendText}>Didn't receive code? </Text>
                                <TouchableOpacity
                                    onPress={handleResend}
                                    disabled={timer > 0}
                                    activeOpacity={0.6}
                                >
                                    <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
                                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                        </View>

                        {/* Bottom Button Section */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.button, !isValid && styles.buttonDisabled]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={!isValid || isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>{isLoading ? "Verifying..." : "Verify Now"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    inner: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    headerContainer: {
        marginBottom: 40,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        lineHeight: 24,
    },
    otpContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    otpInputContainer: {
        width: '100%',
        justifyContent: 'space-between',
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderRadius: 12,
        borderBottomWidth: 1.5,
        backgroundColor: '#f3f4f6',
        color: '#111827',
        fontSize: 22,
        fontWeight: '600',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginTop: 16,
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    resendText: {
        fontSize: 15,
        color: '#6b7280',
    },
    resendLink: {
        fontSize: 15,
        color: '#b88144',
        fontWeight: '600',
    },
    resendLinkDisabled: {
        color: '#9ca3af',
        fontWeight: '400',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    },
    button: {
        backgroundColor: '#b88144',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
});