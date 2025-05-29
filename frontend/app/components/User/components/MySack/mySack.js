import {
    StyleSheet, Text, View, Image, FlatList, TouchableOpacity,
    ImageBackground, Alert, ScrollView
} from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import baseURL from '../../../../../assets/common/baseURL';
import axios from 'axios';
import { useFocusEffect, useNavigation } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Footer from '../../../Footer';

const MySack = () => {
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id;
    const navigation = useNavigation();
    const [mySack, setMySacks] = useState([]);

    const addToSackId = mySack.length > 0 ? mySack[0]._id : undefined;
    const totalKilos = mySack.reduce((sum, item) => {
        return sum + item.sacks.reduce((sackSum, sack) => sackSum + Number(sack.kilo || 0), 0);
    }, 0);

    const fetchMySacks = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/sack/get-my-sacks/${userId}`);
            const pendingSacks = data.mySack.filter(sack => sack.status === "pending");
            setMySacks(pendingSacks);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchMySacks();
            }
        }, [userId])
    );

    const handlePickUpSacks = async () => {
        try {
            await axios.post(`${baseURL}/sack/pick-up-sacks/${addToSackId}`, { mySack, totalKilos });
            Alert.alert("Pickup Confirmed", "Your sacks are ready for pickup!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error picking up sacks:", error);
        }
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.overlay}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>My Sacks</Text>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.headerButtonText}>Back to Available</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.totalCard}>
                        <MaterialCommunityIcons name="sack" size={40} color="#fff" />
                        <Text style={styles.totalWeight}>{totalKilos} kg</Text>
                        <Text style={styles.totalSubtext}>Combined weight</Text>
                    </View>

                    <FlatList
                        data={mySack}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>No sacks added.</Text>}
                        renderItem={({ item }) => item.sacks.map((sack, index) => (
                            <View key={index} style={styles.card}>
                                <Image source={{ uri: sack.images?.[0]?.url }} style={styles.cardImage} />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{sack.description}</Text>
                                    <Text style={styles.cardText}>Kilo: {sack.kilo}</Text>
                                    <Text style={styles.cardText}>Posted: {new Date(item.createdAt).toLocaleDateString()}</Text>
                                    <Text style={styles.cardText}>Spoils: {new Date(sack.dbSpoil).toLocaleDateString()}</Text>
                                </View>
                                <TouchableOpacity style={styles.removeBtn}>
                                    <FontAwesome name="trash" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    />

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.pickupButton} onPress={handlePickUpSacks}>
                            <Text style={styles.pickupText}>Pick up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View>
                <Footer />
            </View>
        </>
    );
};

export default MySack;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Optional dark overlay for readability
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    totalCard: {
        backgroundColor: '#1E3D29',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    totalWeight: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#C8E6C9',
        marginTop: 10,
    },
    totalSubtext: {
        fontSize: 14,
        color: '#A5D6A7',
        marginTop: 4,
    },
    list: {
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#2E4237',
        borderRadius: 15,
        marginBottom: 12,
        padding: 10,
        alignItems: 'center',
    },
    cardImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardText: {
        color: '#ddd',
        fontSize: 12,
        marginBottom: 2,
    },
    removeBtn: {
        padding: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        right: 15,
    },
    pickupButton: {
        backgroundColor: '#A2E45C',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    pickupText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1B1B1B',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'white',
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        paddingHorizontal: 15,
    },

    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2E4237',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
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

    headerButton: {
        backgroundColor: '#A2E45C',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },

    headerButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1B1B1B',
    },
});