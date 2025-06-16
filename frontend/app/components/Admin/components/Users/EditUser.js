import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, Button, Image, ScrollView, StyleSheet, Alert,
    TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import axios from 'axios';
import { Formik } from 'formik';
import baseURL from '../../../../../assets/common/baseURL';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditUser = () => {
    const { item } = useLocalSearchParams();
    const user = item ? JSON.parse(item) : null;
    const [showOpenTime, setShowOpenTime] = useState(false);
    const [showCloseTime, setShowCloseTime] = useState(false);
    const [openTime, setOpenTime] = useState(null);
    const [closeTime, setCloseTime] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [stallImage, setStallImage] = useState(null);
    const navigation = useNavigation();

    console.log(user._id, 'User')
    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const initialValues = {
        name: user?.name || '',
        email: user?.email || '',
        address: {
            lotNum: user?.address?.lotNum || '',
            street: user?.address?.street || '',
            baranggay: user?.address?.baranggay || '',
            city: user?.address?.city || ''
        },
        stall: {
            stallDescription: user?.stall?.stallDescription || '',
            stallAddress: user?.stall?.stallAddress || '',
            stallNumber: user?.stall?.stallNumber || '',
            openHours: user?.stall?.openHours || '',
            closeHours: user?.stall?.closeHours || '',
            stallImage: {
                public_id: user.stall?.stallImage?.public_id || "",
                url: user.stall?.stallImage?.url || ""
            }
        }
    };

    const pickAvatarImage = async () => {
        Alert.alert(
            "Select Image Source",
            "Choose an option",
            [
                {
                    text: "Camera",
                    onPress: async () => {
                        const permission = await ImagePicker.requestCameraPermissionsAsync();
                        if (permission.status !== "granted") {
                            Alert.alert("Permission Denied", "Camera access is required.");
                            return;
                        }

                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 1,
                        });

                        if (!result.canceled) {
                            setAvatar(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: "Gallery",
                    onPress: async () => {
                        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (permission.status !== "granted") {
                            Alert.alert("Permission Denied", "Gallery access is required.");
                            return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 1,
                        });

                        if (!result.canceled) {
                            setAvatar(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ],
            { cancelable: true }
        );
    };
    const pickStallImage = async () => {
        Alert.alert(
            "Select Image Source",
            "Choose an option",
            [
                {
                    text: "Camera",
                    onPress: async () => {
                        const permission = await ImagePicker.requestCameraPermissionsAsync();
                        if (permission.status !== "granted") {
                            Alert.alert("Permission Denied", "Camera access is required.");
                            return;
                        }

                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 1,
                        });

                        if (!result.canceled) {
                            setStallImage(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: "Gallery",
                    onPress: async () => {
                        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (permission.status !== "granted") {
                            Alert.alert("Permission Denied", "Gallery access is required.");
                            return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 1,
                        });

                        if (!result.canceled) {
                            setStallImage(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ],
            { cancelable: true }
        );
    };

    const handleSubmit = async (values) => {
        const data = new FormData();

        data.append("name", values.name);
        data.append("email", values.email);
        data.append("lotNum", values.address.lotNum);
        data.append("street", values.address.street);
        data.append("baranggay", values.address.baranggay);
        data.append("city", values.address.city);

        data.append("stallDescription", values.stall.stallDescription);
        data.append("stallAddress", values.stall.stallAddress);
        data.append("stallNumber", values.stall.stallNumber);
        data.append("openHours", values.stall.openHours);
        data.append("closeHours", values.stall.closeHours);

        if (avatar) {
            data.append("avatar", {
                uri: avatar,
                type: "image/jpeg",
                name: "avatar.jpg",
            });
        }

        if (stallImage) {
            data.append("stallImage", {
                uri: stallImage,
                type: "image/jpeg",
                name: "stall.jpg",
            });
        }

        for (let pair of data.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }


        try {
            await axios.put(`${baseURL}/update-user/${user._id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            Alert.alert('Success', 'User updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Update failed', error.message);
            console.log('Full error:', error);
            if (error.response) {
                console.log('Server responded:', error.response.data);
            }
            Alert.alert('Error', 'Failed to update user');
        }

    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Edit Vendor</Text>

            <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
                {({ values, handleChange, handleSubmit, setFieldValue }) => (
                    <>
                        <View style={styles.imageContainer}>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickAvatarImage}>
                                {avatar ? (
                                    <Image source={{ uri: avatar }} style={styles.roundImage} />
                                ) : (
                                    <>
                                        <Text style={styles.placeholderText}>No Avatar</Text>
                                        <Text style={styles.placeholderBellowText}>Select Avatar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={values.name}
                            onChangeText={handleChange('name')}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={values.email}
                            onChangeText={handleChange('email')}
                        />

                        <Text style={styles.subHeader}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Lot Number"
                            value={values.address.lotNum}
                            onChangeText={(text) => setFieldValue('address.lotNum', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Street"
                            value={values.address.street}
                            onChangeText={(text) => setFieldValue('address.street', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Baranggay"
                            value={values.address.baranggay}
                            onChangeText={(text) => setFieldValue('address.baranggay', text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            value={values.address.city}
                            onChangeText={(text) => setFieldValue('address.city', text)}
                        />
                        {user.role === 'vendor' && (
                            <>
                                <Text style={styles.subHeader}>Stall Info</Text>
                                <View style={styles.imageContainer}>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickStallImage}>
                                        {stallImage ? (
                                            <Image source={{ uri: stallImage }} style={styles.roundImage} />
                                        ) : (
                                            <>
                                                <Text style={styles.placeholderText}>No Image</Text>
                                                <Text style={styles.placeholderBellowText}>Select Stall Image</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Stall Description"
                                    value={values.stall.stallDescription}
                                    onChangeText={(text) => setFieldValue('stall.stallDescription', text)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Stall Address"
                                    value={values.stall.stallAddress}
                                    onChangeText={(text) => setFieldValue('stall.stallAddress', text)}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Stall Number"
                                    value={values.stall.stallNumber}
                                    onChangeText={(text) => setFieldValue('stall.stallNumber', text)}
                                />
                                {/* Opening & Closing Time Pickers */}
                                <View style={styles.timeContainer}>
                                    <TouchableOpacity style={styles.timeInput} onPress={() => setShowOpenTime(true)}>
                                        <Text style={styles.timeText}>
                                            {values.stall.openHours ? `Open: ${values.stall.openHours}` : 'Select Opening Time'}
                                        </Text>
                                    </TouchableOpacity>
                                    {showOpenTime && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowOpenTime(false);
                                                if (selectedDate) {
                                                    setOpenTime(selectedDate);
                                                    setFieldValue('stall.openHours', formatTime(selectedDate));
                                                }
                                            }}
                                        />
                                    )}
                                    <TouchableOpacity style={styles.timeInput} onPress={() => setShowCloseTime(true)}>
                                        <Text style={styles.timeText}>
                                            {values.stall.closeHours ? `Close: ${values.stall.closeHours}` : 'Select Closing Time'}
                                        </Text>
                                    </TouchableOpacity>
                                    {showCloseTime && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowCloseTime(false);
                                                if (selectedDate) {
                                                    setCloseTime(selectedDate);
                                                    setFieldValue('stall.closeHours', formatTime(selectedDate));
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            </>
                        )}

                        <Button title="Update User" onPress={handleSubmit} />
                    </>
                )}
            </Formik>
        </ScrollView>
    );
};

export default EditUser;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        alignSelf: 'center'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10
    },
    imageContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    imagePicker: {
        width: 100,
        height: 100,
        backgroundColor: "#eee",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#2BA84A",
    },
    roundImage: {
        width: "100%",
        height: "100%",
        borderRadius: 50,
    },
    placeholderText: {
        color: "#888",
        fontSize: 14,
    },
    placeholderBellowText: {
        color: "#aaa",
        fontSize: 10,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    timeInput: {
        flex: 1,
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: "center",
        paddingHorizontal: 16,
        marginRight: 10,
        backgroundColor: "#fff",
    },
    timeText: {
        color: "#888",
    },
});
