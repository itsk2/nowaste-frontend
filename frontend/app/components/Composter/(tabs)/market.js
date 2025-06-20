import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { getAllStalls } from '../../../(services)/api/Users/getAllStalls';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Market = () => {
  const [allStalls, setAllStalls] = useState([]);
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

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
      fetchAllStore();
    }, [])
  );
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
            onPress={() => router.push('components/Composter/components/MySack/mySack')}
          >
            <Entypo name="shopping-cart" size={18} color="#2BA84A" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('components/Composter/components/Chat/Chats')}
          >
            <MaterialIcons name="chat-bubble-outline" size={18} color="#2BA84A" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ padding: 15, marginBottom: 80 }}>
        <FlatList
          data={allStalls}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={({ item }) => {
            const stallData = item.stall || item;
            const isOpen = stallData.status === "open";
            return (
              <View style={styles.card}>
                {stallData.stallImage?.url && (
                  <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
                )}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: isOpen ? "#4CAF50" : "#F44336" }]}>
                      <Text style={styles.statusText}>{isOpen ? "Open" : "Closed"}</Text>
                    </View>
                  </View>
                  <Text style={{ color: 'white' }}>🆔 {stallData.stallNumber || "N/A"}</Text>
                  <Text style={{ color: 'white' }}>📍 {stallData.location || "Taytay, Rizal New Market"}</Text>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push({
                      pathname: "/components/Composter/components/Stall/seeStall",
                      params: { stall: JSON.stringify(stallData) },
                    })}
                  >
                    <Text style={styles.buttonText}>View Stall</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default Market;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E9FFF3', // Optional dark overlay for readability
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
  toggleButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  card: {
    backgroundColor: '#2A4535',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 15,
    backgroundColor: '#2A4535',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#00C853', // Green button like in your image
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});