import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground
} from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { addUserAddress } from '../../(services)/api/Users/addUserAddress';
import axios from 'axios';
import baseURL from '../../../assets/common/baseURL';

const UserAddress = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const router = useRouter();

  const role = user?.role || user?.user?.role || 'farmer';
  const userId = user?._id || user?.user?._id;

  const [userData, setUserData] = useState({});
  const address = userData?.address;

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-user/${userId}`);
      setUserData(response.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      fetchUser();
      const interval = setInterval(fetchUser, 3000);
      return () => clearInterval(interval);
    }, [userId])
  );

  const handleFormSubmit = async (values) => {
    try {
      await addUserAddress({ ...values, _id: userId });
      Alert.alert('Updated Successfully', 'Your profile has been updated.', [
        {
          text: 'OK',
          onPress: () => {
            if (role === 'farmer' || role === 'composter') {
              router.replace('/components/Vendor/(tabs)');
            } else {
              router.replace('/components/Vendor/components/Stall/addStall');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Address update failed:', error);
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'An error occurred during the update.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../../assets/bg-leaf.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Your Stall Details</Text>
          <Text style={styles.subText}>
            To connect with local partners, reduce food waste, and make a positive impact on our environment.
          </Text>
        </View>

        <View style={styles.container}>
          <View style={styles.card}>
            {address ? (
              <View style={styles.menu}>
                <Text style={styles.sectionTitle}>Current Address</Text>
                <Image
                  source={require('../../../assets/house.png')}
                  style={styles.houseImage}
                />
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
                <TouchableOpacity
                  style={{ backgroundColor: '#1e88e5', padding: 15, borderRadius: 7, marginTop: 7, }}
                  onPress={() => router.push("/components/Vendor/(tabs)/")}
                >
                  <Text style={styles.buttonText}>Proceed</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Formik
                initialValues={{ lotNum: '', street: '', baranggay: '', city: '' }}
                onSubmit={handleFormSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.form}>
                    <TextInput
                      style={styles.input}
                      placeholder="Lot Number"
                      onChangeText={handleChange('lotNum')}
                      onBlur={handleBlur('lotNum')}
                      value={values.lotNum}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Street Name"
                      onChangeText={handleChange('street')}
                      onBlur={handleBlur('street')}
                      value={values.street}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Baranggay"
                      onChangeText={handleChange('baranggay')}
                      onBlur={handleBlur('baranggay')}
                      value={values.baranggay}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="City"
                      onChangeText={handleChange('city')}
                      onBlur={handleBlur('city')}
                      value={values.city}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                      <Text style={styles.buttonText}>Enter Home Address</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            )}
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

export default UserAddress;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#317256',
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: "#2BA84A",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 14,
    color: "#E6FFE6",
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  houseImage: {
    height: 120,
    width: 120,
    resizeMode: "contain",
    alignSelf: "center",
    marginVertical: 8,
  },
  menu: {
    alignItems: "center",
  },
  menuItem: {
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 4,
  },
  menuText: {
    fontSize: 17,
    color: "#333",
  },
  form: {
    marginTop: 10,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: "#1e88e5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});