import { StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native'
import React, { useState } from 'react'
import Constants from 'expo-constants';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAction } from '../../../../(redux)/authSlice';
import { useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { addVendorStall } from '../../../../(services)/api/Vendor/addVendorStall';


const AddStall = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [avatar, setAvatar] = useState(null);

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
      <View style={styles.overlay}>
        <Formik
          initialValues={{ stallDescription: "", stallAddress: "", stallNumber: "" }}
          onSubmit={async (values) => {
            try {
              // console.log('Values', values)

              const response = await addVendorStall({
                ...values,
                _id: user?._id || user?.user?._id,
                avatar,
              });

              if (response && response.success) {
                // console.log("Dispatching user update:", response.user);
                dispatch(updateUserAction(response.vendor));
              }

              Alert.alert(
                "Stall Added Successfully",
                "You need to login again",
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
              <View style={styles.imageContainer}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.roundImage} />
                  ) : (
                    <>
                      <Text style={styles.placeholderText}>No File Upload</Text>
                      <Text style={styles.placeholderBellowText}>Select Stall Image</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                onChangeText={handleChange("stallDescription")}
                onBlur={handleBlur("stallDescription")}
                value={values.stallDescription}
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
              />
              {errors.stallDescription && touched.stallDescription && (
                <Text style={styles.errorText}>{errors.stallDescription}</Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Address"
                onChangeText={handleChange("stallAddress")}
                onBlur={handleBlur("stallAddress")}
                value={values.stallAddress}
              />
              {errors.stallAddress && touched.stallAddress && (
                <Text style={styles.errorText}>{errors.stallAddress}</Text>
              )}
              <TextInput
                style={styles.input}
                placeholder="Stall Number"
                onChangeText={handleChange("stallNumber")}
                onBlur={handleBlur("stallNumber")}
                keyboardType='numeric'
                maxLength={3}
                value={values.stallNumber}
              />
              {errors.stallNumber && touched.stallNumber && (
                <Text style={styles.errorText}>{errors.stallNumber}</Text>
              )}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Add Stall Information</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </>
  )
}

export default AddStall

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  overlay: {
    flex: 1,
    marginTop: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
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
  textArea: {
    height: 120,
    textAlignVertical: "top",
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
})