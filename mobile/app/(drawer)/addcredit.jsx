
import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import DrawerToggleButton from '@/components/DrawerToggleButton'
import { ScrollView } from 'react-native'

const Addcredit = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={{
                paddingHorizontal: 10,
            }}>
                <DrawerToggleButton />
                <Text>addcredit</Text>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Addcredit