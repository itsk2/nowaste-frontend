import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import baseURL from '../../../../assets/common/baseURL';
import { BarChart } from 'react-native-gifted-charts';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
const ITEMS_PER_PAGE = 5;

const index = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.user?._id;
  const [postedCounts, setPostedCount] = useState(0);
  const [pickupCount, setPickupCount] = useState(0);
  const [claimedCount, setClaimedCount] = useState(0);
  const [totalKilo, setTotalKilo] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [selectedMonthInfo, setSelectedMonthInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();


  useEffect(() => {
    const fetchSackCounts = async () => {
      try {
        const response = await axios.get(`${baseURL}/notifications/get-pickup-request/${userId}`);
        setPostedCount(response.data.postedSacksCount);
        setPickupCount(response.data.pickupSacksCount);
        setClaimedCount(response.data.claimedSacksCount);
        // console.log(response)
      } catch (error) {
        // console.error('Error fetching sack status:', error);
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

        const monthlyTotals = Array(12).fill(0);

        allSacks.forEach((sack) => {
          const sackDate = new Date(sack.createdAt);
          const month = sackDate.getMonth(); // 0 = January
          monthlyTotals[month] += parseFloat(sack.kilo || 0);
        });

        const currentMonthIndex = new Date().getMonth(); // 0 = January

        const graphData = monthlyTotals
          .slice(0, currentMonthIndex + 1)
          .map((value, index) => ({
            value,
            label: new Date(0, index).toLocaleString('default', { month: 'short' }),
            frontColor: '#2BA84A',
          }));

        setMonthlyData(graphData);

        setMonthlyAverage(monthlyTotal);

      } catch (error) {
        // console.error("Error fetching:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${baseURL}/notifications/get-notif`);
        const spoiledNotifications = data.notifications.filter(notification => notification.type === 'trashed' || notification.type === 'pickup' || notification.type === 'spoiled');
        // console.log(spoiledNotifications);
        setNotifications(spoiledNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    fetchSackCounts();
    fetchStoreSacks();
  }, [user?.user?._id]);
  const handleBarPress = (item) => {
    setSelectedMonthInfo(`Month: ${item.label}, Total: ${item.value} kg`);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


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

  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIdx = currentPage * ITEMS_PER_PAGE;
  const currentItems = notifications.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <ScrollView style={styles.container}>
      {/* Header Section with Background and Greeting */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.greeting}>Welcome</Text>
          <Text style={styles.name}>{user.user.name}</Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/components/Vendor/components/Notification/notification')}>
            <AntDesign name="notification" size={18} color="2BA84A" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={styles.sectionTitle}>Monthly Waste</Text>
        <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#1A2F23', borderRadius: 10 }}>
          <BarChart
            data={monthlyData}
            barWidth={24}
            spacing={14}
            roundedTop
            hideRules
            yAxisThickness={0}
            xAxisColor="#ccc"
            onPress={handleBarPress}
            yAxisTextStyle={{ color: '#fff' }}
            xAxisLabelTextStyle={{ color: '#fff' }}
          />
          {selectedMonthInfo && (
            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: 'bold', color: '#2BA84A', textAlign: 'center' }}>
              {selectedMonthInfo}
            </Text>
          )}
        </View>
        {/* Stats Cards Section */}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Kilo Distributed</Text>
            <Text style={styles.statValue}>{totalKilo} <Text style={styles.unit}>kg</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly Waste</Text>
            <Text style={styles.statValue}>{monthlyAverage} <Text style={styles.unit}>kg</Text></Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Posted Sacks</Text>
            <Text style={styles.statValue}>{postedCounts}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Pickup</Text>
            <Text style={styles.statValue}>{pickupCount}</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Recent Notification at Stall</Text>
        <View>
          {currentItems.map((notification, idx) => (
            <View style={styles.notificationCard}>
              <View style={styles.notificationLeft}>
                <View style={styles.notificationIcon}>
                  <Text style={styles.iconText}>🔔</Text>
                </View>
              </View>
              <View style={styles.notificationRight}>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>
                  {timeAgo(notification.createdAt)}
                </Text>
              </View>
            </View>
          ))}

          {/* Pagination Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              style={[styles.paginationButton, currentPage === 0 && { opacity: 0.5 }]}
            >
              <Text style={styles.paginationText}>← Previous</Text>
            </TouchableOpacity>

            <Text style={styles.pageIndicator}>
              Page {currentPage + 1} of {totalPages}
            </Text>

            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              style={[styles.paginationButton, currentPage >= totalPages - 1 && { opacity: 0.5 }]}
            >
              <Text style={styles.paginationText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9FFF3',
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

  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
    justifyContent: 'center'
  },
  statCard: {
    backgroundColor: '#203529',
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: 170,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 14,
    color: 'white',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9EE6B8',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9EE6B8',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
  },

  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#203529',
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
    color: 'white',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
export default index;