import { StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native'
import React, { useCallback, useState } from 'react'
import Constants from 'expo-constants';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAction } from '../../(redux)/authSlice';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { addUserAddress } from '../../(services)/api/Users/addUserAddress';
import axios from 'axios';
import baseURL from '../../../assets/common/baseURL';

const UserAddress = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const role = user.role || user.user.role
  const router = useRouter();
  const [userData, setUser] = useState([])

  const fetchUser = async () => {
    try {
      const data = await axios.get(`${baseURL}/get-user/${user?.user?._id}`);
      setUser(data.data.user);
    } catch (error) {
      console.error("Error fetching predicted waste data:", error);
    }
  };
  // console.log(user?.user?._id)
  useFocusEffect(
    useCallback(() => {
      if (user.user._id) {
        fetchUser();
        const interval = setInterval(() => {
          fetchUser();
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [user.user._id])
  );

  const address = userData?.address;

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.background}>
        <View style={styles.container}>
          <View style={styles.card}>
            {address ? (
              <>
                <View style={styles.menu}>
                  <Text style={styles.registerText}>Current Address</Text>
                  <View >
                    <Image source={require('../../../assets/house.png')} style={{
                      height: 120, width: 120, resizeMode: "contain", alignSelf: "center",

                    }} />
                  </View>
                  <View style={styles.menuItem}>
                    <Text style={styles.menuText}>Lot Number: {address.lotNum}</Text>
                  </View>
                  <View style={styles.menuItem}>
                    <Text style={styles.menuText}>Street: {address.street}</Text>
                  </View>
                  <View style={styles.menuItem}>
                    <Text style={styles.menuText}>Baranggay: {address.baranggay}</Text>
                  </View>
                  <View style={styles.menuItem}>
                    <Text style={styles.menuText}>City: {address.city}</Text>
                  </View>
                </View>
              </>
            ) : (
              <Formik
                initialValues={{ lotNum: "", street: "", baranggay: "", city: "" }}
                onSubmit={async (values) => {
                  try {
                    const response = await addUserAddress({
                      ...values,
                      _id: user._id || user.user._id,
                    });

                    Alert.alert(
                      "Updated Successfully",
                      "Your profile has been updated.",
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            if (role === 'farmer' || role === 'composter') {
                              router.replace("/components/Vendor/(tabs)");
                            } else {
                              router.replace("/components/Vendor/components/Stall/addStall");
                            }
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
                    <TextInput
                      style={styles.input}
                      placeholder='Lot Number'
                      onChangeText={handleChange("lotNum")}
                      onBlur={handleBlur("lotNum")}
                      value={values.lotNum}
                    />
                    {errors.lotNum && touched.lotNum && (
                      <Text style={styles.errorText}>{errors.lotNum}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Street Name"
                      onChangeText={handleChange("street")}
                      onBlur={handleBlur("street")}
                      value={values.street}
                    />
                    {errors.street && touched.street && (
                      <Text style={styles.errorText}>{errors.street}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Name of Baranggay"
                      onChangeText={handleChange("baranggay")}
                      onBlur={handleBlur("baranggay")}
                      value={values.baranggay}
                    />
                    {errors.baranggay && touched.baranggay && (
                      <Text style={styles.errorText}>{errors.baranggay}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Name of the City"
                      onChangeText={handleChange("city")}
                      onBlur={handleBlur("city")}
                      value={values.city}
                    />
                    {errors.city && touched.city && (
                      <Text style={styles.errorText}>{errors.city}</Text>
                    )}
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                      <Text style={styles.buttonText}>Enter Home Address</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            )}
          </View>
        </View>
      </View >
    </>
  )
}

export default UserAddress

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#317256'
  },
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
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
  addressContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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
  menu: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuText: {
    fontSize: 18,
    marginLeft: 10,
  },
  registerText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "black",
    textAlign: 'center'
  },
})