import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    Modal,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { inputRecordTrack } from "../(services)/api/Users/inputRecordTrack";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import baseURL from "../../assets/common/baseURL";
import axios from "axios";
import { LineChart } from 'react-native-gifted-charts';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from "@expo/vector-icons/Ionicons";

export default function WeightProgressForm() {
    const navigation = useNavigation();
    const user = useSelector((state) => state.auth.user);
    const userId = user.user._id;
    const [image, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [records, setRecords] = useState([]);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [latestWeight, setLatestWeight] = useState(0);
    const router = useRouter();

    const openImagePicker = async (setFieldValue) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
            setFieldValue("image", result.assets[0].uri);
        }
    };

    const fetchRecord = async () => {
        try {
            const res = await axios.get(`${baseURL}/track/get-records/${userId}`);
            setRecords(res.data.records);
        } catch (error) {
            // console.error("Error fetching records data:", error);
        }
    };

    // console.log(user?.user?._id)
    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchRecord();
                const interval = setInterval(() => {
                    fetchRecord();
                }, 3000);
                return () => clearInterval(interval);
            }
        }, [userId])
    );

    const getRecommendation = (weight) => {
        const feedingChart = [
            {
                minWeight: 60,
                maxWeight: 80,
                data: {
                    'Normal': {
                        commercial: '2.5–3.0 kg/day',
                        organic: '3.5–4.0 kg/day (high-quality forages + grains)',
                        mixed: '1.5 kg C + 2.0 kg O',
                    },
                    'Losing weight': {
                        commercial: '3.5–4.0 kg/day (high energy/grower type)',
                        organic: '5.0+ kg/day (include protein-rich like legumes)',
                        mixed: '2.0 kg C + 3.0 kg O',
                    },
                    'Gaining too much weight': {
                        commercial: '2.0 kg/day (low-energy finisher)',
                        organic: '3.0 kg/day (high fiber: banana stalks, squash)',
                        mixed: '1.0 kg C + 2.0 kg O',
                    },
                    'Sick': {
                        commercial: '2.0–2.5 kg/day in small meals (mash + water)',
                        organic: '1.5–2.0 kg/day (boiled root crops, greens)',
                        mixed: '1.2 kg C + 1.5 kg O',
                    },
                },
            },
            {
                minWeight: 80,
                maxWeight: 100,
                data: {
                    'Normal': {
                        commercial: '3.0–3.5 kg/day',
                        organic: '4.5–5.0 kg/day',
                        mixed: '2.0 kg C + 2.5 kg O',
                    },
                    'Losing weight': {
                        commercial: '4.0+ kg/day, high energy/protein formula',
                        organic: '6.0 kg/day, add ground corn + moringa',
                        mixed: '2.5 kg C + 3.5 kg O',
                    },
                    'Gaining too much weight': {
                        commercial: '2.5 kg/day (adjust to slow gain)',
                        organic: '3.5 kg/day (more fiber, fewer carbs)',
                        mixed: '1.2 kg C + 2.0 kg O',
                    },
                    'Sick': {
                        commercial: '2.0–2.5 kg/day, easy-to-digest mash',
                        organic: '2.0–2.5 kg/day (soft cooked organics)',
                        mixed: '1.0 kg C + 1.5 kg O',
                    },
                },
            },
            {
                minWeight: 100,
                maxWeight: 130,
                data: {
                    'Normal': {
                        commercial: '3.5–4.0 kg/day',
                        organic: '5.0–6.0 kg/day',
                        mixed: '2.5 kg C + 3.0 kg O',
                    },
                    'Losing weight': {
                        commercial: '4.5–5.0 kg/day, rich in fat & protein',
                        organic: '6.5–7.0 kg/day, with legume leaves, corn, soy',
                        mixed: '3.0 kg C + 4.0 kg O',
                    },
                    'Gaining too much weight': {
                        commercial: '2.5–3.0 kg/day, low-energy commercial',
                        organic: '4.0 kg/day (low-carb, high-fiber feed)',
                        mixed: '1.0 kg C + 3.0 kg O',
                    },
                    'Sick': {
                        commercial: '2.5–3.0 kg/day in mash form',
                        organic: '2.0–3.0 kg/day, with soft organics like camote',
                        mixed: '1.5 kg C + 1.5 kg O',
                    },
                },
            },
        ];

        const category = feedingChart.find(
            (range) => weight >= range.minWeight && weight <= range.maxWeight
        );

        if (!category) {
            return {
                message: 'No recommendation available for this weight.',
                data: {},
            };
        }

        return {
            message: `Recommendations for pigs weighing ${weight} kg`,
            data: category.data,
        };
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greeting}>Pig Weight</Text>
                    <Text style={styles.name}>Tracker</Text>
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

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('components/User/components/Notification/notification')}
                    >
                        <Ionicons name="notifications-sharp" size={24} color="#2BA84A" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* Track Button */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center', borderWidth: 2, padding: 6, borderRadius: 20, borderColor: '#eb6794', backgroundColor: '#2F4F39' }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }}> Track {'\n'} Records</Text>
                <MaterialCommunityIcons name="pig-variant" size={80} color="#eb6794" />

                <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={{ color: 'white' }}>Record</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 20, backgroundColor: '#2F4F39', padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderColor: '#eb6794', borderWidth: 4 }}>
                {records.map((record, index) => (
                    <TouchableOpacity
                        key={record._id}
                        style={styles.recordItem}
                        onPress={() => setSelectedRecord(record)}
                    >
                        <MaterialCommunityIcons name="pig-variant" size={24} color="green" />
                        <Text style={{ marginHorizontal: 5 }}>:</Text>
                        {record.track[0]?.image[0]?.url ? (
                            <Image
                                source={{ uri: record.track[0].image[0].url }}
                                style={styles.recordImage}
                            />
                        ) : null}
                        < View style={{ flex: 1 }}>
                            <Text style={styles.recordPigName}>{record.pigName}</Text>
                            <Text style={styles.recordNotice}>{record.notice}</Text>
                        </View>
                    </TouchableOpacity >
                ))
                }
            </ScrollView >

            <Modal
                visible={!!selectedRecord}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setSelectedRecord(null);
                    setRecommendation(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: "bold",
                                    marginBottom: 10,
                                    marginTop: 27
                                }}>
                                    <MaterialCommunityIcons name="pig-variant" size={24} color="green" /> : {selectedRecord?.pigName} - Records</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedRecord(null);
                                        setRecommendation(null);
                                    }}
                                    style={styles.closeButton}>
                                    <Text style={{ color: "#fff" }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'green',
                                    padding: 10,
                                    borderRadius: 8,
                                    marginVertical: 10,
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    // Toggle: if recommendation is shown, hide it
                                    if (recommendation) {
                                        setRecommendation(null);
                                    } else {
                                        const latestTrack = selectedRecord?.track?.[selectedRecord.track.length - 1];
                                        if (latestTrack?.weight) {
                                            const result = getRecommendation(latestTrack.weight);
                                            setLatestWeight(latestTrack?.weight);
                                            setRecommendation(result);
                                        }
                                    }
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    {recommendation ? 'Hide Feeding Recommendation' : 'Get Feeding Recommendation'}
                                </Text>
                            </TouchableOpacity>

                            {/* Recommendation */}
                            {recommendation && (
                                <View
                                    style={{
                                        backgroundColor: "#f0f0f0",
                                        padding: 15,
                                        borderRadius: 10,
                                        marginTop: 20,
                                    }}
                                >
                                    <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}>
                                        🐷 Feeding Guide for {selectedRecord.pigName} - {latestWeight} Kilograms
                                    </Text>

                                    {Object.entries(recommendation.data).map(([situation, feeds]) => (
                                        <View
                                            key={situation}
                                            style={{
                                                marginBottom: 12,
                                                padding: 10,
                                                backgroundColor: "#fff",
                                                borderRadius: 8,
                                                shadowColor: "#000",
                                                shadowOpacity: 0.1,
                                                shadowRadius: 4,
                                            }}
                                        >
                                            <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                                                {situation}
                                            </Text>
                                            <Text>Commercial Feed: {feeds.commercial}</Text>
                                            <Text>Organic Feed: {feeds.organic}</Text>
                                            <Text>Mixed Feed: {feeds.mixed}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* 👇 Chart Section */}
                            {selectedRecord?.track && selectedRecord.track.length > 0 && (
                                <>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Progress Chart</Text>
                                    <LineChart
                                        data={selectedRecord.track.map((item, index) => ({
                                            value: item.weight,
                                            label: `Day ${index + 1}`,
                                            dataPointText: `${item.weight}kg `,
                                        }))}
                                        spacing={40}
                                        dataPointsHeight={6}
                                        dataPointsWidth={6}
                                        color="#007bff"
                                        thickness={2}
                                        hideRules
                                        yAxisTextStyle={{ color: '#000' }}
                                        xAxisLabelTextStyle={{ color: '#000' }}
                                        noOfSections={4}
                                        isAnimated
                                        animateOnDataChange
                                    />
                                </>
                            )}

                            {/* 👇 Track Detail Cards */}
                            {selectedRecord?.track?.map((trackItem, idx) => (
                                <View key={idx} style={styles.recordItem}>
                                    <Text style={{
                                        fontSize: 16,
                                        fontWeight: "bold",
                                        marginRight: 7
                                    }}>
                                        <MaterialCommunityIcons name="pig-variant" size={24} color="green" />:
                                        {"\n"} {idx + 1}</Text>
                                    {trackItem.image?.map((img, i) => (
                                        <Image
                                            key={i}
                                            source={{ uri: img.url }}
                                            style={styles.recordImage}
                                        />
                                    ))}
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text>Weight: {trackItem.weight} kg</Text>
                                        <Text>Feed: {trackItem.feed}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal Form */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Formik
                                initialValues={{ notice: "", kilo: "", pigName: "", feed: "" }}
                                onSubmit={async (values) => {
                                    setModalVisible(false);
                                    try {
                                        const response = await inputRecordTrack({
                                            ...values,
                                            image,
                                            userId
                                        });
                                    } catch (error) {
                                        // console.error('Registration failed:', error.response?.data?.message || error.message);
                                        Alert.alert(
                                            "Registration Failed",
                                            error.response?.data?.message || "An error occurred during registration. Please try again.",
                                            [
                                                {
                                                    text: "OK",
                                                },
                                            ]
                                        );
                                    }
                                }}
                            >
                                {({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    values,
                                    setFieldValue,
                                }) => (
                                    <View>
                                        {/* Image Upload */}
                                        <TouchableOpacity
                                            style={styles.imageUploadContainer}
                                            onPress={() => openImagePicker(setFieldValue)}
                                        >
                                            {image ? (
                                                <Image
                                                    source={{ uri: image }}
                                                    style={styles.uploadedImage}
                                                />
                                            ) : (
                                                <Text style={styles.uploadText}>Tap to upload image</Text>
                                            )}
                                        </TouchableOpacity>

                                        {/* Pig Name Input */}
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter Pig Name"
                                            onChangeText={handleChange("pigName")}
                                            onBlur={handleBlur("pigName")}
                                            value={values.pigName}
                                        />

                                        {/* Notice Input */}
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Notice something?"
                                            onChangeText={handleChange("notice")}
                                            onBlur={handleBlur("notice")}
                                            value={values.notice}
                                        />

                                        {/* Kilo Input */}
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter weight (kg)"
                                            keyboardType="numeric"
                                            onChangeText={handleChange("kilo")}
                                            onBlur={handleBlur("kilo")}
                                            value={values.kilo}
                                        />
                                        <View
                                            style={{
                                                backgroundColor: "#f9f9f9",
                                                borderRadius: 8,
                                                height: 50,
                                                borderColor: "#ccc",
                                                borderWidth: 1,
                                            }}
                                        >
                                            <Picker
                                                style={{
                                                    height: 48,
                                                    width: "100%",
                                                }}
                                                selectedValue={values.feed}
                                                onValueChange={(itemValue) => {
                                                    handleChange("feed")(itemValue);
                                                    handleBlur("feed");
                                                }}
                                            >
                                                <Picker.Item label="Commercial" value="commercial" color='gray' />
                                                <Picker.Item label="Organic" value="organic" color='gray' />
                                                <Picker.Item label="Mixed" value="mixed" color='gray' />
                                            </Picker>
                                        </View>

                                        {/* Submit Button */}
                                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                            <Text style={styles.buttonText}>Submit</Text>
                                        </TouchableOpacity>

                                        {/* Close Button */}
                                        <TouchableOpacity
                                            style={[styles.submitButton, { backgroundColor: "gray" }]}
                                            onPress={() => setModalVisible(false)}
                                        >
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Formik>
                        </ScrollView>
                    </View>
                </View>
            </Modal >
        </View >
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3',
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
    trackButton: {
        backgroundColor: "#6680ff",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        maxHeight: "80%",
    },
    form: {
        marginTop: 10,
    },
    imageUploadContainer: {
        height: 200,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    uploadedImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    uploadText: {
        color: "#888",
    },
    input: {
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    submitButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    recordItem: {
        flexDirection: "row",
        backgroundColor: "#eb6794",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
    },
    recordImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    recordPigName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    recordNotice: {
        fontSize: 14,
        color: "#555",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    trackItem: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
    },
    trackImage: {
        width: '70%',
        height: 70,
        resizeMode: 'cover',
        marginTop: 10,
        borderRadius: 10,
    },
    closeButton: {
        backgroundColor: "#2196F3",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },
});
