import { StyleSheet, Text, View, StatusBar, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
// import { createProduct } from '../../../../(services)/api/Product/createProduct'
import Constants from 'expo-constants'
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useSelector } from 'react-redux';
import { createSack } from '../../../../(services)/api/Sack/createSack';

const CreateSack = () => {
    const { user } = useSelector((state) => state.auth);
    const [images, setImage] = useState(null);
    const router = useRouter();
    const userId = user.user._id
    const { stallNum } = useLocalSearchParams();
    const stallNumber = stallNum ? JSON.parse(stallNum) : {};
    // console.log(stallNumber)

    //Image Picker
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
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
        <>
            <StatusBar translucent backgroundColor={"transparent"} />
            <ScrollView style={styles.container}>
                <View>
                    <Text style={{
                        marginLeft: 8,
                        marginTop: 10,
                        fontSize: 21,
                        padding: 2
                    }}>Post New Sack</Text>

                    <Formik
                        initialValues={{
                            description: '', kilo: '', dbSpoil: ''
                        }}
                        onSubmit={async (values) => {
                            try {
                                // console.log(values)
                                const response = await createSack({
                                    ...values,
                                    images,
                                    userId,
                                    stallNumber,
                                });
                                Alert.alert(
                                    "Posted Sack Successfully",
                                    "You post a new sack.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                router.back();
                                            },
                                        },
                                    ]
                                );
                            } catch (error) {
                                console.error('Create Sack failed:', error.response?.data?.message || error.message);
                                Alert.alert(
                                    "Create Sack Failed",
                                    error.response?.data?.message || "An error occurred during Create Sack. Please try again.",
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
                            setFieldValue,
                            values,
                            errors,
                            touched,
                        }) => (
                            <View style={styles.form}>
                                <View style={styles.imageContainer}>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                        {images ? (
                                            <Image source={{ uri: images }} style={styles.roundImage} />
                                        ) : (
                                            <>
                                                <Text style={styles.placeholderText}>No File Upload</Text>
                                                <Text style={styles.placeholderBellowText}>Select Image</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Description"
                                    multiline
                                    numberOfLines={12}
                                    onChangeText={handleChange("description")}
                                    onBlur={handleBlur("description")}
                                    value={values.description}
                                    textAlignVertical='top'
                                />
                                {errors.description && touched.description && (
                                    <Text style={styles.errorText}>{errors.description}</Text>
                                )}

                                <View style={styles.sackContainer}>
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
                                    <Text style={{ color: 'gray', marginTop: 9, marginLeft: 5 }}>How many kilo/s do you have?</Text>
                                </View>

                                <TextInput
                                    style={{
                                        height: 50,
                                        borderColor: "#ccc",
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        paddingHorizontal: 16,
                                        marginBottom: 16,
                                        backgroundColor: "#fff",
                                        width: '63  %'
                                    }}
                                    placeholder="How Many Days before spoling?"
                                    onChangeText={handleChange("dbSpoil")}
                                    onBlur={handleBlur("dbSpoil")}
                                    value={values.dbSpoil}
                                    keyboardType="numeric"
                                />
                                {errors.dbSpoil && touched.dbSpoil && (
                                    <Text style={styles.dbSpoil}>{errors.dbSpoil}</Text>
                                )}
                                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                    <Text style={styles.buttonText}>Post New Sack</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Formik>

                </View>
            </ScrollView>
        </>
    )
}

export default CreateSack

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 24,
        color: '#fff',
    },
    form: {
        width: "100%",
        borderRadius: 10,
        padding: 20,
    },
    input: {
        height: 50,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: "#fff",
    },
    errorText: {
        color: "red",
        marginBottom: 16,
    },
    button: {
        height: 50,
        backgroundColor: "#6200ea",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginTop: 16,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    sackContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    sackButton: {
        backgroundColor: 'gray',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        width: '10.5%'
    },
    sackButtonText: {
        color: 'white',
        fontSize: 12,
    },
    sackInput: {
        borderWidth: 1,
        borderColor: 'black',
        textAlign: 'center',
        width: 60,
        marginLeft: 7,
        marginRight: 7,
        fontSize: 12,
    },
    imageContainer: {
        marginBottom: 16,
        alignItems: "center",
    },
    imagePicker: {
        width: 250,
        height: 150,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: "#e9e9e9",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    roundImage: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },
    placeholderText: {
        color: "#888",
        textAlign: "center",
    },
    placeholderBellowText: {
        color: "#888",
        textAlign: "center",
        fontSize: 12,
    },
});