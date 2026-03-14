import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ContactProvider } from "../context/contactContext";
export default function RootLayout() {
  const isAuth = false;
  return (
    <>
      <ContactProvider>

        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          {isAuth ?
            <Stack.Screen name="(drawer)" />
            : (
              <Stack.Screen name="(auth)"

              />
            )}
        </Stack>
      </ContactProvider>
    </>
  );
}
