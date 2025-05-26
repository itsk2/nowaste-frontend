import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import baseURL from '../../assets/common/baseURL';
import { FontAwesome } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Header from '../components/Header';

const Pickup = () => {
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id;
    const [mySack, setMySacks] = useState([]);
    const [sellers, setSellers] = useState({});

    const fetchMySacks = async () => {
        try {
            const response = await axios.get(`${baseURL}/sack/get-pickup-sacks/${userId}`);
            const pickUpSacks = response.data.pickUpSacks;

            if (!Array.isArray(pickUpSacks)) {
                console.error("pickUpSacks is not an array:", pickUpSacks);
                return;
            }

            const now = new Date();
            const nowUTC8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
            console.log(pickUpSacks, 'Sacks');

            for (const sack of pickUpSacks) {
                const pickupTimestamp = new Date(sack.pickupTimestamp);

                // Check status and time
                if (
                    ['pending', 'pickup'].includes(sack.status) &&
                    pickupTimestamp.getTime() <= nowUTC8.getTime()
                ) {
                    const sackIds = sack.sacks.map(s => s.sackId);

                    await axios.delete(`${baseURL}/sack/delete-pickuped-sack/${sack._id}`, {
                        data: { sackIds }
                    });

                    Alert.alert(
                        "You didn't pick up the stated sack/s",
                        "It will now again be redistributed.",
                        [{ text: "OK" }]
                    );
                }
            }

            setMySacks(pickUpSacks);
        } catch (error) {
            console.error("Error fetching sacks:", error.response?.data || error.message);
        }
    };

    const fetchSackSellers = async () => {
        try {
            const sellerIds = [...new Set(mySack.flatMap(item => item.sacks.map(sack => sack.seller)))];
            const sellerData = {};
            await Promise.all(
                sellerIds.map(async (sellerId) => {
                    if (!sellers[sellerId]) {
                        const { data } = await axios.get(`${baseURL}/get-user/${sellerId}`);
                        sellerData[sellerId] = data.user;
                    }
                })
            );
            setSellers((prevSellers) => ({ ...prevSellers, ...sellerData }));
        } catch (error) {
            console.error("Error fetching sellers:", error);
        }
    };
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchMySacks();
                const interval = setInterval(() => {
                    fetchMySacks();
                }, 3000);
                return () => clearInterval(interval);
            }
        }, [userId])
    );
    useEffect(() => {
        if (mySack.length > 0) {
            fetchSackSellers();
        }
    }, [mySack]);
    return (
        <View style={styles.container}>
            <Header name={'User'}/>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.header}>Pickup Waste</Text>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={mySack}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: "/components/User/components/Pickup/seePickUp",
                                    params: { pickupData: JSON.stringify(item) },
                                })}
                            >
                                <View style={styles.card}>
                                    <View style={styles.row}>
                                        <View style={styles.leftSection}>
                                            {item.status !== "completed" && (
                                                <Text style={styles.pickupText}>Pickup {"\n"} No: {index + 1}</Text>
                                            )}
                                            <MaterialCommunityIcons name="car-lifted-pickup" size={90} color='white' />
                                            <Text style={styles.infoText}>Total Kilo: {item.totalKilo}</Text>
                                        </View>
                                        <View style={styles.middleSection}>
                                            <FontAwesome6 name="route" size={40} color="white" />
                                            <Text style={styles.locationText}>Taytay Rizal,{"\n"}New Market</Text>
                                        </View>
                                        <View style={styles.rightSection}>
                                            <Image
                                                source={require('../../assets/newtaytay.jpg')}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                            <Text style={styles.infoText}>
                                                <MaterialCommunityIcons name="sack" size={18} color="white" />{" "}
                                                {item.sacks.length}
                                            </Text>
                                            <Text style={styles.statusText}>Status: {item.status}</Text>
                                            {item.status !== "completed" && (
                                                <Text style={styles.timestamp}>
                                                    <MaterialCommunityIcons name="clock-remove" size={18} color="white" />{" "}
                                                    {new Date(new Date(item.pickupTimestamp).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}{"\n"}
                                                    {new Date(item.pickupTimestamp).toLocaleTimeString("en-US", {
                                                        timeZone: "UTC",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
};

export default Pickup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        paddingHorizontal: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Optional dark overlay for readability
    },
    header: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
        color: 'white'
    },
    listContainer: {
        borderRadius: 15,
        padding: 10,
        marginTop: 10,
        marginBottom: 90,
    },
    card: {
        backgroundColor: '#2a2e35',
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // For Android shadow
    },
    pickupText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        backgroundColor: '#4CAF50',
        padding: 5,
        borderRadius: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flex: 1,
        alignItems: 'center',
    },
    middleSection: {
        flex: 1,
        alignItems: 'center',
    },
    rightSection: {
        flex: 1,
        alignItems: 'center',
    },
    locationText: {
        fontSize: 12,
        color: 'white',
        textAlign: 'center',
        marginTop: 10,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginBottom: 5,
    },
    infoText: {
        fontSize: 14,
        color: 'white',
        marginTop: 5,
    },
    statusText: {
        fontSize: 14,
        color: '#f39c12',
        fontWeight: 'bold',
        marginTop: 5,
    },
    timestamp: {
        fontSize: 12,
        color: 'white',
        textAlign: 'center',
        marginTop: 5,
    },
});