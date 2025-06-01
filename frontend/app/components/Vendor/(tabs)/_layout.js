import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
    const { user } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.replace("/");
            return;
        }

        const role = user.user?.role || user.role;
        switch (role) {
            case "farmer":
                router.replace("/(tabs)");
                break;
            case "composter":
                router.replace("/components/Composter/(tabs)");
                break;
            case "vendor":
                router.replace("/components/Vendor/(tabs)");
                break;
            case "admin":
                router.replace("/components/Admin/(tabs)");
                break;
        }
    }, [user, router]);

    return (
        <View style={styles.container}>
            <Tabs screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#1A2F23', // also set the tab bar background
                },
            }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        headerShown: false,
                        title: "Home",
                        tabBarIcon: ({ color }) => (
                            <FontAwesome name="home" color='white' size={28} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pickup"
                    options={{
                        headerShown: false,
                        title: "Pickup",
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="car-lifted-pickup" size={33} color='white' />
                        ),
                    }}
                />

                {/* Center Market Button */}
                <Tabs.Screen
                    name="stall"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <View
                                style={{
                                    width: 60,
                                    height: 60,
                                    backgroundColor: "#007AFF",
                                    borderRadius: 30,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <MaterialCommunityIcons name="shopping" size={32} color="white" />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="Chats"
                    options={{
                        headerShown: false,
                        title: "Chats",
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="android-messages" size={24} color='white' />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        headerShown: false,
                        title: "Profile",
                        tabBarIcon: ({ color }) => (
                            <FontAwesome name="user" color='white' size={28} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A2F23",
    },
});