import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import baseURL from '../../assets/common/baseURL';
import { useFocusEffect, useRouter } from 'expo-router';
import Header from '../components/Header';

const index = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.user?._id
  const router = useRouter();


  const [wasteCollected, setWasteCollected] = useState(0);
  const [monthlyWasteCollected, setMonthlyWasteCollected] = useState(0);
  const [activePickupRequest, setActivePickupRequest] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fetchPickupSacks = async () => {
    try {
      const res = await axios.get(`${baseURL}/sack/get-pickup-sacks/${userId}`);
      const pickups = res.data.pickUpSacks;

      const completedPickups = pickups.filter(p => p.status === 'completed');
      const requestedPickups = pickups.filter(p => p.status !== 'completed');

      let total = 0;
      let thisMonthTotal = 0;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      completedPickups.forEach(pickup => {
        const kilo = parseFloat(pickup.totalKilo || 0);
        total += kilo;

        const pickupDate = new Date(pickup.pickupTimestamp);
        if (
          pickupDate.getFullYear() === currentYear &&
          pickupDate.getMonth() === currentMonth
        ) {
          thisMonthTotal += kilo;
        }
      });

      setWasteCollected(total);
      setMonthlyWasteCollected(thisMonthTotal);
      setActivePickupRequest(requestedPickups.length)
    } catch (error) {
      console.error('Error getting Pickups:', error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/notifications/get-notif`);

      const newSackNotifications = data.notifications.filter(notification => notification.type === 'new_sack');


      setNotifications(newSackNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.replace('/auth/login');
        return;
      }

      fetchPickupSacks();
      fetchNotifications();

      const interval = setInterval(() => {
        fetchPickupSacks();
        fetchNotifications();
      }, 3000);

      return () => clearInterval(interval);
    }, [userId])
  );
  console.log(user, 'USER')



  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  if (!user) {
    return null; // Or show a loading spinner / fallback UI
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Header />

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Collected</Text>
          <Text style={styles.statValue}>{wasteCollected} <Text style={styles.unit}>kg</Text></Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Monthly Average</Text>
          <Text style={styles.statValue}>{monthlyWasteCollected} <Text style={styles.unit}>kg</Text></Text>
        </View>
      </View>
      <View style={[styles.statCard, styles.fullWidthCard]}>
        <Text style={styles.statLabel}>Active Requests</Text>
        <Text style={styles.statValue}>{activePickupRequest}</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Available Sacks</Text>
      {notifications.slice(0, 3).map((notification, idx) => (
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
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Optional dark overlay for readability
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 10,
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginHorizontal: 5,
  },
  fullWidthCard: {
    marginHorizontal: 0,
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  unit: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#111827",
  },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    backgroundColor: '#D1FAE5',
    padding: 10,
    borderRadius: 999,
  },
  iconText: {
    fontSize: 20,
  },
  notificationRight: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});


export default index;