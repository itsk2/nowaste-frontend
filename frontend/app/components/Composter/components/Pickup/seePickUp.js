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
    const pickup = pickupData ? JSON.parse(pickupData) : [];
    const [pickupStatus, setPickupStatus] = useState(pickup.status);
    const { user } = useSelector((state) => state.auth);
    const [sackStatuses, setSackStatuses] = useState({});
    const [sellers, setSellers] = useState({});
    const userId = user.user._id;
    const navigation = useNavigation()

    useEffect(() => {
        const fetchSackSellers = async () => {
            try {
                const sellerData = {};
                await Promise.all(
                    pickup.sacks.map(async (item) => {
                        const { data } = await axios.get(`${baseURL}/get-user/${item.seller}`);
                        sellerData[item.seller] = data.user;
                    })
                );
                setSellers(sellerData);
            } catch (error) {
                console.error('Error fetching sellers:', error);
            }
        };

        fetchSackSellers();
    }, [userId]);

    const handlePickupStatus = async () => {
        try {
            const { data } = await axios.put(`${baseURL}/sack/pickup-sack-now/${pickup._id}`);
            setPickupStatus(data.status);
            Alert.alert(
                "Now you are going to pickup.",
                "Go to Maps",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.push('/components/User/components/map')
                        },
                    },
                ]
            );
        } catch (e) {
            console.log(e)
        }
    }

    const fetchAllSackStatuses = async () => {
        try {
            const statuses = {};
            await Promise.all(
                pickup.sacks.map(async (item) => {
                    const response = await axios.get(`${baseURL}/sack/see-sacks`, {
                        params: { sackIds: item.sackId }
                    });
                    if (response.data.sacks.length > 0) {
                        statuses[item.sackId] = response.data.sacks[0].status;
                    } else {
                        statuses[item.sackId] = "Not Found";
                    }
                })
            );
            setSackStatuses(statuses);
        } catch (error) {
            console.error("Error fetching sack statuses:", error);
        }
    };
    useEffect(() => {
        fetchAllSackStatuses();
    }, [userId]);

    const handleCompletePickUpStatus = async () => {
        try {
            const data = await axios.put(`${baseURL}/sack/complete-pickup/${pickup._id}`)
            Alert.alert(
                "Pickup Was Now Completed!!",
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
        } catch (error) {
            console.log('Error in completing pickup status', error.message)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>See Pick Up</Text>
            <View style={styles.pickupCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {pickupStatus !== "completed" && (
                        <TouchableOpacity onPress={() => handlePickupStatus()}>
                            <MaterialCommunityIcons name="car-lifted-pickup" size={35} color="white" />
                            <Text style={{ color: 'white' }}>Pickup</Text>
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
                    <Text style={styles.sackWeight}>{pickup.totalKilo} KG</Text>
                    <Text style={styles.text}>Status: {pickupStatus}</Text>
                    {pickupStatus !== "completed" && (
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

            <Text style={styles.sectionTitle}>Stall/s Info</Text>

            <FlatList
                data={pickup.sacks}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.sackCard}>
                        <Image
                            source={{ uri: sellers[item.seller]?.stall?.stallImage?.url || "https://via.placeholder.com/150" }}
                            style={styles.stallImage}
                        />
                        <View style={styles.sackInfo}>
                            <Text style={styles.textWhite}>Stall #: {item.stallNumber}</Text>
                            <Text style={styles.textWhite}>
                                Seller: {sellers[item.seller]?.name || "Unknown"}
                            </Text>
                            <Text style={styles.textWhite}>
                                Stall Address: {sellers[item.seller]?.stall?.stallAddress || "Unknown"}
                            </Text>
                            <Text style={styles.text}>
                                {sellers[item.seller]?.stall?.status === "open" ? "Open: 🟢" : "Close: 🔴"}
                            </Text>
                        </View>
                    </View>
                )}
            />
            {pickupStatus !== "completed" && Object.values(sackStatuses).length > 0 && Object.values(sackStatuses).every(status => status === "claimed") && (
                <TouchableOpacity
                    style={{ backgroundColor: '#AFE1AF', padding: 10, borderRadius: 20, marginTop: 20 }}
                    onPress={() => handleCompletePickUpStatus()}
                >
                    <Text style={{ color: 'black', textAlign: 'center' }}>All Claimed</Text>
                </TouchableOpacity>
            )}

            <FlatList
                data={pickup.sacks}
                keyExtractor={(item) => item._id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
                renderItem={({ item }) => {
                    const sackStatus = sackStatuses[item.sackId] || "Loading...";
                    const backgroundColor = sackStatus === "claimed" ? "#AFE1AF" : "gray";
                    return (
                        <View style={{
                            marginTop: 20,
                            marginRight: 10,
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor,
                            padding: 10,
                            borderRadius: 20
                        }}>
                            <Image
                                source={{ uri: item.images[0]?.url || "https://via.placeholder.com/150" }}
                                style={styles.stallImage}
                            />
                            <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 20 }}>
                                <Text style={{ color: 'black', fontSize: 10 }}>Stall# {item.stallNumber}</Text>
                                <Text style={{ color: 'black', fontSize: 10 }}>Weight: {item.kilo} KG</Text>
                                <Text style={{ color: 'black', fontSize: 10 }}>Status: {sackStatus}</Text>
                            </View>
                        </View>
                    );
                }}
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
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
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
});