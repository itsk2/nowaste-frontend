import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    Modal, StyleSheet, ScrollView, Alert, Platform
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import baseURL from '../../../../assets/common/baseURL';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function MarketList() {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [isFiltering, setIsFiltering] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editItemId, setEditItemId] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', category: '', price: '' });
    const [fromDate, setFromDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' }).toLowerCase();

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${baseURL}/item/get-items`);
            setItems(response.data.items);
        } catch (err) {
            console.error('Error fetching items:', err.message);
        }
    };
    useEffect(() => {
        fetchItems();
        const timer = setInterval(fetchItems, 5000);
        return () => clearInterval(timer);
    }, []);


    const handleInputChange = (name, value) => {
        setNewItem(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async () => {
        try {
            if (editItemId) {
                await axios.put(`${baseURL}/item/item-update/${editItemId}`, newItem);
            } else {
                await axios.post(`${baseURL}/item/item-create`, {
                    ...newItem,
                    day: days.reduce((acc, day) => ({ ...acc, [day]: [] }), {})
                });
            }
            fetchItems();
            closeModal();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditItemId(item._id);
            setNewItem({ name: item.name, category: item.category, price: '' });
        } else {
            setEditItemId(null);
            setNewItem({ name: '', category: '', price: '' });
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setNewItem({ name: '', category: '', price: '' });
        setEditItemId(null);
    };

    const filterByDate = () => {
        if (!fromDate) return;
        setIsFiltering(true);
        const selectedDate = new Date(fromDate).toISOString().split('T')[0];
        const filtered = items.map(item => {
            const newDayData = {};
            let hasPriceForDate = false;

            for (const day of days) {
                const filteredEntries = item.day[day].filter(entry => {
                    const entryDate = new Date(entry.date).toISOString().split('T')[0];
                    return entryDate === selectedDate;
                });

                if (filteredEntries.length > 0) {
                    hasPriceForDate = true;
                }

                newDayData[day] = filteredEntries;
            }

            return hasPriceForDate ? { ...item, day: newDayData } : null;
        }).filter(Boolean);

        setFilteredItems(filtered);
    };

    const dataToRender = isFiltering ? filteredItems : items;
    const groupedItems = dataToRender.reduce((acc, item) => {
        const category = item.category.charAt(0).toUpperCase() + item.category.slice(1);
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Market Price List</Text>

            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                    <Text style={styles.dateText}>{fromDate ? new Date(fromDate).toDateString() : 'Select Date'}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        mode="date"
                        display="default"
                        value={fromDate ? new Date(fromDate) : new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (selectedDate) setFromDate(selectedDate);
                        }}
                    />
                )}

                <TouchableOpacity style={styles.filterButton} onPress={filterByDate}>
                    <Text>Filter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={() => {
                    setFromDate(null);
                    setFilteredItems([]);
                    setIsFiltering(false);
                }}>
                    <Text>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                    <Text style={{ fontWeight: 'bold' }}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {Object.entries(groupedItems).map(([category, group]) => (
                <View key={category} style={styles.categoryBlock}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    {group.map((item, i) => (
                        <View key={item._id || i} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.name}</Text>

                            <View style={styles.dayHeader}>
                                {days.map(day => (
                                    <Text key={day} style={styles.dayLabel}>
                                        {day.slice(0, 3).toUpperCase()}
                                    </Text>
                                ))}
                            </View>

                            <View style={styles.dayPrices}>
                                {days.map(day => {
                                    const latestPrice = item.day[day]?.[item.day[day].length - 1]?.price;
                                    const isToday = day === today;

                                    return (
                                        <Text
                                            key={day}
                                            style={[
                                                styles.dayPrice,
                                                isToday && latestPrice ? styles.highlightedPrice : null
                                            ]}
                                        >
                                            {latestPrice || '-'}
                                        </Text>
                                    );
                                })}
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => openModal(item)}><Text>✏️</Text></TouchableOpacity>
                                <TouchableOpacity onPress={async () => {
                                    await axios.delete(`${baseURL}/item/delete/${item._id}`);
                                    fetchItems();
                                }}><Text>🗑️</Text></TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            {isFiltering && filteredItems.length === 0 && (
                <Text style={styles.noData}>No price data found for the selected date.</Text>
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <TextInput
                            placeholder="Item name"
                            style={styles.input}
                            value={newItem.name}
                            onChangeText={text => handleInputChange('name', text)}
                        />
                        <TextInput
                            placeholder="Category (e.g. vegetable)"
                            style={styles.input}
                            value={newItem.category}
                            onChangeText={text => handleInputChange('category', text)}
                        />
                        <TextInput
                            placeholder={`Price for ${today}`}
                            style={styles.input}
                            value={newItem.price}
                            onChangeText={text => handleInputChange('price', text)}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
                            <Text>{editItemId ? 'Update' : 'Add'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={closeModal}><Text style={{ marginTop: 10 }}>Cancel</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#064E3B', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    dateButton: { backgroundColor: '#D1FAE5', padding: 8, borderRadius: 6 },
    dateText: { color: '#000' },
    filterButton: { backgroundColor: '#FCD34D', padding: 8, borderRadius: 6 },
    resetButton: { backgroundColor: '#E5E7EB', padding: 8, borderRadius: 6 },
    addButton: { backgroundColor: '#6EE7B7', padding: 8, borderRadius: 6 },
    categoryBlock: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 8, padding: 8 },
    categoryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    itemRow: { marginBottom: 12 },
    itemName: { fontWeight: 'bold', marginBottom: 4 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    dayLabel: { width: 45, textAlign: 'center', fontSize: 12, fontWeight: '600' },
    dayPrices: { flexDirection: 'row', justifyContent: 'space-between' },
    dayPrice: { width: 45, textAlign: 'center', fontSize: 12 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
    modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContainer: { width: 300, backgroundColor: '#fff', borderRadius: 10, padding: 16 },
    input: { backgroundColor: '#E5E7EB', padding: 10, marginBottom: 10, borderRadius: 6 },
    submitButton: { backgroundColor: '#6EE7B7', padding: 10, borderRadius: 6, alignItems: 'center' },
    noData: { color: '#fff', marginTop: 10, textAlign: 'center' },
    highlightedPrice: {
        color: 'rgba(18, 149, 9, 0.99)', // emerald green
        fontWeight: 'bold',
    },
});