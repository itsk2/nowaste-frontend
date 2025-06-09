import { StyleSheet, Text, View, StatusBar, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
// import { createProduct } from '../../../../(services)/api/Product/createProduct'
import Constants from 'expo-constants'
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useSelector } from 'react-redux';
import { createSack } from '../../../../(services)/api/Sack/createSack';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const CreateSack = () => {
    const { user } = useSelector((state) => state.auth);
    const [images, setImage] = useState(null);
    const router = useRouter();
    const userId = user.user._id
    const { stallNum } = useLocalSearchParams();
    const stallNumber = stallNum ? JSON.parse(stallNum) : {};
    // console.log(stallNumber)
    const navigation = useNavigation();

    const pickImage = async () => {
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
                            setImage(result.assets[0].uri);
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
                            setImage(result.assets[0].uri);
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

    //Kilo Increment
    const [kilo, setKilo] = useState(0);

    const increment = (setFieldValue) => {
        if (kilo < 99999) {
            const newKilo = kilo + 1;
            setKilo(newKilo);
            setFieldValue('kilo', newKilo);
        }
    };

    const decrement = (setFieldValue) => {
        if (kilo > 0) {
            const newKilo = kilo - 1;
            setKilo(newKilo);
            setFieldValue('kilo', newKilo);
        }
    };

    const handleChangeText = (text, setFieldValue) => {
        const value = parseInt(text, 10) || 0;
        const newValue = value > 99999 ? 99999 : value;
        setKilo(newValue);
        setFieldValue('kilo', newValue);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back-circle-sharp" size={32} color="#2BA84A" />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.greeting}>Stall</Text>
                        <Text style={styles.name}>Create Sack</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Post New Sack</Text>

                <Formik
                    initialValues={{
                        description: '', kilo: '', dbSpoil: ''
                    }}
                    onSubmit={async (values) => {
                        try {
                            const response = await createSack({
                                ...values,
                                images,
                                userId,
                                stallNumber: stallNumber.stallNumber,
                            });
                            Alert.alert("Posted Sack Successfully", "You posted a new sack.", [
                                { text: "OK", onPress: () => navigation.goBack() },
                            ]);
                        } catch (error) {
                            console.error('Create Sack failed:', error.response?.data?.message || error.message);
                            Alert.alert("Create Sack Failed", error.response?.data?.message || "An error occurred.");
                        }
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                        <View style={styles.card}>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {images ? (
                                    <Image source={{ uri: images }} style={styles.roundImage} />
                                ) : (
                                    <>
                                        <Text style={styles.placeholderText}>No File Uploaded</Text>
                                        <Text style={styles.placeholderBellowText}>Select Image</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="Description"
                                multiline
                                numberOfLines={6}
                                textAlignVertical='top'
                                onChangeText={handleChange("description")}
                                onBlur={handleBlur("description")}
                                value={values.description}
                            />
                            {errors.description && touched.description && (
                                <Text style={styles.errorText}>{errors.description}</Text>
                            )}

                            <Text style={styles.kiloHint}>How many kilo/s do you have?</Text>

                            <View style={styles.sackRow}>
                                <TouchableOpacity onPress={() => decrement(setFieldValue)} style={styles.sackButton}>
                                    <Text style={styles.sackButtonText}>-</Text>
                                </TouchableOpacity>

                                <TextInput
                                    style={styles.sackInput}
                                    keyboardType="numeric"
                                    value={kilo.toString()}
                                    onChangeText={(text) => handleChangeText(text, setFieldValue)}
                                    maxLength={5}
                                />

                                <TouchableOpacity onPress={() => increment(setFieldValue)} style={styles.sackButton}>
                                    <Text style={styles.sackButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dropdownWrapper}>
                                <Picker
                                    selectedValue={values.dbSpoil}
                                    onValueChange={(itemValue) => setFieldValue('dbSpoil', itemValue)}
                                    style={styles.dropdown}
                                >
                                    <Picker.Item label="Select days before spoiling" value="" enabled={false} />
                                    <Picker.Item label="2 Days" value="2" />
                                    <Picker.Item label="3 Days" value="3" />
                                    <Picker.Item label="4 Days" value="4" />
                                </Picker>
                                {errors.dbSpoil && touched.dbSpoil && (
                                    <Text style={styles.errorText}>{errors.dbSpoil}</Text>
                                )}
                            </View>

                            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                <Text style={styles.submitText}>Post Sack</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Formik>
            </View>
        </View>
    );
}

export default CreateSack

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2F23',
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#fff',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2BA84A',
        fontFamily: 'Inter-Medium',
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1A2F23',
        marginBottom: 10,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    imagePicker: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },
    roundImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    placeholderText: {
        color: '#888',
        fontWeight: '600',
    },
    placeholderBellowText: {
        color: '#aaa',
        fontSize: 13,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 14,
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
    },
    sackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sackButton: {
        backgroundColor: '#2BA84A',
        padding: 10,
        borderRadius: 6,
    },
    sackButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sackInput: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 6,
        marginHorizontal: 10,
        width: 70,
        textAlign: 'center',
        height: 40,
        fontSize: 16,
    },
    kiloHint: {
        fontSize: 13,
        color: 'gray',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#2BA84A',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dropdownWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    dropdown: {
        height: 50,
        width: '100%',
        paddingHorizontal: 8,
    },
});
