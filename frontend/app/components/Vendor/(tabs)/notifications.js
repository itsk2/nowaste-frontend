import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import baseURL from '../../../../assets/common/baseURL';
import { useFocusEffect } from 'expo-router';

const Notification = () => {
  const { user } = useSelector((state) => state.auth);
  const userId = user.user._id
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${baseURL}/notifications/get-notif/${user.user._id}`);
      setNotifications(data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchNotifications();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchNotifications();
        const interval = setInterval(() => {
          fetchNotifications();
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [userId])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.noNotifications}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.notificationCard}>
              <Text style={styles.notificationText}>{item.message}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  noNotifications: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  notificationCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
});