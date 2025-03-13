import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Icon from "react-native-vector-icons/FontAwesome";
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../../../../assets/common/baseURL';

const SeeStall = () => {
  const { stall, userNum } = useLocalSearchParams();
  const stallData = stall ? JSON.parse(stall) : {};
  const userData = userNum ? JSON.parse(userNum) : {};
  const { user } = useSelector((state) => state.auth);
  const userId = user.user._id;
  const [sackData, setStoreSacks] = useState([]);
  const [onPostSack, setonPostSack] = useState(false);

  const fetchStoreSacks = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${userData}`);
      console.log("Fetched sacks:", data.sacks);
      setStoreSacks(data.sacks); // Ensure data.sacks is an array
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

  return (
    <View style={styles.container}>
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
      {sackData.length > 0 ? (
        <FlatList
          data={sackData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item?.images?.[0]?.url && (
                <Image source={{ uri: item.images[0].url }} style={styles.sackImage} />
              )}
              <View>
                <Text style={styles.cardTitle}>{item.description}</Text>
                <Text style={styles.cardText}>{item.location}</Text>
                <Text style={styles.cardText}>kg: {item.kilo}</Text>
                <Text style={styles.cardText}>📅 Posted: {new Date(item.createdAt).toLocaleDateString()}</Text>
                <Text style={styles.cardText}>🗓 Spoilage Date: {new Date(item.dbSpoil).toLocaleDateString()}</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>No sacks available</Text>
      )}
      {userId === userData && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() =>
              router.push({
                pathname: "components/Vendor/components/Sack/createSack",
                params: { stallNum: JSON.stringify(stallData?.stallNumber) },
              })
            }
          >
            <MaterialCommunityIcons name='sack' size={24} color='#4caf50' />
            <Text style={styles.optionText}>Post a Sack</Text>
            <Icon name='angle-right' size={24} color='#999' style={styles.optionIcon} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SeeStall;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#F8F8F8' },
  drawerContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', marginBottom: 20 },
  image: { width: '100%', height: 180, borderRadius: 12, marginBottom: 15 },
  detailsBox: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
  text: { fontSize: 14, color: '#555', marginBottom: 5 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, width: '100%', marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  sackImage: { width: 70, height: 70, borderRadius: 50, marginRight: 15 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 5 },
  cardText: { fontSize: 12, color: '#777', marginBottom: 3 },
  noDataText: { fontSize: 14, color: '#777', marginTop: 10 },
  bottomContainer: { width: '100%', justifyContent: 'flex-end', paddingBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#fff', marginBottom: 10 },
  optionText: { flex: 1, fontSize: 18, marginLeft: 10, color: '#333' },
  optionIcon: { marginLeft: 'auto' },
});