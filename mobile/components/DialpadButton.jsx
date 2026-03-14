import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import React, { useRef } from 'react';
import * as Haptics from 'expo-haptics';

export default function DialpadButton({ number, text, onPress, disabled }) {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Animated.spring(scaleValue, {
                toValue: 0.9,
                useNativeDriver: true,
                speed: 30,
                bounciness: 0
            }).start();
        }
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            speed: 30,
            bounciness: 0
        }).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => !disabled && onPress(number)}
                disabled={disabled}
                style={styles.button}
                android_ripple={{ color: '#e0e0e0', borderless: false, radius: 40 }}
            >
                <Text style={styles.number}>{number}</Text>
                {text ? <Text style={styles.text}>{text}</Text> : null}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f6f6f6',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        elevation: 1, // for android shadow
        shadowColor: '#000', // for ios shadow
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    number: {
        fontSize: 32,
        fontWeight: '400',
        color: '#333',
    },
    text: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
        marginTop: -2,
        letterSpacing: 1.5,
    }
});
