import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import DrawerToggleButton from '@/components/DrawerToggleButton'
import Dialpad from '@/components/Dialpad'

const DailScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handlePressNumber = (num) => {
        setPhoneNumber(prev => prev + num);
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const handleCall = () => {
        if (!phoneNumber) return;
        console.log("Calling: ", phoneNumber);
        // Add actual call logic here
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <DrawerToggleButton />
            </View>
            
            <View style={styles.displayContainer}>
                <Text 
                    style={[
                        styles.displayText, 
                        phoneNumber.length > 10 && styles.displayTextSmall,
                        phoneNumber.length > 14 && styles.displayTextTiny
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {phoneNumber}
                </Text>
            </View>

            <View style={styles.dialpadContainer}>
                <Dialpad 
                    onPressNumber={handlePressNumber} 
                    onDelete={handleDelete}
                    onCall={handleCall}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff' 
    },
    header: {
        paddingHorizontal: 15,
        alignItems: 'flex-start',
    },
    displayContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    displayText: {
        fontSize: 48,
        fontWeight: '300',
        color: '#333',
        letterSpacing: 2,
    },
    displayTextSmall: {
        fontSize: 36,
    },
    displayTextTiny: {
        fontSize: 28,
    },
    dialpadContainer: {
        paddingBottom: 20, 
    }
});

export default DailScreen;