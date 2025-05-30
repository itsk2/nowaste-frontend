import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, StatusBar, Alert, SafeAreaView, Modal } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import baseURL from '../../../../../assets/common/baseURL';
import { useFocusEffect } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SeeStall = () => {
    const { stall } = useLocalSearchParams();
    const stallData = stall ? JSON.parse(stall) : {};
    const sellerId = stallData?.user || [];
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id;
    const [sackData, setStoreSacks] = useState([]);
    const [optimalSchedule, setOptimalSchedule] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigation = useNavigation();

    const fetchStoreSacks = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${sellerId}`);
            const filteredSacks = data.sacks.filter(sack => sack.status === "posted");
            setStoreSacks(filteredSacks);
        } catch (error) {
            console.error("Error fetching sacks:", error);
        }
    };

    const fetchPredictedWaste = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/ml/optimal-collection-schedule`);
            setOptimalSchedule(data);
        } catch (error) {
            console.error("Error fetching predicted waste data:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchStoreSacks();
                fetchPredictedWaste();
                const interval = setInterval(() => {
                    fetchStoreSacks();
                    fetchPredictedWaste();
                }, 5000);
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
            }, 2000);
        } catch (error) {
            Alert.alert("Cannot Proceed", error.response?.data?.message);
        }
    };

    const processChartData = () => {
        if (!optimalSchedule.length || !stallData?.stallNumber) return {};
        const filteredData = optimalSchedule
            .filter(item => item.stallNumber === stallData.stallNumber)
            .map(item => ({
                value: parseFloat(item.predicted_kilos) || 0,
                label: new Date(new Date(item.date).getTime() - 86400000).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
            }));
        return { [stallData.stallNumber]: filteredData };
    };

    const chartData = processChartData();

    const getPeakDate = () => {
        const stallChartData = chartData[stallData.stallNumber] || [];
        if (!stallChartData.length) return "No Data";
        const peakEntry = stallChartData.reduce((max, entry) => entry.value > max.value ? entry : max, { value: 0 });
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
                        onPress={() => router.push('components/User/components/MySack/mySack')}
                    >
                        <Entypo name="shopping-cart" size={18} color="#2BA84A" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('components/User/components/Chat/Chats')}
                    >
                        <MaterialIcons name="chat-bubble-outline" size={18} color="#2BA84A" />
                    </TouchableOpacity>
                </View>
            </View>
            <FlatList
                ListHeaderComponent={
                    <View style={styles.container}>
                        <Text style={styles.chartTitle}>Predicted Waste Collection Schedule</Text>
                        <View style={{ marginTop: 20, width: "100%", padding: 5, borderWidth: 2, alignSelf: 'center', marginBottom: 15 }}>
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
                ListEmptyComponent={<Text style={styles.noDataText}>No sacks available</Text>}
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
                        <TouchableOpacity
                            onPress={() => {
                                setShowModal(false);
                                navigation.goBack();
                            }}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>Proceed</Text>
                        </TouchableOpacity>
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
        alignItems: 'center',
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