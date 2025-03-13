import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../../assets/common/baseURL';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Foundation from '@expo/vector-icons/Foundation';

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
        <View style={styles.container}>
            <Text style={styles.title}>See Pick Up</Text>

            <View style={styles.pickupCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {status !== "Claimed" && (
                        <TouchableOpacity
                            onPress={handleCompleteSackStatus}
                            style={{ backgroundColor: 'green', padding: 10, borderRadius: 20 }}
                        >
                            <Text style={{ color: 'white', marginTop: 5 }}>Confirm</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => router.push({
                        pathname: "/components/User/components/map",
                    })}
                    >
                        <Foundation name="map" size={30} color="white" />
                        <Text style={{ color: 'white' }}>Map</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sackContainer}>
                    <MaterialCommunityIcons name="sack" size={100} color="white" style={styles.sackImage} />
                    <Text style={styles.sackWeight}>{totalSellerKilo} KG</Text>
                    <Text style={{ color: 'white', fontSize: 18 }}>Status:
                        <Text style={{ color: '#AFE1AF', fontSize: 18 }}> {status}</Text>
                    </Text>
                    {status !== "Claimed" && (
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
            </View>

            {/* Display Buyer Information */}
            {buyer && (
                <View style={styles.buyerCard}>
                    <Text style={styles.sectionTitle}>Buyer Information</Text>
                    <Image source={{ uri: buyer.avatar?.url || "https://via.placeholder.com/100" }} style={styles.buyerImage} />
                    <Text style={styles.textWhite}>Name: {buyer.name}</Text>
                    <Text style={styles.textWhite}>Email: {buyer.email}</Text>
                    <Text style={styles.textWhite}>
                        Address: {buyer.address?.lotNum}, {buyer.address?.street}, {buyer.address?.baranggay}, {buyer.address?.city}
                    </Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>Your Sacks</Text>

            <FlatList
                data={mySacks}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
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
                )}
                ListEmptyComponent={<Text style={styles.textWhite}>No sacks found for this seller.</Text>}
            />
        </View>
    );
};

export default SeePickUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2a2e35',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 15,
        marginBottom: 10,
    },
    pickupCard: {
        backgroundColor: '#3b3f47',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    text: {
        fontSize: 14,
        color: 'white',
        marginTop: 5,
    },
    sackCard: {
        backgroundColor: '#4a4e57',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 8,
    },
    stallImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        marginRight: 15,
    },
    sackInfo: {
        flex: 1,
    },
    textWhite: {
        fontSize: 12,
        color: 'white',
        marginBottom: 3,
    },
    sackContainer: {
        alignItems: 'center',
        backgroundColor: '#2E4237',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
    },
    sackWeight: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    buyerCard: {
        backgroundColor: '#4a4e57',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    buyerImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
});