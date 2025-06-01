import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../../assets/common/baseURL';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Foundation from '@expo/vector-icons/Foundation';
import { Ionicons } from '@expo/vector-icons';

const SeePickUp = () => {
    const { pickupData } = useLocalSearchParams();
    const pickup = pickupData ? JSON.parse(pickupData) : {};
    const { user } = useSelector((state) => state.auth);
    const sellerId = user.user._id;
    const [buyer, setBuyer] = useState(null);
    const [status, setStatus] = useState("Pending");
    const navigation = useNavigation()
    // Fetch Buyer Details
    useEffect(() => {
        const fetchBuyer = async () => {
            try {
                const response = await axios.get(`${baseURL}/get-user/${pickup.user}`);
                setBuyer(response.data.user);
            } catch (error) {
                console.error("Error fetching buyer details:", error.response?.data || error.message);
            }
        };
        const fetchSackStatus = async () => {
            try {
                const sackIds = mySacks.map(sack => sack.sackId);
                const response = await axios.get(`${baseURL}/sack/see-sacks`, {
                    params: { sackIds }
                });
                console.log(response, 'DATA GET')
                const allSacksClaimed = response.data.sacks.every(sack => sack.status === "claimed");
                if (allSacksClaimed) {
                    setStatus("Claimed");
                }
            } catch (error) {
                console.error("Error fetching buyer details:", error.response?.data || error.message);
            }
        };

        if (pickup._id) {
            fetchBuyer();
            fetchSackStatus();
        }
    }, [pickup._id]);

    const mySacks = pickup.sacks?.filter(sack => sack.seller === sellerId) || [];
    const totalSellerKilo = mySacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);

    // console.log(mySacks,'My sack')

    const handleCompleteSackStatus = async () => {
        try {
            const sackIds = mySacks.map(sack => sack.sackId);
            const response = await axios.put(`${baseURL}/sack/update-status`, { status: 'claimed', sackIds });
            Alert.alert(
                "The waste is now picked up!!",
                `Thankyou ${user.user.name}`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.goBack()
                        },
                    },
                ]
            );
        } catch (e) {
            console.error("Error updating sacks:", e);
        }
    };
    return (
        <FlatList
            style={styles.container}
            data={mySacks}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <View style={{ width: '95%', alignSelf: 'center' }}>
                    <View style={styles.sackCard}>
                        <Image
                            source={{ uri: item.images[0]?.url || "https://via.placeholder.com/150" }}
                            style={styles.stallImage}
                        />
                        <View style={styles.sackInfo}>
                            <Text style={styles.textWhite}>Stall #: {item.stallNumber}</Text>
                            <Text style={styles.textWhite}>Weight: {item.kilo} KG</Text>
                            <Text style={styles.textWhite}>Description: {item.description}</Text>
                            <Text style={styles.textWhite}>Location: {item.location}</Text>
                        </View>
                    </View>
                </View>

            )}
            ListEmptyComponent={<Text style={styles.textWhite}>No sacks found for this seller.</Text>}
            ListHeaderComponent={
                <>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.iconGroup}>
                                    <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
                                </View>
                                <Text style={styles.greeting}>   Pickup </Text>
                                <Text style={styles.name}>Detail</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ padding: 10, }}>
                        <View style={styles.pickupCard}>
                            <View><Text style={styles.textWhite}>Pickup ID: {pickup._id}</Text></View>
                            <View style={styles.sackContainer}>
                                <Text style={{ color: 'white', fontSize: 14 }}>Status:
                                    <Text style={{ color: '#AFE1AF', fontSize: 14 }}> {status}</Text>
                                </Text>
                                <View style={{ backgroundColor: '#1A2F23', padding: 20, marginBottom: 5, flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="sack" size={80} color="white" />
                                    <Text style={styles.sackWeight}>{totalSellerKilo} KG</Text>
                                </View>
                                {status !== "claimed" && (
                                    <Text style={styles.text}>
                                        Pickup Time: {new Date(new Date(pickup.pickupTimestamp).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}{" "}
                                        {new Date(pickup.pickupTimestamp).toLocaleTimeString("en-US", {
                                            timeZone: "UTC",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </Text>
                                )}
                            </View>

                            {buyer && (
                                <>
                                    <Text style={styles.sectionTitle}>Collector Details</Text>
                                    <View style={styles.buyerCard}>
                                        <Image source={{ uri: buyer.avatar?.url || "https://via.placeholder.com/100" }} style={styles.buyerImage} />
                                        <View style={{ marginLeft: 10, padding: 10, borderRadius: 5, width: 230 }}>
                                            <Text style={styles.textWhite}>Name: {buyer.name}</Text>
                                            <Text style={styles.textWhite}>Email: {buyer.email}</Text>
                                            <Text style={styles.textWhite}>
                                                Address: {buyer.address?.lotNum}, {buyer.address?.street}{"\n"}
                                                {buyer.address?.baranggay}, {buyer.address?.city}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                    {status !== "Claimed" && (
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={handleCompleteSackStatus}
                                style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 20, marginBottom: 10, width: "80%" }}
                            >
                                <Text style={{ color: 'white', marginTop: 5, textAlign: 'center' }}>Handed Sacks</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    <Text style={{ textAlign: 'center' }}>Sack/s to Pickup</Text>
                </>
            }

        />
    );

};

export default SeePickUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A2F23',
        padding: 20,
        height: 90,
        shadowColor: '#2BA84A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    greeting: {
        fontSize: 16,
        fontWeight: '600',
        color: '#B5FDC2',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#B5FDC2',
    },
    iconButton: {
        padding: 6,
        backgroundColor: '#1A2F23',
        borderRadius: 100,
    },
    pickupCard: {
        backgroundColor: '#2A4535',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        backdropFilter: 'blur(10px)',
        shadowColor: '#AFE1AF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    text: {
        fontSize: 13,
        color: '#E0F4E5',
        marginTop: 5,
    },
    textWhite: {
        fontSize: 13,
        color: 'white',
    },
    sackCard: {
        backgroundColor: '#2A4535',
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginVertical: 8,
        shadowColor: '#2BA84A',
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    stallImage: {
        width: 75,
        height: 75,
        borderRadius: 12,
        marginRight: 12,
    },
    sackInfo: {
        flex: 1,
    },
    sackContainer: {
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 15,
    },
    sackWeight: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    buyerCard: {
        borderRadius: 15,
        padding: 15,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buyerImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#AFE1AF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: 'white',
        marginTop: 20,
        marginBottom: 8,
    },
});
