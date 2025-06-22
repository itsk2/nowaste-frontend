import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../../assets/common/baseURL';
import Foundation from '@expo/vector-icons/Foundation';
import { generateRoomId } from '../../../../../utils/generateRoom';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome } from '@expo/vector-icons';
import Map from '../../../User/components/map';

const SeePickUp = () => {
    const { pickupData } = useLocalSearchParams();
    const pickup = pickupData ? JSON.parse(pickupData) : [];
    const [pickupStatus, setPickupStatus] = useState(pickup.status);
    const { user } = useSelector((state) => state.auth);
    const [sackStatuses, setSackStatuses] = useState({});
    const [sellers, setSellers] = useState({});
    const userId = user.user._id;
    const navigation = useNavigation()
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [completeModal, setCompleteModal] = useState(false);
    const [selectedSack, setSelectedSack] = useState(null);

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


    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchSackSellers();
                const interval = setInterval(() => {
                    fetchSackSellers();
                }, 1500);
                return () => clearInterval(interval);
            }
        }, [pickup.sacks])
    );

    const handlePickupStatus = async () => {
        try {
            const { data } = await axios.put(`${baseURL}/sack/pickup-sack-now/${pickup._id}`);
            setPickupStatus(data.status);
            setShowModal(true);

            setTimeout(() => {
                setShowModal(false);
                navigation.goBack();
            }, 2000);
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
    
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchAllSackStatuses();
                const interval = setInterval(() => {
                    fetchAllSackStatuses();
                }, 1500);
                return () => clearInterval(interval);
            }
        }, [pickup.sacks])
    );

    const handleCompletePickUpStatus = () => {
        Alert.alert(
            "Proceed Either all the sacks are claimed or not.",
            "But any sacks that weren't claimed will be redistributed to their respective stalls.",
            [
                {
                    text: "Proceed",
                    onPress: async () => {
                        try {
                            const response = await axios.put(`${baseURL}/sack/complete-pickup/${pickup._id}`);
                            setCompleteModal(true);

                            setTimeout(() => {
                                setCompleteModal(false);
                                navigation.goBack();
                            }, 2000);
                        } catch (error) {
                            console.error("Error completing pickup:", error);
                            Alert.alert("Error", "Failed to complete the pickup.");
                        }
                    }
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const handleRatingSubmit = async (selectedSackId) => {
        console.log(selectedSackId)
        try {
            const { data } = await axios.put(`${baseURL}/sack/rate-transaction/${selectedSackId}`, {
                review,
                rating
            });

            setSubmitted(true);

            setTimeout(() => {
                setIsRatingModalVisible(false);
                setSubmitted(false);
                setRating(0);
                setReview('');
                setSelectedSack(null);
            }, 2500);
        } catch (error) {
            console.error("Error submitting feedback:", error.message);
            Alert.alert("Error", "Could not submit your feedback.");
        }
    };

    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    console.log(pickup.sacks.filter(item => item.status !== "cancelled"), 'Log')

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={{
                        padding: 8,
                        borderRadius: 50,
                    }} onPress={() => navigation.goBack()}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', height: 90 }}>
                            <View style={{ marginRight: 10, flexDirection: 'row', }}>
                                <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
                                <View style={{ marginTop: 5, marginLeft: 10 }}>
                                    <Text style={styles.greeting}>Pickup <Text style={{ fontSize: 18, fontWeight: '500' }}>Information</Text></Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={pickup.sacks.filter(item => item.status !== "cancelled")}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={
                        <>
                            <View style={styles.pickupCard}>
                                <View style={styles.sackContainer}>
                                    <MaterialCommunityIcons name="sack" size={30} color="white" style={styles.sackImage} />
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
                                    {pickupStatus === "completed" && (
                                        <Text style={styles.text}>
                                            Picked Up Completed Date: {new Date(new Date(pickup.pickedUpDate).getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}{" "}
                                            {new Date(pickup.pickedUpDate).toLocaleTimeString("en-US", {
                                                timeZone: "UTC",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </Text>
                                    )}
                                </View>

                                <View style={{ height: 200, borderRadius: 16, overflow: 'hidden' }}>
                                    <Map />
                                </View>
                            </View>
                        </>
                    }
                    renderItem={({ item }) => {
                        const sackStatus = sackStatuses[item.sackId.toString()] || "Loading...";
                        const backgroundColor = sackStatus === "claimed" ? "#009E60" : "#2A4535";
                        return (
                            <View style={{ flexDirection: 'column' }}>
                                <View style={{
                                    backgroundColor,
                                    borderRadius: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 15,
                                    marginVertical: 8,
                                }}>
                                    <Image
                                        source={{ uri: sellers[item.seller]?.stall?.stallImage?.url || "https://via.placeholder.com/150" }}
                                        style={styles.stallImage}
                                    />

                                    <View style={styles.sackInfo}>
                                        <Text style={styles.textWhite}>Stall #: {item.stallNumber}</Text>
                                        <View style={{ backgroundColor: '#3D5A48', padding: 10 }}>
                                            <View style={{ backgroundColor: 'white', padding: 5, borderRadius: 5, marginBottom: 4 }}>
                                                <Text style={{
                                                    fontSize: 9,
                                                    color: 'black',
                                                    marginBottom: 3,
                                                }}>
                                                    Item #: {item._id}
                                                </Text>
                                                <Text style={{
                                                    fontSize: 9,
                                                    color: 'black',
                                                    marginBottom: 3,
                                                }}>
                                                    Description: {item.description}
                                                </Text>
                                            </View>
                                            <Text style={{
                                                fontSize: 15,
                                                color: 'white',
                                                marginBottom: 3,
                                                fontWeight: 'bold'
                                            }}>
                                                Seller: {sellers[item.seller]?.name || "Unknown"}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: 'white',
                                                marginBottom: 3,
                                                color: '#9EE6B8'
                                            }}>
                                                Location: {sellers[item.seller]?.stall?.stallAddress || "Unknown"}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: 'white',
                                                marginBottom: 3,
                                                color: '#9EE6B8'
                                            }}>
                                                {sellers[item.seller]?.stall?.status === "open" ? "Open: 🟢" : "Close: 🔴"}
                                            </Text>
                                        </View>
                                        {pickupStatus === "completed" && (
                                            <TouchableOpacity
                                                style={{ backgroundColor: '#AFE1AF', padding: 12, borderRadius: 10, width: '100%', height: 'auto' }}
                                                onPress={() => {
                                                    setSelectedSack(item);
                                                    setIsRatingModalVisible(true);
                                                }}
                                            >
                                                <Text style={{ textAlign: 'center', color: 'black', fontWeight: 'bold', fontSize: 12 }}>Submit a Review</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={{
                                            fontSize: 13,
                                            color: sackStatus === "pickup" ? "#9EE6B8" : "#FF5F1F",
                                            marginBottom: 3,
                                            marginLeft: 18,
                                        }}>{sackStatus}</Text>
                                        <Text style={{
                                            fontSize: 18,
                                            color: '#9EE6B8',
                                            marginBottom: 3,
                                            marginLeft: 18,
                                        }}>{item.kilo} kg.</Text>
                                        <TouchableOpacity
                                            style={styles.chatButton}
                                            onPress={() => {
                                                if (!userId || !sellers[item.seller]?._id) {
                                                    Alert.alert('Error', 'User or Seller ID missing');
                                                    return;
                                                }

                                                const roomId = generateRoomId(userId, sellers[item.seller]?._id);

                                                router.push({
                                                    pathname: '/components/User/components/Chat/ChatRoom',
                                                    params: {
                                                        roomId,
                                                        userId,
                                                        receiverId: sellers[item.seller]?._id,
                                                        receiverName: sellers[item.seller]?.name || 'Vendor',
                                                    },
                                                });
                                            }}
                                        >
                                            <FontAwesome name="comments" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )
                    }}
                    ListFooterComponent={
                        <>
                            {pickupStatus === "pending" && (
                                <TouchableOpacity
                                    style={{ backgroundColor: '#AFE1AF', padding: 10, borderRadius: 20, marginTop: 20, marginBottom: 30 }}
                                    onPress={handlePickupStatus}
                                >
                                    <Text style={{ color: 'black', textAlign: 'center' }}>Pickup Waste</Text>
                                </TouchableOpacity>
                            )}
                            {pickupStatus !== "pending" && pickupStatus !== "completed" && (
                                <TouchableOpacity
                                    style={{ backgroundColor: '#AFE1AF', padding: 10, borderRadius: 20, marginTop: 20, marginBottom: 30 }}
                                    onPress={() => handleCompletePickUpStatus()}
                                >
                                    <Text style={{ color: 'black', textAlign: 'center' }}>Done Pickup</Text>
                                </TouchableOpacity>
                            )}

                            {/* Rating Modal */}
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={isRatingModalVisible}
                                onRequestClose={() => setIsRatingModalVisible(false)}
                            >
                                <View style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                }}>
                                    <View style={{
                                        backgroundColor: "#3b3f47",
                                        padding: 20,
                                        borderRadius: 15,
                                        width: '85%',
                                        alignItems: 'center',
                                    }}>
                                        {/* Close Button */}
                                        <TouchableOpacity
                                            onPress={() => setIsRatingModalVisible(false)}
                                            style={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                zIndex: 1,
                                            }}
                                        >
                                            <Ionicons name="close" size={24} color="white" />
                                        </TouchableOpacity>

                                        {submitted ? (
                                            <>
                                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Thank you for your feedback!</Text>
                                                <Image
                                                    source={require('../../../../../assets/thank-you-banner.webp')} // Put your image in assets folder
                                                    style={{ width: 200, height: 200, resizeMode: 'contain' }}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Rate Your Pickup</Text>

                                                <Text style={{ color: 'white', marginBottom: 5 }}>Rating (1 to 5):</Text>
                                                <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <TouchableOpacity
                                                            key={num}
                                                            onPress={() => setRating(num)}
                                                            style={{ marginRight: 8 }}
                                                        >
                                                            <FontAwesome
                                                                name={num <= rating ? "star" : "star-o"}
                                                                size={30}
                                                                color={num <= rating ? "#FFD700" : "#ccc"}
                                                            />
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>

                                                <Text style={{ color: 'white', marginBottom: 5 }}>Review:</Text>
                                                <View style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: 10,
                                                    padding: 10,
                                                    marginBottom: 15,
                                                    width: '100%',
                                                }}>
                                                    <TextInput
                                                        placeholder="Write your feedback..."
                                                        placeholderTextColor="#aaa"
                                                        multiline
                                                        value={review}
                                                        onChangeText={setReview}
                                                        style={{ height: 80, color: 'black' }}
                                                    />
                                                </View>

                                                <TouchableOpacity
                                                    style={{ backgroundColor: '#AFE1AF', padding: 12, borderRadius: 10, width: '100%' }}
                                                    onPress={async () => {
                                                        await handleRatingSubmit(selectedSack.sackId);
                                                    }}
                                                >
                                                    <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Submit Feedback</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </Modal>
                            {/* Completion Modal */}
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
                                        <Text style={styles.modalTitle}>Pickup: Get Sacks Now!!</Text>
                                    </View>
                                </View>
                            </Modal>
                            {/* Completion Modal */}
                            <Modal
                                animationType="fade"
                                transparent={true}
                                visible={completeModal}
                                onRequestClose={() => setShowModal(false)}
                            >
                                <View style={styles.modalBackground}>
                                    <View style={styles.modalCard}>
                                        <View style={styles.checkmarkCircle}>
                                            <Text style={styles.checkmark}>✓</Text>
                                        </View>
                                        <Text style={styles.modalTitle}>Pickup Waste Completed!!</Text>
                                    </View>
                                </View>
                            </Modal>
                        </>
                    }
                />
            </View >
        </>
    );
};

export default SeePickUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingTop: Constants.statusBarHeight,
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
        color: 'black',
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
    },
    sackWeight: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    chatButton: {
        padding: 10,
        backgroundColor: '#2196F3',
        borderRadius: 8,
        marginLeft: 12,
    },
    chatButtonText: {
        marginLeft: 8,
        color: '#fff',
        fontWeight: '600',
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