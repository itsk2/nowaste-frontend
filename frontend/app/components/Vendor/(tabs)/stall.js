import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import Constants from 'expo-constants';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { useSelector } from 'react-redux';
import { getVendorStall } from '../../../(services)/api/Vendor/getVendorStall';

const Stall = () => {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const navigation = useNavigation()
  const [store, setStore] = useState([]);
  const userId = user?._id || user?.user?._id;

  const fetchSellerStore = async () => {
    try {
      const data = await getVendorStall(userId);
      setStore(data.user);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  console.log(store)

  useFocusEffect(
    useCallback(() => {
      fetchSellerStore();
    }, [])
  );
  return (
    <View style={styles.container}>
      <Text>Stall</Text>

      <Button onPress={() => navigation.navigate('components/Vendor/components/Stall/addStall')} title='Add Your Stall'>
      </Button>
    </View>
  )
}

export default Stall

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
  },
})