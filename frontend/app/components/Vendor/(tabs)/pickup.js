import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import { router, useFocusEffect } from 'expo-router';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

const Pickup = () => {
    const { user } = useSelector((state) => state.auth);
    const sellerId = user.user._id;
    const [mySack, setMySacks] = useState([]);

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
            // console.error(error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (sellerId) {
                fetchMySacks();
                const interval = setInterval(() => fetchMySacks(), 10000);
                return () => clearInterval(interval);
            }
        }, [sellerId])
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greeting}>My</Text>
                    <Text style={styles.name}>Pickup</Text>
                </View>
                <View style={styles.iconGroup}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('components/Vendor/components/Notification/notification')}
                    >
                        <AntDesign name="notification" size={18} color="2BA84A" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={mySack}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/components/Vendor/components/Pickup/seePickUp",
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
                                                source={require('../../../../assets/newtaytay.jpg')}
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
                                        <Text style={styles.infoText}>{item.sacks.length}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.detailsButton}
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
                    )}
                />
            </View>
        </View>
    );
};

export default Pickup;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3',
    },
    header: {
        alignItems: "center",
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
        backgroundColor: '#E8F5E9',
    },
    listContainer: {
        borderRadius: 15,
        padding: 10,
        marginBottom: 120,
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
        paddingVertical: 4,
        borderRadius: 12,
        textTransform: 'capitalize',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    imageContainer: {
        marginRight: 10,
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: '#ccc',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 57,
        borderRadius: 10,
        marginBottom: 5,
    },
    detailsSection: {
        flex: 1,
    },
    pickupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    secondaryText: {
        fontSize: 12,
        color: '#ccc',
    },
    timestamp: {
        fontSize: 12,
        color: 'white',
        marginTop: 5,
    },
    kiloSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
    },
    infoText: {
        fontSize: 14,
        color: 'white',
        marginTop: 5,
    },
    detailsButton: {
        marginTop: 12,
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
});