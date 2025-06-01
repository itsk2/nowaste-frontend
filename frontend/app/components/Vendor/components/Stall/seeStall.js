import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Icon from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../../assets/common/baseURL';
import { Ionicons } from '@expo/vector-icons';

const SeeStall = () => {
  const { stall, userNum } = useLocalSearchParams();
  const stallData = stall ? JSON.parse(stall) : {};
  const userData = userNum ? JSON.parse(userNum) : {};
  const { user } = useSelector((state) => state.auth);
  const userId = user.user._id;
  const [sackData, setStoreSacks] = useState([]);
  // const [onPostSack, setonPostSack] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const navigation = useNavigation();

  const fetchStoreSacks = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${userData}`);
      console.log("Fetched sacks:", data.sacks);
      setStoreSacks(data.sacks);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        fetchStoreSacks();
      }
    }, [userData])
  );

  const filteredSacks = sackData.filter((item) => {
    if (selectedStatus === 'All') return true;
    if (selectedStatus === 'Posted') return item.status === 'posted';
    if (selectedStatus === 'Spoiled') return item.status === 'spoiled';
    if (selectedStatus === 'In trashed') return item.status === 'trashed';
    if (selectedStatus === 'Claimed') return item.status === 'claimed';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <View style={styles.iconGroup}>
            <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
          </View>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.greeting}>Stall</Text>
            <Text style={styles.name}>Data and Details</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 10, marginBottom: 170 }}>
        <View style={styles.drawerContainer}>
          {stallData?.stallImage?.url && (
            <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
          )}
          <View style={styles.detailsBox}>
            <Text style={styles.title}>{stallData?.stallDescription || 'No Description'}</Text>
            <Text style={styles.text}>{stallData?.stallAddress || 'No Address'}</Text>
            <Text style={styles.text}>Stall #: {stallData?.stallNumber || 'N/A'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          {['All', 'Posted', 'Spoiled', 'In trashed', 'Claimed'].map((label) => (
            <TouchableOpacity
              key={label}
              style={{
                backgroundColor: selectedStatus === label ? '#2BA84A' : '#A6D99F',
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                marginHorizontal: 4,
              }}
              onPress={() => setSelectedStatus(label)}
            >
              <Text style={{ fontSize: 12, color: '#1C3B2F', fontWeight: '600' }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {filteredSacks.length > 0 ? (
          <FlatList
            data={filteredSacks}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => (
              <View style={styles.gridCard}>
                <View style={styles.imageBox}>
                  {item?.images?.[0]?.url ? (
                    <Image source={{ uri: item.images[0].url }} style={styles.gridImage} />
                  ) : (
                    <Text style={styles.imgPlaceholder}>IMG</Text>
                  )}
                </View>
                <Text style={styles.wasteTitle}>{item.description} </Text>
                <Text style={styles.kgText}>{item.kilo} kg.</Text>

                <View style={styles.infoBox}>
                  <Text style={styles.cardInfoText}>Stall #: {stallData?.stallNumber}</Text>
                  <Text style={styles.cardInfoText}>Location: {item.location}</Text>
                  <Text style={styles.cardInfoText}>Posted: {new Date(item.createdAt).toLocaleDateString()}</Text>
                  <Text style={styles.cardInfoText}>Spoilage: {new Date(item.dbSpoil).toLocaleDateString()}</Text>
                </View>

                <TouchableOpacity style={styles.detailsButton}>
                  <Text style={styles.detailsText}>View details</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}>
            <Text style={styles.noDataText}>No sacks available</Text>
            <Image
              source={require('../../../../../assets/zero-waste-removebg-preview.png')}
              style={{
                width: 300,
                height: 300,
              }}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
      {userId === userData && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() =>
            router.push({
              pathname: "/components/Vendor/components/Sack/createSack",
              params: { stallNum: JSON.stringify(stallData), userNum: JSON.stringify(userData) },
            })
          }
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SeeStall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9FFF3',
  },
  drawerContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C3B2F',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A2F23',
    padding: 20,
    height: 90,
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
    flexDirection: 'row',
    alignItems: 'center'
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#2F4F3E',
  },

  detailsBox: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },

  text: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 2,
  },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, width: '100%', marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  sackImage: { width: 70, height: 70, borderRadius: 50, marginRight: 15 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 5 },
  cardText: { fontSize: 12, color: '#777', marginBottom: 3 },
  noDataText: { fontSize: 14, color: '#fff', marginTop: 10 },
  bottomContainer: { width: '100%', justifyContent: 'flex-end', paddingBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fff', },
  optionText: { flex: 1, fontSize: 18, marginLeft: 10, color: '#333' },
  optionIcon: { marginLeft: 'auto' },
  gridCard: {
    backgroundColor: '#1C3B2F',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    marginBottom: 15,
  },
  imageBox: {
    backgroundColor: '#2F4F3E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  gridImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  imgPlaceholder: {
    color: '#fff',
    fontWeight: 'bold',
  },
  wasteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  kgText: {
    fontSize: 12,
    color: '#A6D99F',
    marginBottom: 5,
  },
  infoBox: {
    backgroundColor: '#365945',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 8,
  },
  cardInfoText: {
    fontSize: 10,
    color: '#fff',
    marginBottom: 2,
  },
  detailsButton: {
    backgroundColor: '#A6D99F',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 12,
    color: '#1C3B2F',
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2BA84A',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
});