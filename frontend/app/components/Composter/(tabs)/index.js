import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import baseURL from '../../../../assets/common/baseURL';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useFocusEffect, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BarChart } from 'react-native-gifted-charts';
const ITEMS_PER_PAGE = 5;

const index = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.user?._id;
  const router = useRouter()
  const [monthlyWasteData, setMonthlyWasteData] = useState([]);
  const [wasteCollected, setWasteCollected] = useState(0);
  const [monthlyWasteCollected, setMonthlyWasteCollected] = useState(0);
  const [activePickupRequest, setActivePickupRequest] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Transform data for BarChart (dummy example for last 6 months)
  const prepareChartData = (pickups) => {
    // Get last 6 months labels and sum kilos
    const now = new Date();
    const monthsLabels = [];
    const dataMap = new Map();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = date.toLocaleString('default', { month: 'short' });
      monthsLabels.push(label);
      dataMap.set(label, 0);
    }

    pickups.forEach(pickup => {
      if (pickup.status === 'completed') {
        const pickupDate = new Date(pickup.pickupTimestamp);
        const label = pickupDate.toLocaleString('default', { month: 'short' });
        if (dataMap.has(label)) {
          dataMap.set(label, dataMap.get(label) + parseFloat(pickup.totalKilo || 0));
        }
      }
    });

    return monthsLabels.map(label => ({
      value: dataMap.get(label),
      label,
      frontColor: '#2BA84A',
    }));
  };

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
      setMonthlyWasteData(prepareChartData(pickups));

    } catch (error) {
      console.error('Error getting Pickups:', error.message);
    }
  };


  const fetchSacks = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/sack/get-sacks`);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/notifications/get-notif`);
      const spoiledNotifications = data.notifications.filter(notification => notification.type === 'spoiled');
      // console.log(spoiledNotifications);
      setNotifications(spoiledNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchSacks();
        fetchNotifications();
        const interval = setInterval(() => {
          fetchSacks();
          fetchNotifications();
        }, 2000);
        return () => clearInterval(interval);
      }
    }, [userId])
  );

  useEffect(() => {
    fetchPickupSacks();
  }, [userId]);
  // console.log(notifications, 'Notif')

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const currentItems = notifications.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0) return `${count} ${i.label}${count !== 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };

  // console.log(notifications,'notifications')

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 25 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.name}>{user?.user?.name}</Text>
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
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Monthly Waste Collected (kg)</Text>
        <BarChart
          data={monthlyWasteData}
          barWidth={16}
          spacing={28}
          height={220}
          initialSpacing={10}
          roundedTop
          yAxisTextStyle={styles.axisText}
          xAxisTextStyle={styles.axisText}
          noOfSections={5}
          maxValue={Math.max(...monthlyWasteData.map(d => d.value), 20)}
          labelsExtraHeight={15}
          frontColor="#2BA84A"
          showVerticalLines
        />
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Collected</Text>
          <Text style={styles.statValue}>
            {wasteCollected} <Text style={styles.unit}>kg</Text>
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Monthly Average</Text>
          <Text style={styles.statValue}>
            {monthlyWasteCollected} <Text style={styles.unit}>kg</Text>
          </Text>
        </View>
      </View>
      <View style={[styles.statCard, styles.fullWidthCard]}>
        <Text style={styles.statLabel}>Active Requests</Text>
        <Text style={styles.statValue}>{activePickupRequest}</Text>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Recent Available Sacks</Text>
      <View>
        {notifications.length > 0 && (
          <TouchableOpacity
            key={notifications[0]._id || idx} // ✅ key moved here
            onPress={() =>
              router.push({
                pathname: "/components/Composter/components/Stall/seeStall",
                params: { stall: JSON.stringify(notifications[0].stall) },
              })
            }
          >
            <View style={styles.notificationCard}>
              <View style={styles.notificationLeft}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.iconText}>🔔</Text>
                </View>
              </View>
              <View style={styles.notificationRight}>
                <Text style={styles.notificationMessage}>{notifications[0].message}</Text>
                <Text style={styles.notificationTime}>
                  {timeAgo(notifications[0].createdAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9FFF3',
  },

  // Header
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
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ccc',
    borderRadius: 6,
  },
  paginationText: {
    fontSize: 14,
    color: '#333',
  },
  pageIndicator: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
  },

  // Chart
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2BA84A',
    marginBottom: 14,
    textAlign: 'center',
  },
  axisText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 18,
    backgroundColor: '#2A4535',
    borderRadius: 16,
    marginVertical: 8,
    elevation: 2,
  },
  fullWidthCard: {
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2BA84A',
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#2BA84A',
  },

  // Notifications
  notificationCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#2A4535',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  notificationLeft: {
    marginRight: 10,
    justifyContent: 'center',
  },
  notificationIcon: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 999,
  },
  iconText: {
    fontSize: 16,
  },
  notificationRight: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#fff',
  },
});

export default index;