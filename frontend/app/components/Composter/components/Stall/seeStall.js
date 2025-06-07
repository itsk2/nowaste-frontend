import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Modal, Alert, SafeAreaView } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import baseURL from '../../../../../assets/common/baseURL';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SeeStall = () => {
    const { stall } = useLocalSearchParams();
    const stallData = stall ? JSON.parse(stall) : {};
    // console.log(stallData, 'StallData')
    const sellerId = stallData?.user || []
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id
    const [showModal, setShowModal] = useState(false);
    const [sackData, setStoreSacks] = useState([]);
    const [optimalSchedule, setOptimalSchedule] = useState([]);
    const navigation = useNavigation();
    const router = useRouter();

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${sellerId}`);

            const now = new Date();
            const filteredSacks = data.sacks.filter(sack => {
                const spoilageDate = new Date(sack.dbSpoil);
                const daysPast = (now - spoilageDate) / (1000 * 60 * 60 * 24);

                return sack.status === "spoiled" && daysPast < 3;
            });

            setStoreSacks(filteredSacks);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    // console.log(sackData,'SackDAta')

    const fetchPredictedWaste = async () => {
        try {
            const optimalSchedule = await axios.get(`${baseURL}/ml/optimal-collection-schedule`);
            setOptimalSchedule(optimalSchedule.data);
        } catch (error) {
            // console.error("Error fetching predicted waste data:", error);
        }
    };
    // console.log(stallData.stallNumber, 'StallData')

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchStoreSacks();
                fetchPredictedWaste();

                const interval = setInterval(() => {
                    fetchStoreSacks();
                    fetchPredictedWaste();
                }, 3000);

                return () => clearInterval(interval);
            }
        }, [userId])
    );

    const handleAddtoSack = async (item) => {
        try {
            const { data } = await axios.post(`${baseURL}/sack/add-to-sack/${userId}`, item);
            setShowModal(true);

            setTimeout(() => {
                setShowModal(false);
                navigation.goBack();
            }, 1500);
        } catch (error) {
            // console.error("Error Adding to Sack:", error.response?.data || error.message);
            Alert.alert("Cannot Proceed", error.response?.data?.message);
        }
    };

    const processChartData = () => {
        if (!optimalSchedule || optimalSchedule.length === 0 || !stallData?.stallNumber) return {};

        const filteredData = optimalSchedule
            .filter(item => item.stallNumber === stallData.stallNumber)
            .map(item => ({
                value: parseFloat(item.predicted_kilos) || 0,
                label: new Date(new Date(item.date).getTime() - 24 * 60 * 60 * 1000)
                    .toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            }));

        return { [stallData.stallNumber]: filteredData };
    };

    const chartData = processChartData();
    const colors = ['#FF5733', '#33FF57', '#3357FF'];

    const getPeakDate = () => {
        const stallChartData = chartData[stallData.stallNumber] || [];

        if (stallChartData.length === 0) return "No Data";

        const peakEntry = stallChartData.reduce((max, entry) =>
            entry.value > max.value ? entry : max, { value: 0 }
        );

        return peakEntry.label;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greeting}>See</Text>
                    <Text style={styles.name}>Stall Description</Text>
                </View>
                <View style={styles.iconGroup}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('components/Composter/components/MySack/mySack')}
                    >
                        <Entypo name="shopping-cart" size={18} color="#2BA84A" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('components/Composter/components/Chat/Chats')}
                    >
                        <MaterialIcons name="chat-bubble-outline" size={18} color="#2BA84A" />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                ListHeaderComponent={
                    <View style={styles.container}>
                        <View style={{ width: "100%", padding: 5, borderWidth: 2, alignSelf: 'center', marginBottom: 15 }}>
                            <View style={styles.legendContainer}>
                                <Text style={styles.text}>📅 Peak Collection: {getPeakDate()}</Text>
                            </View>
                        </View>
                        {stallData?.stallImage?.url && (
                            <Image
                                source={{ uri: stallData.stallImage.url }}
                                style={{ width: '100%', height: 180, borderRadius: 15, marginBottom: 10 }}
                            />
                        )}
                        <View style={{ backgroundColor: '#295F39', padding: 15, borderRadius: 12, width: '100%', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>{stallData?.stallName}</Text>
                            <Text style={{ fontSize: 14, color: '#C8E6C9' }}>{stallData?.stallDescription}</Text>
                            <Text style={{ fontSize: 14, color: '#C8E6C9' }}>📍 {stallData?.stallAddress}</Text>
                            <Text style={{ fontSize: 14, color: '#C8E6C9' }}>🔢 Stall #{stallData?.stallNumber}</Text>
                        </View>
                    </View>
                }
                data={sackData}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.images?.[0]?.url }} style={{ width: 70, height: 70, borderRadius: 50 }} />
                        <View style={{ backgroundColor: '#1E3D29', borderRadius: 12, padding: 15, flex: 1, marginLeft: 10 }}>
                            <Text style={styles.cardTitle}>{item.description}</Text>
                            <Text style={styles.cardText}>{item.location}</Text>
                            <Text style={styles.cardText}>kg: {item.kilo}</Text>
                            <Text style={styles.cardText}>📅 Posted: {new Date(item.createdAt).toLocaleDateString("en-US")}</Text>
                            <Text style={styles.cardText}>🗓 Spoilage Date: {new Date(item.dbSpoil).toLocaleDateString("en-US")}</Text>
                            <Text style={styles.statusBadge}>Available</Text>
                            {user.user.role !== 'admin' && (
                                <TouchableOpacity style={styles.addButton} onPress={() => handleAddtoSack(item)}>
                                    <Text style={styles.addButtonText}>Add to Sack</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={styles.emptyText}>No sacks available</Text>
                        <Image
                            source={require('../../../../../assets/no-sack-removebg-preview.png')}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                            resizeMode="contain"
                        />
                    </View>
                }
            />
            <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalCard}>
                        <View style={styles.checkmarkCircle}>
                            <Text style={styles.checkmark}>✓</Text>
                        </View>
                        <Text style={styles.modalTitle}>Now Added To Your Sack!!</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SeeStall;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#E9FDF0',
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
    container: {
        padding: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 12,
        color: '#C8E6C9',
        marginBottom: 3,
    },
    statusBadge: {
        backgroundColor: '#0F0',
        color: '#000',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        fontWeight: '600',
        fontSize: 12,
        marginTop: 8,
    },
    addButton: {
        backgroundColor: '#0F0',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    addButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    noDataText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#888',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: 280,
        backgroundColor: '#A5D6A7',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    checkmarkCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkmark: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: '#689F38',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});