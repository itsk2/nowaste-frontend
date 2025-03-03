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
    }, [user, router]);

    return (
        <Tabs>
            <Tabs.Screen name="index" options={{
                headerShown: false, title: 'Home', tabBarIcon: ({ color }) => (
                    <FontAwesome name='home' color={color} size={28} />
                )
            }} />
            <Tabs.Screen name="market" options={{
                headerShown: false, title: 'Market', tabBarIcon: ({ color }) => (
                    <Fontisto name="shopping-store" size={24} color={color} />
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