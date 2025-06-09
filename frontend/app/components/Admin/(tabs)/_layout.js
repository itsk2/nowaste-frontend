import { useState, useEffect, useRef } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Easing,
} from "react-native";
import { useRouter, Slot, usePathname } from "expo-router";
import { useSelector } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function RootLayout() {
    const { user } = useSelector((state) => state.auth);
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-120)).current;

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

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: sidebarVisible ? 0 : -120,
            duration: 30,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease),
        }).start();
    }, [sidebarVisible]);

    const navItems = [
        {
            label: "Home",
            icon: <MaterialIcons name="dashboard" size={24} color="white" />,
            route: "/components/Admin/",
        },
        {
            label: "Analytics",
            icon: <MaterialIcons name="analytics" size={24} color="white" />,
            route: "/components/Admin/analytics",
        },
        {
            label: "Market",
            icon: <FontAwesome5 name="store" size={24} color="white" />,
            route: "/components/Admin/marketAnalytics",
        },
        {
            label: "Profile",
            icon: <FontAwesome name="user" size={24} color="white" />,
            route: "/components/Admin/profile",
        },
    ];

    return (
        <View style={styles.container}>
            {/* Top Bar with Hamburger */}
            <View style={styles.topBar}>
                <TouchableOpacity style={{ marginLeft: 15 }} onPress={() => setSidebarVisible(!sidebarVisible)}>
                    <Ionicons name="menu" size={28} color="white" />
                </TouchableOpacity>

                <View style={{ marginLeft: 30 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Admin Dashboard</Text>
                    <Text style={{ color: 'white', textAlign: 'center' }}>Track and manage, market waste collection.</Text>
                </View>
            </View>

            {/* Sidebar */}
            <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
                {navItems.map((item, index) => {
                    const isActive = pathname === item.route;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                router.push(item.route);
                                setSidebarVisible(false);
                            }}
                            style={[styles.navItem, isActive && styles.activeNavItem]}
                        >
                            {item.icon}
                            <Text style={styles.label}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>

            {/* Main Content */}
            <View style={styles.content}>
                <Slot />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        height: 60,
        backgroundColor: "#1A2F23",
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    sidebar: {
        position: "absolute",
        top: 60,
        bottom: 0,
        width: 120,
        backgroundColor: "#111827",
        paddingTop: 20,
        alignItems: "center",
        zIndex: 100,
    },
    navItem: {
        marginVertical: 20,
        alignItems: "center",
    },
    activeNavItem: {
        backgroundColor: "#1F2937",
        padding: 10,
        borderRadius: 10,
    },
    label: {
        color: "white",
        fontSize: 12,
        marginTop: 5,
    },
    content: {
        flex: 1,
        backgroundColor: "#E9FFF3",
        padding: 10,
    },
});