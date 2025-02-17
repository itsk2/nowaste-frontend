import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { getAllStalls } from '../(services)/api/Users/getAllStalls';


const Market = () => {
  const [allStalls, setAllStalls] = useState([]);
  const router = useRouter();

  const fetchAllStore = async () => {
    try {
      const data = await getAllStalls();
      setAllStalls(data.stalls);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };
  // console.log(allStalls)

  useFocusEffect(
    useCallback(() => {
      fetchAllStore();
    }, [])
  );
  return (
    <View style={styles.container}>

      <Text style={styles.heading}>
       Taytay, Rizal Market Stalls
      </Text>

      <FlatList
        data={allStalls}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={({ item }) => {
          const stallData = item.stall || item;

          return (
            <View style={styles.card}>
              {stallData.stallImage?.url && (
                <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.text}>🔢 Stall Number: {stallData.stallNumber || "N/A"}</Text>

                <TouchableOpacity
                  style={styles.button}
                  // onPress={() => navigation.navigate("components/Vendor/components/Stall/seeStall", { stallData })}
                  onPress={() => router.push({
                    pathname: "/components/User/components/Stall/seeStall",
                    params: { stall: JSON.stringify(stallData) }, 
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

export default Market;

const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    padding: 15,
    backgroundColor: '#f4f4f4',
    flex: 1,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#ff6f00',
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