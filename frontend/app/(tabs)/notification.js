import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import baseURL from '../../assets/common/baseURL';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id;
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await axios.get(`${baseURL}/notifications/users-get-notif/${userId}`);
                console.log(data.notifications)
                setNotifications(data.notifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
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
        </View>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        padding: 20,
        marginTop: 15,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    notificationCard: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    notificationText: {
        fontSize: 16,
        color: "#333",
    },
    message: {
        fontSize: 16,
    },
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