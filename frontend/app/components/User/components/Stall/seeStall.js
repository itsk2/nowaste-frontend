import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const SeeStall = () => {
    const { stall } = useLocalSearchParams();
    const stallData = stall ? JSON.parse(stall) : {};

    const sackData = {
        description: "A sack filled with mixed vegetable waste, currently at 50% capacity.",
        location: "📍 Taytay Market, Rizal City",
        postedDate: "2024-02-13",
    };
    const getAvailabilityStatus = (postedDate) => {
        const today = new Date();
        const postDate = new Date(postedDate);
        const daysAgo = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));

        return daysAgo >= 3 ? "❌ Not Available (Ready to Compost)" : "✅ Available";
    };

    const bottomSheetModalRef = useRef(null);

    const snapPoints = useMemo(() => ['25%', '50%', '75'], []);

    const handlePresentModalPress = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    return (
        <View style={styles.container}>
            {stallData?.stallImage?.url && (
                <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
            )}
            <Text style={styles.title}>{stallData?.stallDescription || "No Description"}</Text>
            <Text style={styles.text}>📍 {stallData?.stallAddress || "No Address"}</Text>
            <Text style={styles.text}>🔢 Stall Number: {stallData?.stallNumber || "N/A"}</Text>
            <View style={styles.card}>
                <View style={styles.iconWrapper}>
                    <View style={styles.halfBackground} />
                    <MaterialCommunityIcons name="sack-percent" size={50} color="green" style={styles.icon} />
                </View>
                <View style={styles.content}>
                    <Text style={styles.cardTitle}>{sackData.description}</Text>
                    <Text style={styles.cardText}>{sackData.location}</Text>
                    <Text style={styles.cardText}>📅 Posted: {sackData.postedDate} (more than 3 days ago)</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            getAvailabilityStatus(sackData.postedDate) === "✅ Available" ? styles.available : styles.unavailable,
                        ]}
                    >
                        <Text style={styles.statusText}>{getAvailabilityStatus(sackData.postedDate)}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push({
                            pathname: "/components/User/components/map",
                        })}
                    >
                        <Text style={styles.buttonText}>Pickup</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default SeeStall;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        elevation: 3,
    },
    iconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    halfBackground: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: '#0096FF',
        left: 0,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
    },
    icon: {
        zIndex: 1,
    },
    content: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    cardText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 3,
    },
    statusBadge: {
        marginTop: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        alignSelf: "flex-start",
    },
    available: {
        backgroundColor: "green",
    },
    unavailable: {
        backgroundColor: "red",
    },
    statusText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#ff6f00',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

