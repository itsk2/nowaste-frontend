import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image, Alert, ImageBackground, StatusBar } from 'react-native';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { registerUser } from '../(services)/api/Users/registerUserAPI';
import Constants from 'expo-constants';
import { Picker } from '@react-native-picker/picker';
import { loginAction } from '../(redux)/authSlice';
import { useDispatch } from 'react-redux';
import { loginUser } from '../(services)/api/Users/loginUserAPI';
import { useMutation } from '@tanstack/react-query';


// Schema
const RegisterSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

const Register = () => {
  const [avatar, setAvatar] = useState(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"],
  });
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


  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../assets/bg-leaf.png")}
        style={styles.background}
        resizeMode="cover"
      >

        <View style={styles.header}>
          <Text style={styles.registerText}>Join NoWaste Community</Text>
          <Text style={styles.subText}>
            Connect with local partners, reduce food waste, and make a positive impact on our environment.
          </Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.registerText}>Register</Text>
          <Text style={styles.subText}>Create your new account</Text>

          <View style={styles.card}>
            <Formik
              initialValues={{ email: "", password: "", confirmPassword: "", name: "", role: "" }}
              onSubmit={async (values) => {
                try {
                  const response = await registerUser({
                    ...values,
                    avatar,
                  });

                  const data = {
                    email: values.email,
                    password: values.password,
                  };

                  mutation.mutateAsync(data)
                    .then((values) => {
                      dispatch(loginAction(values));
                    })

                  Alert.alert(
                    "Registered Successfully",
                    "You have been registered.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          router.push("/components/User/addAddress");
                        },
                      },
                    ]
                  );
                } catch (error) {
                  console.error('Registration failed:', error.response?.data?.message || error.message);
                  Alert.alert(
                    "Registration Failed",
                    error.response?.data?.message || "An error occurred during registration. Please try again.",
                    [{ text: "OK" }]
                  );
                }
              }}
              validationSchema={RegisterSchema}
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
                  <View style={styles.imageContainer}>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                      {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.roundImage} />
                      ) : (
                        <>
                          <Text style={styles.placeholderText}>No File Upload</Text>
                          <Text style={styles.placeholderBellowText}>Select Avatar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    value={values.name}
                  />
                  {errors.name && touched.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Your email address"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    keyboardType="email-address"
                  />
                  {errors.email && touched.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    secureTextEntry
                  />
                  {errors.password && touched.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    value={values.confirmPassword}
                    secureTextEntry
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}

                  <View style={styles.pickerContainer}>
                    <Picker
                      style={styles.picker}
                      selectedValue={values.role}
                      onValueChange={(itemValue) => {
                        handleChange("role")(itemValue);
                        handleBlur("role");
                      }}
                    >
                      <Picker.Item label="Farmer" value="farmer" color='gray' />
                      <Picker.Item label="Composter" value="composter" color='gray' />
                      <Picker.Item label="Vendor" value="vendor" color='gray' />
                    </Picker>
                  </View>

                  <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Sign up</Text>
                  </TouchableOpacity>

                  <View style={styles.signInContainer}>
                    <Text style={styles.signInText}>Back to </Text>
                    <TouchableOpacity onPress={() => router.push("/auth/login")}>
                      <Text style={styles.signInLink}>Sign in</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

export default Register;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "flex-start",
  },
  header: {
    backgroundColor: "#2BA84A",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  registerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: "#E6FFE6",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: -50,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pickerContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#2BA84A",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  signInText: {
    fontSize: 14,
    color: "#666",
  },
  signInLink: {
    fontSize: 14,
    color: "#2BA84A",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 5,
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
});