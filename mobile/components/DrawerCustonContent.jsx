import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useStore } from '../store/store'
import { useRouter } from 'expo-router'

const DrawerCustonContent = (props) => {
    const { top, bottom } = useSafeAreaInsets()
    const { phone, Logout } = useStore()
    const router = useRouter()

    const handleLogout = async () => {
        await Logout()
        router.replace('/(auth)')
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{
                paddingHorizontal: 20,
                paddingTop: top + 20,
                paddingBottom: 25,
                borderBottomWidth: 1,
                borderBottomColor: "#f0f0f0",
                backgroundColor: "#fff",
                alignItems: "center",
            }}>
                <View style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: "#fdf8f5",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 12,
                    shadowColor: "#b88144",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                }}>
                    <Ionicons name="call" size={32} color="#b88144" />
                </View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#333", letterSpacing: 0.5 }}>Ericall</Text>
                <Text style={{ fontSize: 14, color: "#888", marginTop: 4, fontWeight: "500" }}>{phone || 'Unknown phone'}</Text>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: 10 }}>
                <DrawerItemList {...props} />
                <View style={{ flex: 1 }} />

                <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 14,
                        borderRadius: 12,
                        marginBottom: bottom,


                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color="#e53e3e" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#e53e3e" }}>Logout</Text>
                </TouchableOpacity>
            </DrawerContentScrollView>
        </View>
    )
}

export default DrawerCustonContent