

import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';


const DrawerToggleButton = () => {
    const navigation = useNavigation();
    return (
        <Pressable onPress={() => navigation.openDrawer()}
            style={{
                marginVertical: 10,
            }}
        >
            <Ionicons name="menu" size={34} color="black" />
        </Pressable>
    )
}

export default DrawerToggleButton