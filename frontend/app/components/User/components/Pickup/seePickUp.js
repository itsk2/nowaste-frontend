import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSelector } from 'react-redux';
import { Modal, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import baseURL from '../../../../../assets/common/baseURL';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Foundation from '@expo/vector-icons/Foundation';
import { generateRoomId } from '../../../../../utils/generateRoom';
import { FontAwesome } from '@expo/vector-icons';
import Map from '../map';
import Header from '../../../Header';
import Footer from '../../../Footer';

const SeePickUp = () => {
    const { pickupData } = useLocalSearchParams();
    const pickup = pickupData ? JSON.parse(pickupData) : [];
    const [pickupStatus, setPickupStatus] = useState(pickup.status);
    const { user } = useSelector((state) => state.auth);
    const [sackStatuses, setSackStatuses] = useState({});
    const [sellers, setSellers] = useState({});
    const userId = user.user._id;
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);
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
                "Check the Maps For Navigation",
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

    const handleCompletePickUpStatus = () => {
        Alert.alert(
            "Unclaimed Sacks Will Be Reverted",
            "Any sacks that weren't claimed will be redistributed to their respective stalls.",
            [
                {
                    text: "Proceed",
                    onPress: async () => {
                        try {
                            const response = await axios.put(`${baseURL}/sack/complete-pickup/${pickup._id}`);
                            console.log("Pickup completed:", response.data);
                            navigation.goBack();
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

    const handleRatingSubmit = async () => {
        if (!rating || review.trim() === '') {
            return Alert.alert("Incomplete", "Please provide both a rating and review.");
        }

        try {
            const { data } = await axios.put(`${baseURL}/sack/rate-transaction/${pickup._id}`, {
                review,
                rating
            });

            setSubmitted(true);

            // Auto-close modal after 2.5 seconds
            setTimeout(() => {
                setIsRatingModalVisible(false);
                setSubmitted(false);
                setRating(0);
                setReview('');
            }, 2500);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            Alert.alert("Error", "Could not submit your feedback.");
        }
    };

    const uniqueSacks = pickup?.sacks?.filter((sack, index, self) => {
        const seller = sellers[sack.seller];

        if (!seller) return false;

        const stallId = seller.stall?.stallNumber?.toString();

        // Check if this stallNumber was already used
        return (
            self.findIndex(
                (s) => sellers[s.seller]?.stall?.stallNumber?.toString() === stallId
            ) === index
        );
    }) || [];
    const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
    useEffect(() => {
        if (pickupStatus === "completed" && !submitted) {
            setIsRatingModalVisible(true);
        }
    }, [pickupStatus, submitted]);
    const [isMapVisible, setIsMapVisible] = useState(false);

    return (
        <>
            <View style={styles.container}>
                <Header />
                <View style={styles.pickupCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {pickupStatus !== "completed" ? (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                                <TouchableOpacity
                                    onPress={handlePickupStatus}
                                    style={{ alignItems: 'center' }}
                                >
                                    <MaterialCommunityIcons name="car-lifted-pickup" size={35} color="white" />
                                    <Text style={{ color: 'white', marginTop: 5 }}>Pickup</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setIsMapVisible(true)}
                                    style={{ alignItems: 'center' }}
                                >
                                    <Foundation name="map" size={30} color="white" />
                                    <Text style={{ color: 'white', marginTop: 5 }}>Map</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Pickup Details</Text>
                        )}

                    </View>
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
                    )}
                />
                {pickupStatus !== "completed" && (
                    <TouchableOpacity
                        style={{ backgroundColor: '#AFE1AF', padding: 10, borderRadius: 20, marginTop: 20 }}
                        onPress={() => handleCompletePickUpStatus()}
                    >
                        <Text style={{ color: 'black', textAlign: 'center' }}>Done Pickup</Text>
                    </TouchableOpacity>
                )}

                <FlatList
                    data={uniqueSacks}
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
                {/* Map */}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={isMapVisible}
                    onRequestClose={() => setIsMapVisible(false)}
                >
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => setIsMapVisible(false)}
                            style={{ padding: 10, backgroundColor: '#333', alignItems: 'center' }}
                        >
                            <Text style={{ color: 'white' }}>Close Map</Text>
                        </TouchableOpacity>

                        {/* Remove this temporarily to confirm */}
                        <Map />

                        {/* Replace with hardcoded placeholder
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: 'black' }}>Map Placeholder</Text>
                        </View> */}
                    </View>
                </Modal>

                {/* Rating */}
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
                                            await handleRatingSubmit();
                                        }}
                                    >
                                        <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Submit Feedback</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
            <View>
                <Footer />
            </View>
        </>
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
});