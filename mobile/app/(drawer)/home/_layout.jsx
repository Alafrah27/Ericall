import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: "#ffffff",
                borderTopWidth: 0,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                height: 100,
                paddingBottom: 30,
                paddingTop: 3,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
            },
            tabBarActiveTintColor: '#b88144',
            tabBarInactiveTintColor: '#888888',

        }}>
            <Tabs.Screen name="keyboard" options={{
                title: 'Keyboard',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="keypad" size={24} color={color} />
                ),
                animation: "fade"
            }} />
            <Tabs.Screen name="recents" options={{
                title: 'Recents',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="time" size={24} color={color} />
                ),
                animation: "fade"
            }} />
            <Tabs.Screen name="contacts" options={{
                title: 'Contacts',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="person" size={24} color={color} />
                ),
                animation: "fade"
            }} />
        </Tabs>
    );
}