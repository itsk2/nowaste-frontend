import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Fontisto from '@expo/vector-icons/Fontisto';
import Entypo from '@expo/vector-icons/Entypo';

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
                router.replace("/(tabs)");
                break;
            case "vendor":
                router.replace("/components/Vendor/(tabs)");
                break;
        }
    }, [user, router]);

    return (
        <Tabs>
            <Tabs.Screen name="index" options={{
                headerShown: false, title: 'Home', tabBarIcon: ({ color }) => (
                    <FontAwesome name='home' color={color} size={28} />
                )
            }} />
            <Tabs.Screen name="stall" options={{
                headerShown: false, title: 'My Stall', tabBarIcon: ({ color }) => (
                    <Fontisto name="shopping-store" size={24} color={color} />
                )
            }} />
            <Tabs.Screen name="map" options={{
                headerShown: false, title: 'Map', tabBarIcon: ({ color }) => (
                    <Entypo name="map" size={24} color="black" />
                )
            }} />
            <Tabs.Screen name="profile" options={{
                headerShown: false, title: 'Profile', tabBarIcon: ({ color }) => (
                    <FontAwesome name='user' color={color} size={28} />
                )
            }} />
        </Tabs>
    );
};