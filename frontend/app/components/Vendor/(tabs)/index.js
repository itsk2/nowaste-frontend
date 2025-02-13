import { StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import { useFocusEffect } from 'expo-router';
import { getVendorStall } from '../../../(services)/api/Vendor/getVendorStall';

const index = () => {
  const { user } = useSelector((state) => state.auth);
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
    <View>
      <Text>You are a Vendor</Text>
    </View>
  )
}

export default index

const styles = StyleSheet.create({})