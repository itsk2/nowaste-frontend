import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image, Alert, ImageBackground, StatusBar } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAction } from '../../../(redux)/authSlice';
import { useNavigation } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { updateUser } from '../../../(services)/api/Users/updateUserAPI';

// Schema for validation
const UpdateUserSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
});


const EditProfile = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user } = useSelector((state) => state.auth);
    // console.log
    const [image, setImage] = useState(
        user.user && user.user.image && user.user.image[0] ? user.user.image[0].url :
            (user.image && user.image[0] ? user.image[0].url : null)
    );

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

    useEffect(() => {
        // console.log("Updated User in Redux Store:", updatedUser);
    }, [user]);
    return (
        <>
            <StatusBar translucent backgroundColor="transparent" />
            <View style={styles.container}>
                <View style={{ justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <AntDesign name="back" size={24} color="white" style={{ marginLeft: 25, fontWeight: 'bold', marginTop: 30, position: 'relative' }} />
                    </TouchableOpacity>
                </View>
                <View style={styles.overlay}>
                    <Formik
                        initialValues={{
                            _id: user.user ? user.user._id : user._id,
                            name: user.user ? user.user.name || '' : user.name || '',
                            email: user.user ? user.user.email || '' : user.email || '',
                            role: user.user?.role || user.role,
                        }}
                        validationSchema={UpdateUserSchema}
                        onSubmit={async (values) => {
                            try {
                                console.log(values)
                                const response = await updateUser({
                                    ...values,
                                    image,
                                });
                                // console.log("Update Response:", response);

                                if (response && response.success) {
                                    // console.log("Dispatching user update:", response.user);
                                    dispatch(updateUserAction(response.user));
                                }

                                Alert.alert(
                                    "Updated Successfully",
                                    "Your profile has been updated.",
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                navigation.push('(tabs)');
                                            },
                                        },
                                    ]
                                );
                            } catch (error) {
                                console.error(error.message);
                                Alert.alert(
                                    "Update Failed",
                                    error.response?.data?.message || "An error occurred during the update. Please try again.",
                                    [{ text: "OK" }]
                                );
                            }
                        }}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched,
                        }) => (
                            <View style={styles.form}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black', marginBottom: 10, textAlign: 'center' }}>EDIT PROFILE</Text>
                                <View style={styles.imageContainer}>
                                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                        {image ? (
                                            <Image source={{ uri: image }} style={styles.roundImage} />
                                        ) : (
                                            <>
                                                <Text style={styles.placeholderText}>No Image</Text>
                                                <Text style={styles.placeholderBelowText}>Select Image</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Name"
                                    onChangeText={handleChange('name')}
                                    onBlur={handleBlur('name')}
                                    value={values.name}
                                />
                                {errors.name && touched.name && (
                                    <Text style={styles.errorText}>{errors.name}</Text>
                                )}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Input Email to Confirm"
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                    keyboardType="email-address"
                                />
                                {errors.email && touched.email && (
                                    <Text style={styles.errorText}>{errors.email}</Text>
                                )}
                                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                    <Text style={styles.buttonText}>Update Profile</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </>
    );
};

export default EditProfile;

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
    form: {
        width: "100%",
        borderRadius: 10,
        padding: 20,
        marginBottom: 100,
        justifyContent: 'center'
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
        backgroundColor: "#FFAC1C",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginTop: 16,
    },
    buttonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
    },
    imageContainer: {
        marginBottom: 16,
        alignItems: "center",
    },
    imagePicker: {
        width: 150,
        height: 150,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 75,
        backgroundColor: "#e9e9e9",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    roundImage: {
        width: "100%",
        height: "100%",
        borderRadius: 75,
    },
    placeholderText: {
        color: "#888",
        textAlign: "center",
    },
    placeholderBelowText: {
        color: "#888",
        textAlign: "center",
        fontSize: 12,
    },
});