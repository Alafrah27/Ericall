import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import DialpadButton from './DialpadButton';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const dialpadConfig = [
    { number: '1', text: '' },
    { number: '2', text: 'ABC' },
    { number: '3', text: 'DEF' },
    { number: '4', text: 'GHI' },
    { number: '5', text: 'JKL' },
    { number: '6', text: 'MNO' },
    { number: '7', text: 'PQRS' },
    { number: '8', text: 'TUV' },
    { number: '9', text: 'WXYZ' },
    { number: '*', text: '' },
    { number: '0', text: '+' },
    { number: '#', text: '' },
];

export default function Dialpad({ onPressNumber, onDelete, onCall }) {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {dialpadConfig.map((item, index) => (
                    <DialpadButton
                        key={index}
                        number={item.number}
                        text={item.text}
                        onPress={onPressNumber}
                    />
                ))}
            </View>
            <View style={styles.bottomRow}>
                <View style={styles.sideButton} />
                
                <TouchableOpacity 
                    style={styles.callButton} 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if(onCall) onCall();
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="call" size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.sideButton} 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if(onDelete) onDelete();
                    }}
                >
                    <Ionicons name="backspace-outline" size={32} color="#888" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: Math.min(width * 0.9, 360), // Limit width on large screens
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: Math.min(width * 0.9, 360),
        marginTop: 10,
        paddingHorizontal: 30,
    },
    sideButton: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    callButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4cd964', // bright green
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#4cd964',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    }
});
