import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { View } from "react-native";

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
            case "composter":
                router.replace("/(tabs)");
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
        <Tabs screenOptions={{ tabBarShowLabel: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="dashboard" size={24} color="black" />
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
                            <Entypo name="shop" size={24} color="white" />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    title: "Profile",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="user" color='black' size={28} />
                    ),
                }}
            />
        </Tabs>
    );
}

