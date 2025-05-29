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
            <Header name={'User'} />
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>My Pickup</Text>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={mySack}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: "/components/User/components/Pickup/seePickUp",
                                        params: { pickupData: JSON.stringify(item) },
                                    })
                                }
                            >
                                <View style={styles.pickupCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.pickupLabel}>Pickup #: {index + 1}</Text>
                                        <Text style={styles.statusPill}>{item.status}</Text>
                                    </View>

                                    <View style={styles.cardContent}>
                                        <View style={styles.imageContainer}>
                                            <View style={styles.imagePlaceholder}>
                                                <Image
                                                    source={require('../../assets/newtaytay.jpg')}
                                                    style={styles.image}
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.detailsSection}>
                                            <Text style={styles.pickupTitle}>New Taytay, Public Market</Text>
                                            <Text style={styles.secondaryText}>Stall #2</Text>
                                            <Text style={styles.secondaryText}>Location: Rizal Ave, Taytay, 1920 Metro Manila</Text>
                                            <Text style={styles.timestamp}>
                                                <MaterialCommunityIcons name="clock-remove" size={18} color="white" />{" "}
                                                {new Date(new Date(item.pickupTimestamp).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })} : {new Date(item.pickupTimestamp).toLocaleTimeString("en-US", {
                                                    timeZone: "UTC",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </Text>
                                        </View>

                                        <View style={styles.kiloSection}>
                                            <MaterialCommunityIcons name="sack" size={18} color="white" />
                                            <Text style={styles.infoText}>
                                                {item.sacks.length}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.detailsButton}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/components/User/components/Pickup/seePickUp",
                                                params: { pickupData: JSON.stringify(item) },
                                            })
                                        }
                                    >
                                        <Text style={styles.detailsButtonText}>View details</Text>
                                    </TouchableOpacity>
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
    },
    leftSection: {
        flex: 1,
        alignItems: 'center',
    },
    middleSection: {
        flex: 1,
        marginLeft: 15,
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
        width: 50,
        height: 57,
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
        marginLeft: 45
    },
    timestamp: {
        fontSize: 12,
        color: 'white',
        marginTop: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2E4237',
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    pickupCard: {
        backgroundColor: '#2F4F39',
        borderRadius: 16,
        marginVertical: 10,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    pickupLabel: {
        color: '#E0E0E0',
        fontWeight: '600',
        fontSize: 14,
    },

    statusPill: {
        backgroundColor: '#F4A261',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
        overflow: 'hidden',
        textTransform: 'capitalize',
    },

    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    imageContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    imagePlaceholder: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },

    detailsSection: {
        flex: 1,
    },

    pickupTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    secondaryText: {
        color: '#D0D0D0',
        fontSize: 12,
    },

    kiloSection: {
        alignItems: 'flex-end',
        paddingLeft: 10,
    },

    kiloText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: 'bold',
    },

    detailsButton: {
        backgroundColor: '#B6FF5B',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
        alignSelf: 'flex-end',
    },

    detailsButtonText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
        fontSize: 14,
    }
});