import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import baseURL from '../../../../assets/common/baseURL';
import { BarChart } from 'react-native-gifted-charts';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect, useRouter } from 'expo-router';
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
  const [dailyKilo, setDailyKilo] = useState(0);
  const router = useRouter();
  const [viewMode, setViewMode] = useState('daily');
  const [weeklyData, setWeeklyData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchSackCounts = async () => {
        try {
          const response = await axios.get(`${baseURL}/notifications/get-pickup-request/${userId}`);
          console.log(response.data.pickupSacksCount, 'pickupSacksCount');
          setPostedCount(response.data.postedSacksCount);
          setPickupCount(response.data.pickupSacksCount);
          setClaimedCount(response.data.claimedSacksCount);
        } catch (error) {
          // console.error('Error fetching sack status:', error);
        }
      };

      const fetchStoreSacks = async () => {
        try {
          const { data } = await axios.get(`${baseURL}/sack/get-store-sacks/${userId}`);
          const allSacks = data.sacks;

          const today = new Date().toLocaleDateString('en-CA');

          const todaysSacks = allSacks.filter((sack) => {
            const sackDateStr = new Date(sack.createdAt).toLocaleDateString('en-CA');
            return sackDateStr === today;
          });

          const todayTotal = todaysSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);
          setDailyKilo(todayTotal);

          const totalKilo = allSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);
          setTotalKilo(totalKilo);

          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          const currentMonthSacks = allSacks.filter((sack) => {
            const sackDate = new Date(sack.createdAt);
            return sackDate.getMonth() === currentMonth && sackDate.getFullYear() === currentYear;
          });

          const monthlyTotal = currentMonthSacks.reduce((sum, sack) => sum + parseFloat(sack.kilo || 0), 0);
          setMonthlyAverage(monthlyTotal);

          const monthlyTotals = Array(12).fill(0);
          allSacks.forEach((sack) => {
            const sackDate = new Date(sack.createdAt);
            const month = sackDate.getMonth();
            monthlyTotals[month] += parseFloat(sack.kilo || 0);
          });

          const currentMonthIndex = new Date().getMonth();
          const graphData = monthlyTotals.slice(0, currentMonthIndex + 1).map((value, index) => ({
            value,
            label: new Date(0, index).toLocaleString('default', { month: 'short' }),
            frontColor: '#2BA84A',
          }));
          const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
          });

          const dailyMap = {
            Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0
          };

          allSacks.forEach(sack => {
            const date = new Date(sack.createdAt);
            const isRecent = last7Days.some(d =>
              d.toDateString() === date.toDateString()
            );

            if (isRecent) {
              const day = date.toLocaleDateString('en-US', { weekday: 'short' });
              dailyMap[day] += parseFloat(sack.kilo || 0);
            }
          });

          // Ensure ordered by day
          const orderedDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const weeklyGraphData = orderedDays.map(day => ({
            label: day,
            value: dailyMap[day],
            frontColor: '#2BA84A',
          }));

          setWeeklyData(weeklyGraphData);
          setMonthlyData(graphData);
        } catch (error) {
          // console.error("Error fetching store sacks:", error);
        }
      };

      const fetchNotifications = async () => {
        try {
          const { data } = await axios.get(`${baseURL}/notifications/get-notif/${userId}`);
          const spoiledNotifications = data.notifications.filter(notification =>
            notification.type === 'pickup' || notification.type === 'trashed'
          );
          console.log(spoiledNotifications);
          setNotifications(spoiledNotifications);
        } catch (error) {
          // console.error("Error fetching notifications:", error);
        }
      };
      const fetchAll = () => {
        fetchSackCounts();
        fetchStoreSacks();
        fetchNotifications();
      };
      fetchAll();
      const interval = setInterval(fetchAll, 2000);
      return () => clearInterval(interval);
    }, [user?.user?._id])
  );

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
          <Text style={styles.name}>{user?.user?.name}</Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/components/Vendor/components/Notification/notification')}>
            <AntDesign name="notification" size={18} color="2BA84A" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => setViewMode('daily')}
            style={{
              backgroundColor: viewMode === 'daily' ? '#2BA84A' : '#ccc',
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('monthly')}
            style={{
              backgroundColor: viewMode === 'monthly' ? '#2BA84A' : '#ccc',
              paddingVertical: 6,
              paddingHorizontal: 16,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Monthly</Text>
          </TouchableOpacity>
        </View>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 5,
          color: 'black',
          marginTop: 10
        }}>
          {viewMode === 'monthly' ? 'Monthly Waste' : 'Daily Waste (Last 7 Days)'}
        </Text>
        <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#1A2F23', borderRadius: 10 }}>
          <BarChart
            data={viewMode === 'daily' ? weeklyData : monthlyData}
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
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statLabel}>Kilo Distributed</Text>
            <Text style={styles.statValue}>{totalKilo} <Text style={styles.unit}>kg</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly</Text>
            <Text style={styles.statLabel}>Waste</Text>
            <Text style={styles.statValue}>{monthlyAverage} <Text style={styles.unit}>kg</Text></Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's</Text>
            <Text style={styles.statLabel}>Produced</Text>
            <Text style={styles.statValue}>
              {dailyKilo} <Text style={styles.unit}>kg</Text>
            </Text>
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
          {notifications.slice(0, 5).map((notification, idx) => (
            <View style={styles.notificationCard} key={idx}>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 20 }}>
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
    width: 'auto',
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