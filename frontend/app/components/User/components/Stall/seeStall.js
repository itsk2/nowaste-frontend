import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, StatusBar, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import baseURL from '../../../../../assets/common/baseURL';
import axios from 'axios';
import { useSelector } from 'react-redux';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';

const SeeStall = () => {
    const { stall } = useLocalSearchParams();
    const stallData = stall ? JSON.parse(stall) : {};
    const sellerId = stallData?.user || []
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id
    const [sackData, setStoreSacks] = useState([]);

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${sellerId}`);
            const filteredSacks = data.sacks.filter(sack => sack.status === "posted");

            setStoreSacks(filteredSacks);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchStoreSacks();

                const interval = setInterval(() => {
                    fetchStoreSacks();
                }, 5000);

                return () => clearInterval(interval);
            }
        }, [userId])
    );

    const handleAddtoSack = async (item) => {
        console.log("Adding to Sack:", item);
        try {
            const { data } = await axios.post(`${baseURL}/sack/add-to-sack/${userId}`, item);

            if (data.message) {
                Alert.alert("Success", data.message);
            }
        } catch (error) {
            // console.error("Error Adding to Sack:", error.response?.data || error.message);
            Alert.alert("Cannot Proceed", error.response?.data?.message);
        }
    };

    return (
        <>
            <StatusBar translucent backgroundColor={"transparent"} />
            <FlatList
                ListHeaderComponent={
                    <View style={styles.container}>
                        {stallData?.stallImage?.url && (
                            <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
                        )}
                        <Text style={styles.title}>{stallData?.stallDescription || "No Description"}</Text>
                        <Text style={styles.text}>📍 {stallData?.stallAddress || "No Address"}</Text>
                        <Text style={styles.text}>🔢 Stall Number: {stallData?.stallNumber || "N/A"}</Text>
                    </View>
                }
                data={sackData}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={{ marginLeft: 100 }}>
                            <View style={styles.iconWrapper}>
                                {item?.images?.[0]?.url && (
                                    <Image source={{ uri: item.images[0].url }} style={{ width: 70, height: 70, borderRadius: 50 }} />
                                )}
                            </View>
                            <View>
                                <Text style={styles.cardTitle}>{item.description}</Text>
                                <Text style={styles.cardText}>{item.location}</Text>
                                <Text style={styles.cardText}>kg: {item.kilo}</Text>
                                <Text style={styles.cardText}>📅 Posted: {new Date(item.createdAt).toLocaleDateString("en-US")}</Text>
                                <Text style={styles.cardText}>🗓 Spoilage Date: {new Date(item.dbSpoil).toLocaleDateString("en-US")}</Text>
                                {new Date(item.dbSpoil) < new Date() ? (
                                    <MaterialIcons name="compost" size={24} color="black" />
                                ) : (
                                    <FontAwesome name="star" size={20} color="gold" style={{ alignSelf: 'flex-end' }} />
                                )}
                            </View>
                            {user.user.role !== 'admin' && (
                                <TouchableOpacity style={styles.button} onPress={() => handleAddtoSack(item)}>
                                    <Text style={styles.buttonText}>Add to Sack</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.noDataText}>No sacks available</Text>}
            />
        </>
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
        width: '90%',
        alignSelf: "center"
    },
    iconWrapper: {
        width: '100%',
        height: 70,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    halfBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#0096FF',
        left: 0,
        borderTopLeftRadius: 50,
        borderBottomLeftRadius: 50,
    },
    icon: {
        zIndex: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        width: '100%',
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#D1E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    icon: {
        zIndex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 12,
        color: '#777',
        marginBottom: 3,
    },
    statusBadge: {
        marginTop: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    available: {
        backgroundColor: '#4CAF50',
    },
    unavailable: {
        backgroundColor: '#F44336',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    button: {
        marginTop: 10,
        backgroundColor: '#4CAF50',
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
