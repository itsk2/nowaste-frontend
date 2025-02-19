import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const SeeStall = () => {
  const { stall } = useLocalSearchParams();
  const stallData = stall ? JSON.parse(stall) : {};

  const sackData = {
    description: "A sack filled with mixed vegetable waste, at 50% capacity.",
    location: "📍 Taytay Market, Rizal City",
    postedDate: "2024-02-13",
  };

//   const getAvailabilityStatus = (postedDate) => {
//     const today = new Date();
//     const postDate = new Date(postedDate);
//     const daysAgo = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));

//     return daysAgo >= 3 ? "❌ Not Available" : "✅ Available";
//   };

  return (
    <View style={styles.container}>
      <View style={styles.drawerContainer}>
        {stallData?.stallImage?.url && (
          <Image source={{ uri: stallData.stallImage.url }} style={styles.image} />
        )}

        <View style={styles.detailsBox}>
          <Text style={styles.title}>{stallData?.stallDescription || "No Description"}</Text>
          <Text style={styles.text}>{stallData?.stallAddress || "No Address"}</Text>
          <Text style={styles.text}>Stall #: {stallData?.stallNumber || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name="sack-percent" size={40} color="green" style={styles.icon} />
        </View>
        <View style={styles.content}>
          <Text style={styles.cardTitle}>{sackData.description}</Text>
          <Text style={styles.cardText}>{sackData.location}</Text>
          <Text style={styles.cardText}>📅 Posted: {sackData.postedDate}</Text>

          {/* <View
            style={[
              styles.statusBadge,
              getAvailabilityStatus(sackData.postedDate) === "✅ Available" ? styles.available : styles.unavailable,
            ]}
          >
            <Text style={styles.statusText}>{getAvailabilityStatus(sackData.postedDate)}</Text>
          </View> */}
        </View>
      </View>

      {/* <TouchableOpacity style={styles.button} onPress={() => console.log("View More")}>
        <Text style={styles.buttonText}>View More</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default SeeStall;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F8F8', // Light background
  },
  drawerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  detailsBox: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: -10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 3,
  },
  statusBadge: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  available: {
    backgroundColor: '#4CAF50',
  },
  unavailable: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
