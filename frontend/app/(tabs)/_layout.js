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
        <View style={styles.container}>

            <Tabs screenOptions={{
                headerShown: false, tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#355E3B', // also set the tab bar background
                },
            }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <FontAwesome name="home" color='white' size={28} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pickup"
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="car-lifted-pickup" size={30} color='white' />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="market"
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
                                <Fontisto name="shopping-store" size={24} color='white' />
                            </View>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tracker"
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="pig-variant" size={24} color='white' />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
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
        backgroundColor: "#355E3B", // your desired background color
    },
});