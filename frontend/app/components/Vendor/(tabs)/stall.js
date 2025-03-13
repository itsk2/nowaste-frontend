import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { getVendorStall } from '../../../(services)/api/Vendor/getVendorStall';
import { getAllStalls } from '../../../(services)/api/Users/getAllStalls';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Stall = () => {
  const { user } = useSelector((state) => state.auth);
  const [myStore, setStore] = useState(null);
  const [allStalls, setAllStalls] = useState([]);
  const [showMyStall, setShowMyStall] = useState(false);
  const userId = user?._id || user?.user?._id;
  const navigation = useNavigation();
  const router = useRouter();

  const fetchSellerStore = async () => {
    try {
      const data = await getVendorStall(userId);
      setStore(data.stall);
    } catch (error) {
      console.error("Error fetching store:", error);
    }
  };

  const fetchAllStore = async () => {
    try {
      const data = await getAllStalls();
      setAllStalls(data.stalls);
    } catch (error) {
      console.error("Error fetching stalls:", error);
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
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowMyStall(!showMyStall)}
      >
        <Text style={styles.toggleButtonText}>
          {showMyStall ? "Show All Stalls" : "Show My Stall"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.heading}>
        {showMyStall ? "My Stall" : "Taytay, Rizal Market Stalls"}
      </Text>

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
                <Text style={styles.text}><FontAwesome6 name="house" size={14} color="green" /> Stall Number: {stallData.stallNumber || "N/A"}</Text>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.push({
                    pathname: "/components/Vendor/components/Stall/seeStall",
                    params: { stall: JSON.stringify(stallData), userNum: JSON.stringify(stallUser) }, 
                  })}
                >
                  <Text style={styles.buttonText}>View More</Text>
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
    paddingTop: Constants.statusBarHeight,
    padding: 15,
    backgroundColor: '#F4F4F4',  // Light background color
    flex: 1,
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
    color: '#333',  // Dark text for readability
  },
  card: {
    backgroundColor: '#fff',
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
    backgroundColor: '#FF5A5F',  // Airbnb red
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
