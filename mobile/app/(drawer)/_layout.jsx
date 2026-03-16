import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import DrawerCustonContent from "../../components/DrawerCustonContent";
export default function DrawerLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Drawer
                drawerContent={(props) => <DrawerCustonContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerActiveTintColor: '#b88144',
                    drawerInactiveTintColor: '#888888',
                    drawerLabelStyle: {
                        marginLeft: -5,
                    },
                }}>
                <Drawer.Screen name="home" options={{
                    drawerLabel: 'Home',
                    title: 'Overview',
                    drawerIcon: ({ color }) => (
                        <Ionicons name="home-outline" size={24} color={color} />
                    ),
                }} />
                <Drawer.Screen name="addcredit" options={{
                    drawerLabel: 'Wallet',
                    title: 'Wallet',
                    drawerIcon: ({ color }) => (
                        <MaterialIcons name="attach-money" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="gifts" options={{
                    drawerLabel: 'Send Gift',
                    title: 'Send Gift',
                    drawerIcon: ({ color }) => (
                        <Octicons name="gift" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="transations" options={{
                    drawerLabel: 'Transactions',
                    title: 'Transactions History',
                    drawerIcon: ({ color }) => (
                        <Ionicons name="receipt-outline" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="callhistory" options={{
                    drawerLabel: 'Call History',
                    title: 'Call History',
                    drawerIcon: ({ color }) => (
                        <Ionicons name="call-outline" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="rate" options={{
                    drawerLabel: 'Rate us',
                    title: 'Rate us',
                    drawerIcon: ({ color }) => (
                        <Ionicons name="star-outline" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="aboutus" options={{
                    drawerLabel: 'About Us',
                    title: 'About Us',
                    drawerIcon: ({ color }) => (
                        <Ionicons name="information-circle-outline" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="supportandservice" options={{
                    drawerLabel: 'Support and Service',
                    title: 'Support and Service',
                    drawerIcon: ({ color }) => (
                        <MaterialIcons name="support-agent" size={24} color={color} />
                    ),

                }} />
                <Drawer.Screen name="setting" options={{
                    drawerLabel: 'Setting',
                    title: 'Setting',
                    drawerIcon: ({ color }) => (
                        <Ionicons name="settings-outline" size={24} color={color} />
                    ),

                }} />
            </Drawer>
        </>
    );
}