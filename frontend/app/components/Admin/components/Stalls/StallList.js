import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { getAllStalls } from '../../../../(services)/api/Users/getAllStalls';
import { useFocusEffect, useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

const StallList = () => {
    const [allStalls, setAllStalls] = useState([]);
    const router = useRouter();

    const fetchAllStore = async () => {
        try {
            const data = await getAllStalls();
            setAllStalls(data.stalls);
        } catch (error) {
            // console.error("Error fetching stalls:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllStore();
        }, [])
    );
    // console.log(allStalls, 'Allstalls')
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.iconGroup}>
                            <AntDesign name="back" size={24} color="white" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.greeting}>Stall </Text>
                            <Text style={styles.greeting}>List</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.overlay}>
                <View style={{ padding: 15, marginBottom: 80 }}>
                    <FlatList
                        data={allStalls}
                        keyExtractor={(item, index) => item?._id || index.toString()}
                        renderItem={({ item }) => {
                            const stallData = item.stall || item;
                            const isOpen = stallData.status === "open";
                            console.log(stallData, 'StallData')
                            return (
                                <View style={styles.card}>
                                    {stallData.stallImage?.url && (
                                        <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
                                    )}
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <View style={[styles.statusBadge, { backgroundColor: isOpen ? "#4CAF50" : "#F44336" }]}>
                                                <Text style={styles.statusText}>{isOpen ? "Open" : "Closed"}</Text>
                                            </View>
                                        </View>
                                        <Text style={{ color: 'white', padding: 2 }}>🆔 {stallData.stallNumber || "N/A"}</Text>
                                        <Text style={{ color: 'white', padding: 2 }}>📍 {stallData.location || "Taytay, Rizal New Market"}</Text>
                                        <Text style={{ color: 'white', padding: 2 }}>📜 {stallData.stallDescription || "Taytay, Rizal New Market"}</Text>
                                        <Text style={{ color: 'white', padding: 2 }}>🕒 {stallData.closeHours || "Taytay, Rizal New Market"}</Text>
                                        <Text style={{ color: 'white', padding: 2 }}>      {stallData.openHours || "Taytay, Rizal New Market"}</Text>

                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => router.push({
                                                pathname: "/components/Admin/components/Stalls/EditStall",
                                                params: { _id: JSON.stringify(item._id) },
                                            })}
                                        >
                                            <Text style={styles.buttonText}>Edit Stall</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </View>
    )
}

export default StallList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3'
    },
    headerContainer: {
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A2F23',
        padding: 20,
        height: 77,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '500',
        color: '#fff',
    },
    name: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#2BA84A',
        marginVertical: 4,
        fontFamily: 'Inter-Medium',
    },
    iconGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        padding: 8,
        borderRadius: 50,
    },
    card: {
        backgroundColor: '#2A4535',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 2
    },
    image: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 15,
        backgroundColor: '#2A4535',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#00C853', // Green button like in your image
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})