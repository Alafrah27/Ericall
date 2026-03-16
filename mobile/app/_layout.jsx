import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ContactProvider } from "../context/contactContext";
import Toast from 'react-native-toast-message';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from '../store/store';
import React, { useEffect, useState } from 'react';


export default function RootLayout() {
  const { isLoggedIn, setAuthData } = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const phone = await AsyncStorage.getItem("phone");
        
        if (token && phone) {
          setAuthData(phone, token); // Hydrate Zustand store
        }
      } catch (error) {
        console.error("Error reading auth data from storage:", error);
      } finally {
        setIsReady(true);
      }
    };

    checkAuthStatus();
  }, []);

  if (!isReady) {
    // You could return a Splash screen or loading indicator here instead of null
    return null; 
  }

  return (
    <>
      <ContactProvider>

        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="(drawer)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
        <Toast />
      </ContactProvider>
    </>
  );
}
