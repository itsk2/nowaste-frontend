// components/Header.js
import { router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';

const Header = ({ name }) => {

    const { user } = useSelector((state) => state.auth);
    
    return (
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
                    <Entypo name="shopping-cart" size={22} color="#2BA84A" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push('components/User/components/Chat/Chats')}
                >
                    <MaterialIcons name="chat-bubble-outline" size={22} color="#2BA84A" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#355E3B',
        padding: 20,
        marginTop: 10,
        borderRadius: 20
    },
    greeting: {
        fontSize: 18,
        fontWeight: '500',
        color: '#fff',
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2BA84A',
        marginVertical: 4,
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
});