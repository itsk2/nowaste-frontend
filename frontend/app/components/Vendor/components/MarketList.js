import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MarketList = () => {
    const [items, setItems] = useState([]);
    const navigation = useNavigation();

    const fetchItems = async () => {
        try {
            const res = await axios.get(`${baseURL}/item/get-items`);
            setItems(res.data.items);
        } catch (error) {
            console.error("Error fetching items:", error.message);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const groupedItems = items.reduce((acc, item) => {
        const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <View style={styles.iconGroup}>
                        <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.greeting}>Market</Text>
                        <Text style={styles.name}>Price</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>Market Price List For This Week</Text>

                {Object.entries(groupedItems).map(([category, items]) => (
                    <View key={category} style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>{category}</Text>

                        {items.map((item, index) => (
                            <View key={index} style={styles.itemCard}>
                                <Text style={styles.itemName}>{item.name}</Text>

                                <View style={styles.dayRow}>
                                    {days.map((day, i) => {
                                        const dayKey = day.toLowerCase();
                                        const latestPrice = item.day?.[dayKey]?.[item.day[dayKey].length - 1]?.price ?? '-';
                                        const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' }).toLowerCase();
                                        return (
                                            <View key={i} style={styles.dayCol}>
                                                <Text style={styles.dayLabel}>{day.slice(0, 3)}</Text>
                                                <Text style={[
                                                    styles.dayPrice,
                                                    dayKey === today && latestPrice !== '-' ? styles.highlightedPrice : null
                                                ]}>
                                                    {latestPrice}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9FFF3',
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
    highlightedPrice: {
        color: 'rgba(18, 149, 9, 0.99)',
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 8,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0A4724',
        textAlign: 'center',
        marginBottom: 20,
    },
    categoryContainer: {
        marginBottom: 24,
        backgroundColor: '#e5e7eb',
        padding: 10,
        borderRadius: 10,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#1f2937',
    },
    dayRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    dayCol: {
        alignItems: 'center',
        width: '13%',
    },
    dayLabel: {
        fontSize: 12,
        color: '#6b7280', // text-gray-500
    },
    dayPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
});

export default MarketList;