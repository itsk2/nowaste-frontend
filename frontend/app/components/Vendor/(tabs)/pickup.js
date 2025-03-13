import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Pickup = () => {
    const { user } = useSelector((state) => state.auth);
    const sellerId = user.user._id;
    const [mySack, setMySacks] = useState([]);
    const [sellers, setSellers] = useState({});
    const fetchMySacks = async () => {
        try {
            const response = await axios.get(`${baseURL}/sack/stall-pickup-sacks/${sellerId}`);
            const pickUpSacks = response.data;

            const filteredSacks = pickUpSacks.map((pickup) => {
                const sellerSacks = pickup.sacks.filter((sack) => sack.seller === sellerId);

                const totalKilo = sellerSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);

                return {
                    ...pickup,
                    sacks: sellerSacks,
                    totalKilo: totalKilo.toString(),
                };
            }).filter((pickup) => pickup.sacks.length > 0);

            setMySacks(filteredSacks);
        } catch (error) {
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (sellerId) {
                fetchMySacks();

                const interval = setInterval(() => {
                    fetchMySacks();
                }, 3000);

                return () => clearInterval(interval);
            }
        }, [sellerId])
    );
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={styles.header}>Waste Request :</Text>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={mySack}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: "/components/Vendor/components/Pickup/seePickUp",
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
                                                source={require('../../../../assets/newtaytay.jpg')}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                            <Text style={styles.infoText}>
                                                <MaterialCommunityIcons name="sack" size={18} color="white" />{" "}
                                                {item.sacks.length}
                                            </Text>
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
        backgroundColor: '#4CAF50'
    },
    header: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
        color: 'white'
    },
    listContainer: {
        backgroundColor: '#E5E5E5',
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