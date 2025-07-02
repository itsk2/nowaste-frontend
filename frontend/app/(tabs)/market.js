import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { getAllStalls } from '../(services)/api/Users/getAllStalls';
import axios from 'axios';
import baseURL from '../../assets/common/baseURL';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from "@expo/vector-icons/Ionicons";

const Market = () => {
  const [sacks, setSacks] = useState([]);
  const [sellers, setSellers] = useState([]);
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const userId = user.user._id;
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const sacksRes = await axios.get(`${baseURL}/sack/get-sacks`);
      const stallsRes = await getAllStalls();
      setSacks(sacksRes.data.sacks);
      setSellers(stallsRes.stalls);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getSellerDetails = (sellerId) => {
    return sellers.find((s) => s._id === sellerId);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const sortedSacks = sacks
    .filter((sack) => !sack.isDeleted && sack.status === 'posted') // 👈 only posted
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const timeAgo = (date) => {
    const now = new Date();
    const inputDate = new Date(date); // convert ISO string to Date
    const seconds = Math.floor((now - inputDate) / 1000);
    const days = Math.floor(seconds / 86400);

    if (days >= 3) {
      return inputDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
    }

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  };

  const formatSpoilDate = (date) => {
    const inputDate = new Date(date);
    return inputDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddtoSack = async (item) => {
    try {
      const { data } = await axios.post(`${baseURL}/sack/add-to-sack/${userId}`, item);
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (error) {
      Alert.alert("Cannot Proceed", error.response?.data?.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Taytay, Rizal</Text>
          <Text style={styles.name}>New Market</Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('components/User/components/MySack/mySack')}
          >
            <Entypo name="shopping-cart" size={18} color="#2BA84A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('components/User/components/Chat/Chats')}
          >
            <MaterialIcons name="chat-bubble-outline" size={18} color="#2BA84A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('components/User/components/Notification/notification')}
          >
            <Ionicons name="notifications-sharp" size={24} color="#2BA84A" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedSacks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const sellerData = getSellerDetails(item.seller);
          const stallData = sellerData?.stall || {};
          const stallImage = stallData?.stallImage?.url;
          const sackImage = item.images?.[0]?.url;

          const isOpen = stallData?.status === 'open';

          console.log(item, 'LOGS')

          return (
            <View style={styles.postContainer}>
              {/* Seller Info */}
              <View style={styles.sellerInfoContainer}>
                <View style={{
                  backgroundColor: '#F1F8E9',
                }}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push({
                      pathname: "/components/User/components/Stall/seeStall",
                      params: { stall: JSON.stringify(stallData) },
                    })}
                  >
                    <View style={styles.sellerInfo}>

                      <View style={isOpen ? styles.openStallBorder : null}>
                        {stallImage && (
                          <Image source={{ uri: stallImage }} style={styles.stallBanner} />
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.sellerNameText}>
                          {sellerData?.name || 'Unknown Seller'}
                        </Text>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: '#2BA84A',
                          alignSelf: 'center',
                          marginLeft: 140
                        }}>
                          {stallData?.storeType || 'Unknown Seller'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.timestampText}>
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Sack Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>{item.description}</Text>
                {sackImage && (
                  <Image source={{ uri: sackImage }} style={styles.sackImage} />
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: 'bold' }}>Kg: {item.kilo}</Text>
                  <Text style={{ fontWeight: 'bold' }}>
                    Spoils on: {formatSpoilDate(item.dbSpoil)}
                  </Text>
                </View>
              </View>
              {user.user.role !== 'admin' && (
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddtoSack(item)}>
                  <Text style={styles.addButtonText}>Add to Sack</Text>
                </TouchableOpacity>
              )}
              <Modal
                animationType="fade"
                transparent={true}
                visible={showModal}
                onRequestClose={() => setShowModal(false)}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalCard}>
                    <View style={styles.checkmarkCircle}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                    <Text style={styles.modalTitle}>Now Added To Your Sack!!</Text>
                  </View>
                </View>
              </Modal>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Market;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E9FFF3',
    flex: 1,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    borderColor: '#2BA84A',
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2BA84A',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  openStallBorder: {
    backgroundColor: '#0FFF50', // Green background if open
    padding: 5,
    borderRadius: 20,
    width: '10%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestampText: {
    marginLeft: 10,
  },
  stallBanner: {
    width: '125%',
    height: 30,
    resizeMode: 'cover',
    borderRadius: 20,
  },
  sellerInfo: {
    padding: 10,
    backgroundColor: '#F1F8E9',
    flexDirection: 'row'
  },
  sellerNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2BA84A',
    alignSelf: 'center',
    marginLeft: 10
  },
  descriptionContainer: {
    padding: 10,
  },
  descriptionText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  sackImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#0F0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 280,
    backgroundColor: '#A5D6A7',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#689F38',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});