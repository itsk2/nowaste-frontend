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
      <ImageBackground
        source={require("../../assets/bg-leaf.png")}
        style={styles.background}
        resizeMode="cover"
      >
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
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  registerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  subText: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  form: {
    width: "100%",
  },
  input: {
    width: "100%",
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#008060",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
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
    color: "#008060",
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
});