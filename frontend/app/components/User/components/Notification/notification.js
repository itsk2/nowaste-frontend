import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import Footer from '../../../Footer';
import Header from '../../../Header';
import baseURL from '../../../../../assets/common/baseURL';
import { timeAgo } from '../../../../../utils/timeAgo'; // Ensure this path is correct
import { router, useNavigation } from 'expo-router';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id;
    const navigation = useNavigation();
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await axios.get(`${baseURL}/notifications/users-get-notif/${userId}`);
                setNotifications(data.notifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.notificationCard}>
            <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
            <View style={styles.textContainer}>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.timestamp}>{timeAgo(new Date(item.createdAt))}</Text>
            </View>
        </View>
    );

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <View style={styles.iconGroup}>
                            <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.greeting}>Sacks</Text>
                            <Text style={styles.name}>Notifications</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 15 }}>
                    {notifications.length === 0 ? (
                        <Text style={styles.noNotifications}>No notifications</Text>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item._id}
                            renderItem={renderItem}
                        />
                    )}
                </View>
            </View>
        </>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2F23',
        padding: 20,
        height: 90,
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
        flexDirection: 'row',
        alignItems: 'center'
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#fff',
        backgroundColor: '#1c3d2e',
        padding: 10,
        borderRadius: 6,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3e744a',
        borderRadius: 10,
        padding: 15,
        marginVertical: 6,
    },
    icon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    messageText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#e0e0e0',
        marginTop: 4,
    },
    button: {
        backgroundColor: '#ffffff30',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    noNotifications: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        color: '#777',
    },
});