import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

const windowWidth = Dimensions.get('window').width;

export default function Footer() {
    const router = useRouter();

    return (
        <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/")} style={{
                marginLeft: 25
            }}>
                <FontAwesome name="home" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(tabs)/pickup")} style={{ marginLeft: 55 }}>
                <MaterialCommunityIcons name="car-lifted-pickup" size={32} color="white" />
            </TouchableOpacity>

            {/* Floating center button */}
            <TouchableOpacity
                onPress={() => router.push("/(tabs)/market")}
                style={styles.centerButton}
                activeOpacity={0.8}
            >
                <Fontisto name="shopping-store" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(tabs)/tracker")} style={{ marginLeft: 125 }}>
                <MaterialCommunityIcons name="pig-variant" size={25} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.iconButton}>
                <FontAwesome name="user" size={26} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 11,
        backgroundColor: '#355E3B',
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    iconButton: {
        flex: 1,
        marginLeft: 57
    },
    centerButton: {
        position: 'absolute',
        top: -10,
        left: windowWidth / 2 - 30, 
        width: 60,
        height: 60,
        backgroundColor: "#007AFF",
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        zIndex: 10,
    },
});