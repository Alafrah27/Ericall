import 'react-native-gesture-handler';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ContactProvider } from "../context/contactContext";
import Toast from 'react-native-toast-message';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from '../store/store';
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Prevent the splash screen from auto-hiding while we check auth
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isLoggedIn, setAuthData } = useStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontError) console.error("Error loading fonts:", fontError);
  }, [fontError]);

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

  useEffect(() => {
    if (!isReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isLoggedIn && !inAuthGroup) {
      // User is not logged in and not currently in the auth group. Redirect to sign-in.
      router.replace('/(auth)');
    } else if (isLoggedIn && inAuthGroup) {
      // User is logged in but stuck in the auth group. Redirect to home.
      router.replace('/(drawer)/home');
    }

    // Hide splash screen once routing logic fires and fonts are loaded
    SplashScreen.hideAsync().catch(() => {});
  }, [isLoggedIn, isReady, fontsLoaded, segments]);

  if (!isReady || !fontsLoaded) {
    return null; 
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ContactProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="(auth)" />
          </Stack>
          <Toast />
        </ContactProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
