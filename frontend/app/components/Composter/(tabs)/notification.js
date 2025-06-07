import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import baseURL from '../../../../assets/common/baseURL';
import { timeAgo } from '../../../../utils/timeAgo'; // Ensure this path is correct
import { router, useFocusEffect } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id;

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
            if (notifications) {
                fetchNotifications();
                const interval = setInterval(() => {
                    fetchNotifications();
                }, 2000);
                return () => clearInterval(interval);
            }
        }, [notifications])
    );

    const renderItem = ({ item }) => (
        <>
            <TouchableOpacity
                key={item._id || idx} // ✅ key moved here
                onPress={() =>
                    router.push({
                        pathname: "/components/User/components/Stall/seeStall",
                        params: { stall: JSON.stringify(item.stall) },
                    })
                }
            >
                <View style={styles.notificationCard}>
                    <Ionicons name="notifications-outline" size={24} color="white" style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text style={styles.messageText}>{item.message}</Text>
                        <Text style={styles.timestamp}>{timeAgo(new Date(item.createdAt))}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </>
    );

    return (
        <>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.greeting}>Composter</Text>
                        <Text style={styles.name}>Notifications</Text>
                    </View>
                    <View style={styles.iconGroup}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('components/Composter/components/MySack/mySack')}
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
                <View style={{ padding: 10, marginBottom: 100 }}>
                    {notifications.length === 0 ? (
                        <Text style={styles.noNotifications}>No notifications</Text>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item._id}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
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
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#1c3d2e',
        padding: 10,
    },
    headerContainer: {
        marginBottom: 5,
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