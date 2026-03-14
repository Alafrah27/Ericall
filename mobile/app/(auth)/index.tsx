import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
      }}
    >
      <Text>anboarding screen</Text>
      <Button title="Login" onPress={() => router.push("/verify")} />
    </View>
  );
}
