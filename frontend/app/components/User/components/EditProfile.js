import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image, Alert, ImageBackground, StatusBar } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAction } from '../../../(redux)/authSlice';
import { useNavigation, useRouter } from 'expo-router';
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
    const router = useRouter();
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
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.iconGroup}>
                                <AntDesign name="back" size={24} color="white" />
                            </View>
                            <View style={{ marginLeft: 10 }}>
                                <Text style={styles.greeting}>Edit </Text>
                                <Text style={styles.greeting}>Profile</Text>
                            </View>
                        </View>
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
                                {user.user.role === 'vendor' && (
                                    <Text style={{ marginTop: 10, fontSize: 9, marginBottom: 3 }}>If you want to change your stall credentials, proceed on notifying the admin.</Text>
                                )}
                                <View style={styles.headerWrapper}>
                                    <Text style={styles.header}>Edit Profile</Text>
                                </View>

                                <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
                                    {image ? (
                                        <Image source={{ uri: image }} style={styles.image} />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <AntDesign name="picture" size={40} color="black" />
                                            <Text style={{ marginTop: 10 }}>Select Image</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.inputRow}>
                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Name"
                                            onChangeText={handleChange('name')}
                                            onBlur={handleBlur('name')}
                                            value={values.name}
                                        />
                                    </View>

                                    <View style={styles.inputWrapper}>
                                        <Text style={styles.label}>Email</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
                                            onChangeText={handleChange('email')}
                                            onBlur={handleBlur('email')}
                                            value={values.email}
                                            keyboardType="email-address"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                    <Text style={styles.submitButtonText}>Submit</Text>
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
        backgroundColor: '#E9FFF3'
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
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
    },
    overlay: {
        flex: 1,
        padding: 16,
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
    headerWrapper: {
        backgroundColor: '#163020',
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 20,
    },
    header: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    imageBox: {
        height: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 8,
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    inputWrapper: {
        flex: 1,
        marginRight: 8,
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        backgroundColor: '#e5e5e5',
        padding: 10,
        borderRadius: 5,
    },
    submitButton: {
        backgroundColor: '#163020',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 10,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
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