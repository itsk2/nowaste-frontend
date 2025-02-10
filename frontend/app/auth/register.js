import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image, Alert, ImageBackground, StatusBar } from 'react-native';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { registerUser } from '../(services)/api/Users/registerUserAPI';
import Constants from 'expo-constants';
import { Picker } from '@react-native-picker/picker';


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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>

        <View style={styles.overlay}>
          <Formik
            initialValues={{ email: "", password: "", confirmPassword: "", name: "", role: "" }}
            onSubmit={async (values) => {
              try {
                const response = await registerUser({
                  ...values,
                  avatar,
                });
                Alert.alert(
                  "Registered Successfully",
                  "You have been registered.",
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        router.push('/auth/login');
                      },
                    },
                  ]
                );
              } catch (error) {
                console.error('Registration failed:', error.response?.data?.message || error.message);
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
                  placeholder="Name"
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                />
                {errors.name && touched.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Email"
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
                  placeholder="Confirm Password"
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
                    <Picker.Item label="User" value="user" color='gray' />
                    <Picker.Item label="Stall" value="stall" color='gray' />
                  </Picker>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </View>
    </>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight, // Push the content down by the status bar height
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
  placeholderBellowText: {
    color: "#888",
    textAlign: "center",
    fontSize: 12,
  },
  pickerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderColor: '#ccc',
    marginBottom: 15
  },
  picker: {
    height: 50,
    width: "70%",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
});