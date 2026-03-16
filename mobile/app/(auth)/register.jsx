import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useStore } from '../../store/store';

const formSchema = z.object({
    phoneNumber: z
        .string()
        .min(1, 'Phone number is required')
        .min(6, 'Please enter a valid phone number')
        .max(15, 'Phone number is too long')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
});

export default function Register() {
    const router = useRouter();
    const [countryCode, setCountryCode] = useState('US');
    const [callingCode, setCallingCode] = useState('1');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { RegisterWithTwilio } = useStore();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phoneNumber: '',
        },
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        const fullPhone = `+${callingCode}${data.phoneNumber}`;
        console.log(`Sending OTP to ${fullPhone}`);
        const result = await RegisterWithTwilio(fullPhone);
        setIsLoading(false);
        if (result.success) {
            Toast.show({ type: 'success', text1: 'Success', text2: 'OTP sent successfully!' });
            router.push({ pathname: '/verify', params: { phone: fullPhone } });
        } else {
            Toast.show({ type: 'error', text1: 'Error', text2: result.message });
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
                                <Text style={styles.greeting}>Register Your Account</Text>
                                <Text style={styles.subtitle}>
                                    Enter your phone number to stay connected with the people who matter most.
                                </Text>
                            </View>

                            {/* Input Section */}
                            <View style={[
                                styles.inputContainer,
                                isFocused && styles.inputFocused,
                                errors.phoneNumber && styles.inputError
                            ]}>
                                <View style={styles.countryPickerWrapper}>
                                    <CountryPicker
                                        withFilter
                                        withFlag
                                        withCallingCode
                                        withCallingCodeButton
                                        withAlphaFilter
                                        countryCode={countryCode}
                                        onSelect={(country) => {
                                            setCountryCode(country.cca2);
                                            setCallingCode(country.callingCode[0]);
                                        }}
                                        containerButtonStyle={styles.countryPickerButton}
                                    />
                                </View>

                                <View style={styles.divider} />

                                <Controller
                                    control={control}
                                    name="phoneNumber"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Your phone number"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="phone-pad"
                                            value={value}
                                            onChangeText={onChange}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => {
                                                setIsFocused(false);
                                                onBlur();
                                            }}
                                            editable={true}
                                            pointerEvents="auto"
                                        />
                                    )}
                                />
                            </View>

                            {errors.phoneNumber && (
                                <Text style={styles.errorText}>
                                    {errors.phoneNumber.message}
                                </Text>
                            )}
                        </View>

                        {/* Bottom Button Section */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.button, !isValid && styles.buttonDisabled]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={!isValid || isLoading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonText}>{isLoading ? "Sending..." : "Send OTP"}</Text>
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
        fontSize: 30,
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'transparent',
        paddingHorizontal: 12,
        height: 64,
    },
    inputFocused: {
        backgroundColor: '#ffffff',
        borderColor: '#3b82f6',
    },
    inputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginTop: 8,
        marginLeft: 4,
    },
    countryPickerWrapper: {
        justifyContent: 'center',
    },
    countryPickerButton: {
        paddingVertical: 8,
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#d1d5db',
        marginHorizontal: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 18,
        color: '#111827',
        height: '100%',
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