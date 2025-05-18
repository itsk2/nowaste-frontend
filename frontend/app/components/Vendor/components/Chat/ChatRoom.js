import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import { sendMessage, subscribeToMessages } from "../../../../../firebase/chatService";
import { generateRoomId } from "../../../../../utils/generateRoom";
import { useLocalSearchParams } from 'expo-router';
import axios from "axios";
import baseURL from "../../../../../assets/common/baseURL";
import { timeAgo } from "../../../../../utils/timeAgo"

const VendorChatRoom = () => {
    const { vendorId, customerId } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [participants, setParticipants] = useState([]);

    const roomId = generateRoomId(vendorId, customerId);

    useEffect(() => {
        const fetchChatParticipants = async () => {
            try {
                const response = await axios.get(`${baseURL}/chat-users`, {
                    params: {
                        ids: `${vendorId},${customerId}`
                    }
                });
                setParticipants(response.data);
            } catch (error) {
                console.error("Failed to fetch chat users:", error);
            }
        };

        fetchChatParticipants();
    }, [vendorId, customerId]);

    useEffect(() => {
        // Subscribe to messages in this room
        const unsubscribe = subscribeToMessages(roomId, setMessages);
        return () => unsubscribe();
    }, [roomId]);

    const handleSend = async () => {
        if (inputText.trim() === "") return;

        try {
            await sendMessage(roomId, vendorId, customerId, inputText.trim());
            setInputText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };


    const renderItem = ({ item }) => {
        const isSender = item.senderId === vendorId;
        const sender = participants.find((p) => p._id === item.senderId);
        const avatarUrl = sender?.avatar?.url || "https://via.placeholder.com/40";
        const senderName = sender?.name || "Unknown";

        return (
            <View style={[styles.messageRow, isSender ? styles.myMessageRow : styles.otherMessageRow]}>
                {!isSender && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
                <View style={isSender ? styles.myMessage : styles.otherMessage}>
                    <Text style={styles.senderName}>{senderName}</Text>
                    <Text>{item.text}</Text>
                    <Text style={styles.timestamp}>
                        {item.timestamp ? timeAgo(item.timestamp.toDate()) : ''}
                    </Text>
                </View>
                {isSender && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
            </View>
        );
    };


    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={handleSend} />
            </View>
        </View>
    );
};

export default VendorChatRoom;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    inputContainer: { flexDirection: "row", alignItems: "center" },
    input: { flex: 1, borderColor: "gray", borderWidth: 1, borderRadius: 20, paddingHorizontal: 10 },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#DCF8C6",
        borderRadius: 10,
        padding: 8,
        marginVertical: 4,
        maxWidth: "75%",
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#E2E2E2",
        borderRadius: 10,
        padding: 8,
        marginVertical: 4,
        maxWidth: "75%",
    },
    timestamp: {
        fontSize: 10,
        color: "gray",
        marginTop: 2,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 6,
        maxWidth: "100%",
    },

    myMessageRow: {
        alignSelf: "flex-end",
        flexDirection: "row-reverse",
    },

    otherMessageRow: {
        alignSelf: "flex-start",
        flexDirection: "row",
    },

    avatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginHorizontal: 5,
    },

    senderName: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 4,
    },
});
