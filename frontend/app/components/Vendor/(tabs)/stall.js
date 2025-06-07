import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { getVendorStall } from '../../../(services)/api/Vendor/getVendorStall';
import { getAllStalls } from '../../../(services)/api/Users/getAllStalls';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';

const Stall = () => {
  const { user } = useSelector((state) => state.auth);
  const [myStore, setStore] = useState(null);
  const [allStalls, setAllStalls] = useState([]);
  const [showMyStall, setShowMyStall] = useState(true);
  const userId = user?._id || user?.user?._id;
  const navigation = useNavigation();
  const router = useRouter();

  const fetchSellerStore = async () => {
    try {
      const data = await getVendorStall(userId);
      setStore(data.stall);
    } catch (error) {
      // console.error("Error fetching store:", error);
    }
  };

  const fetchAllStore = async () => {
    try {
      const data = await getAllStalls();
      setAllStalls(data.stalls);
    } catch (error) {
      // console.error("Error fetching stalls:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSellerStore();
      fetchAllStore();
    }, [])
  );

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>My</Text>
          <Text style={styles.name}>Store</Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/components/Vendor/components/Notification/notification')}>
            <AntDesign name="notification" size={18} color="2BA84A" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sloganContainer}>
        <Text style={styles.sloganMain}>Waste Less</Text>
        <Text style={styles.sloganSub}>Live More!</Text>
        <Text style={styles.sloganDetail}>
          Support Composters. Empower Farmers. {"\n"} Clean Market. 🌱
        </Text>
      </View>



      <FlatList
        data={showMyStall ? (myStore ? [myStore] : []) : allStalls}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={({ item }) => {
          const stallData = item.stall || item;
          const stallUser = stallData.user
          // console.log(stallData.user,'Stall User')
          return (
            <View style={styles.card}>
              {stallData.stallImage?.url && (
                <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
              )}
              <View style={styles.cardContent}>
                <Text style={{ color: 'white' }}><FontAwesome6 name="house" size={14} color="white" /> Stall Number: {stallData.stallNumber || "N/A"}</Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push({
                    pathname: "/components/Vendor/components/Stall/seeStall",
                    params: { stall: JSON.stringify(stallData), userNum: JSON.stringify(stallUser) },
                  })}
                >
                  <Text style={styles.buttonText}>Store Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Stall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9FFF3',
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
    backgroundColor: '#E8F5E9',
  },
  toggleButton: {
    backgroundColor: '#FF5A5F', // Airbnb red
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white'
  },
  card: {
    backgroundColor: '#2F4F39',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,  // Slight shadow for a card-like effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 15,
  },
  text: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#4CAF50',  // Airbnb red
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sloganContainer: {
    backgroundColor: '#1A2F23',
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  sloganMain: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  sloganSub: {
    fontSize: 24,
    color: '#2BA84A',
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  sloganDetail: {
    fontSize: 14,
    color: '#B0D9A4',
    marginTop: 10,
    // fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: 'Inter-Bold'
  },
});