import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import baseURL from '../../../../assets/common/baseURL';

const index = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.user?._id;
  const [postedCounts, setPostedCount] = useState(0);
  const [pickupCount, setPickupCount] = useState(0);
  const [claimedCount, setClaimedCount] = useState(0);
  const [totalKilo, setTotalKilo] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchSackCounts = async () => {
      try {
        const response = await axios.get(`${baseURL}/notifications/get-pickup-request/${userId}`);
        setPostedCount(response.data.postedSacksCount);
        setPickupCount(response.data.pickupSacksCount);
        setClaimedCount(response.data.claimedSacksCount);
        // console.log(response)
      } catch (error) {
        console.error('Error fetching sack status:', error);
      }
    };
    const fetchStoreSacks = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${userId}`);
        console.log("Fetched sacks:", data.sacks);

        const allSacks = data.sacks;

        // Calculate total kilos
        const totalKilo = allSacks.reduce((sum, sack) => {
          return sum + parseFloat(sack.kilo || 0);
        }, 0);
        setTotalKilo(totalKilo);

        // Get current month and year
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Filter sacks for current month
        const currentMonthSacks = allSacks.filter((sack) => {
          const sackDate = new Date(sack.createdAt);
          return sackDate.getMonth() === currentMonth && sackDate.getFullYear() === currentYear;
        });

        // Calculate monthly total
        const monthlyTotal = currentMonthSacks.reduce((sum, sack) => {
          return sum + parseFloat(sack.kilo || 0);
        }, 0);
        setMonthlyAverage(monthlyTotal);

      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/notifications/users-get-notif/${userId}`);

        const newSackNotifications = data.notifications.filter(notification => notification.type === 'pickup');

        console.log(newSackNotifications);
        setNotifications(newSackNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    fetchSackCounts();
    fetchStoreSacks();
  }, [user?.user?._id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScrollView style={styles.container}
      contentContainerStyle={{ padding: 20, paddingBottom: 25 }} // allow scrolling past bottom

    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome,</Text>
        <Text style={styles.name}>{user.user.name}</Text>
        <Text style={styles.subtitle}>
          Track and manage your waste collections efficiently
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Collected</Text>
          <Text style={styles.statValue}>{totalKilo} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Monthly Waste</Text>
          <Text style={styles.statValue}>{monthlyAverage} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Posted Sacks</Text>
          <Text style={styles.statValue}>{postedCounts}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Pickup Requests</Text>
          <Text style={styles.statValue}>{pickupCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Claimed Requests</Text>
          <Text style={styles.statValue}>{claimedCount}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Available Sacks</Text>
      {notifications.map((notification, idx) => (
        <View key={notification._id || idx} style={styles.notificationCard}>
          <View style={styles.notificationLeft}>
            <View style={styles.notificationIcon}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
          </View>
          <View style={styles.notificationRight}>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTime}>
              {new Date(notification.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: "600" },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { color: "#666", fontSize: 14 },

  statsContainer: {
    flexDirection: "column",
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },
  statLabel: { color: "#666", fontSize: 14 },
  statValue: { fontSize: 22, fontWeight: "bold" },
  unit: { fontSize: 14, fontWeight: "400" },

  quickActionsTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  primaryButton: {
    backgroundColor: "#2BA84A",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  outlineButton: {
    borderColor: "#2BA84A",
    borderWidth: 1.5,
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  outlineButtonText: { color: "#2BA84A", fontWeight: "bold" },

  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  sackItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#2BA84A",
  },
  sackInfo: { flexDirection: "row", alignItems: "center" },
  sackIcon: {
    backgroundColor: "#2BA84A",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sackIconText: { fontSize: 18, color: "#fff" },
  sackName: { fontWeight: "bold" },
  sackWeight: { color: "#666", fontSize: 12 },
  timeLeft: { color: "red", fontSize: 12, fontWeight: "600" },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  notificationLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 50,
  },
  iconText: {
    fontSize: 20,
  },
  notificationRight: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
});


export default index;