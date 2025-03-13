import { Tabs, useFocusEffect, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/Fontisto";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import { useSelector } from "react-redux";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RootLayout() {
    const { user } = useSelector((state) => state.auth);
    const router = useRouter();
    const [isProfile, setIsProfile] = useState(false);

    useEffect(() => {
        if (!user) {
            router.replace("/");
        }
    }, [user, router]);

    useFocusEffect(() => {
        setIsProfile(router.pathname === "/profile");
    });

    return (
        <View style={{ flex: 1 }}>
            {/* Floating Button (Hidden in Profile Tab) */}
            {!isProfile && (
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => router.push('components/User/components/MySack/mySack')}
                >
                    <Entypo name="shopping-cart" size={20} color="white" />
                </TouchableOpacity>
            )}

            <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <FontAwesome name="home" color={color} size={28} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="market"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Fontisto name="shopping-store" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pickup"
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
                                <MaterialCommunityIcons name="car-lifted-pickup" size={30} color="white" />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="notification"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="notifications-sharp" size={24} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <FontAwesome name="user" color={color} size={28} />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: "absolute",
        top: Constants.statusBarHeight,
        right: 20,
        backgroundColor: "#4caf50",
        width: 40,
        height: 40,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 999,
    },
});