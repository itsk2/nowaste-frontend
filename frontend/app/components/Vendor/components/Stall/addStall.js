import { StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import Constants from 'expo-constants';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addVendorStall } from '../../../../(services)/api/Vendor/addVendorStall';

const AddStall = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [avatar, setAvatar] = useState(null);
  const [showOpenTime, setShowOpenTime] = useState(false);
  const [showCloseTime, setShowCloseTime] = useState(false);
  const [openTime, setOpenTime] = useState(null);
  const [closeTime, setCloseTime] = useState(null);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

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
            if (!result.canceled) setAvatar(result.assets[0].uri);
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
            if (!result.canceled) setAvatar(result.assets[0].uri);
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../../../assets/bg-leaf.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Text style={styles.registerText}>Add Your Stall Details</Text>
          <Text style={styles.subText}>
            To Connect with local partners, reduce food waste, and make a positive impact on our environment.
          </Text>
        </View>

        <View style={styles.overlay}>
          <Formik
            initialValues={{
              stallDescription: "",
              stallAddress: "",
              stallNumber: "",
              openHours: "",
              closeHours: ""
            }}
            onSubmit={async (values) => {
              try {
                await addVendorStall({
                  ...values,
                  _id: user?._id || user?.user?._id,
                  avatar,
                  openHours: openTime ? formatTime(openTime) : "",
                  closeHours: closeTime ? formatTime(closeTime) : "",
                });
                Alert.alert("Stall Added Successfully", "You can now proceed.", [
                  {
                    text: "OK",
                    onPress: () => router.push("/components/Vendor/(tabs)"),
                  },
                ]);
              } catch (error) {
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

                {/* Image Picker */}
                <View style={styles.imageContainer}>
                  <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={styles.roundImage} />
                    ) : (
                      <>
                        <Text style={styles.placeholderText}>No File Upload</Text>
                        <Text style={styles.placeholderBelowText}>Select Stall Image</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Stall Description */}
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  onChangeText={handleChange("stallDescription")}
                  onBlur={handleBlur("stallDescription")}
                  value={values.stallDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                {errors.stallDescription && touched.stallDescription && (
                  <Text style={styles.errorText}>{errors.stallDescription}</Text>
                )}

                {/* Stall Address */}
                <TextInput
                  style={styles.input}
                  placeholder="Stall Address"
                  onChangeText={handleChange("stallAddress")}
                  onBlur={handleBlur("stallAddress")}
                  value={values.stallAddress}
                />
                {errors.stallAddress && touched.stallAddress && (
                  <Text style={styles.errorText}>{errors.stallAddress}</Text>
                )}

                {/* Opening & Closing Time Pickers */}
                <View style={styles.timeContainer}>
                  <TouchableOpacity style={styles.timeInput} onPress={() => setShowOpenTime(true)}>
                    <Text style={styles.timeText}>
                      {openTime ? `Open: ${formatTime(openTime)}` : 'Select Opening Time'}
                    </Text>
                  </TouchableOpacity>
                  {showOpenTime && (
                    <DateTimePicker
                      value={openTime || new Date()}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowOpenTime(false);
                        if (selectedDate) setOpenTime(selectedDate);
                      }}
                    />
                  )}

                  <TouchableOpacity style={styles.timeInput} onPress={() => setShowCloseTime(true)}>
                    <Text style={styles.timeText}>
                      {closeTime ? `Close: ${formatTime(closeTime)}` : 'Select Closing Time'}
                    </Text>
                  </TouchableOpacity>
                  {showCloseTime && (
                    <DateTimePicker
                      value={closeTime || new Date()}
                      mode="time"
                      is24Hour={false}
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowCloseTime(false);
                        if (selectedDate) setCloseTime(selectedDate);
                      }}
                    />
                  )}
                </View>

                {/* Stall Number */}
                <TextInput
                  style={styles.input}
                  placeholder="Stall Number"
                  onChangeText={handleChange("stallNumber")}
                  onBlur={handleBlur("stallNumber")}
                  value={values.stallNumber}
                />
                {errors.stallNumber && touched.stallNumber && (
                  <Text style={styles.errorText}>{errors.stallNumber}</Text>
                )}

                {/* Submit Button */}
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Add Stall Information</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ImageBackground>
    </>
  );
};

export default AddStall;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#fff",
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
    textAlign: 'center'
  },
  subText: {
    fontSize: 14,
    color: "#E6FFE6",
  },
  overlay: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  imageContainer: {
    marginBottom: 20,
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
    fontWeight: "600",
  },
  placeholderBelowText: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
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
  errorText: {
    color: "red",
    marginBottom: 12,
  },
  button: {
    height: 50,
    backgroundColor: "#6200ea",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});