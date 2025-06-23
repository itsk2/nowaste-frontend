import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { sendMessage, subscribeToMessages } from "../../../../../firebase/chatService";
import { generateRoomId } from "../../../../../utils/generateRoom";
import baseURL from '../../../../../assets/common/baseURL';
import axios from 'axios';
import { timeAgo } from "../../../../../utils/timeAgo"
import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';

const ChatRoom = () => {
    const { userId, receiverId } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [participants, setParticipants] = useState([]);
    const flatListRef = useRef();

    const roomId = generateRoomId(userId, receiverId);

    useEffect(() => {
        const fetchChatParticipants = async () => {
            try {
                const response = await axios.get(`${baseURL}/chat-users`, {
                    params: {
                        ids: `${userId},${receiverId}`
                    }
                });
                setParticipants(response.data);
            } catch (error) {
                // console.error("Failed to fetch chat users:", error);
            }
        };

        fetchChatParticipants();
    }, [userId, receiverId]);

    useEffect(() => {
        if (!roomId) return;
        const unsubscribe = subscribeToMessages(roomId, (msgs) => {
            const sorted = [...msgs].sort((a, b) => a.timestamp?.toMillis?.() - b.timestamp?.toMillis?.());
            setMessages(sorted);
        });
        return () => unsubscribe();
    }, [roomId]);

    const receiver = participants.find(p => p._id === receiverId);
    const receiverName = receiver?.name
    const targetRole = receiver?.role
    // console.log(receiver,'ROLE NI TAGATANGGAP')
    const handleSend = async () => {
        if (!inputText.trim()) return;
        try {
            await sendMessage(roomId, userId, receiverId, inputText.trim(), receiverName, targetRole);
            setInputText("");
        } catch (error) {
            // console.error("Failed to send message:", error);
        }
    };
    const renderItem = ({ item }) => {
        const isSender = item.senderId === userId;
        const sender = participants.find((p) => p._id === item.senderId);
        const avatarUrl = sender?.avatar?.url || "https://via.placeholder.com/40";
        const senderName = sender?.name || "Unknown";

        return (
            <View style={[styles.messageContainer, isSender ? styles.myMessageContainer : styles.otherMessageContainer]}>
                {!isSender && (
                    <Image source={{ uri: avatarUrl }} style={styles.chatAvatar} />
                )}
                <View style={isSender ? styles.myMessageBubble : styles.otherMessageBubble}>
                    <Text style={styles.senderName}>{senderName}</Text>
                    <Text>{item.text}</Text>
                    <Text style={styles.timestamp}>
                        {item.timestamp ? timeAgo(item.timestamp.toDate()) : ''}
                    </Text>
                </View>
                {isSender && (
                    <Image source={{ uri: avatarUrl }} style={styles.chatAvatar} />
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* 💬 Messages */}
            {receiver && (
                <View style={styles.header}>
                    <Image source={{ uri: receiver.avatar?.url }} style={styles.headerAvatar} />
                    <Text style={styles.headerName}>{receiver.name}</Text>
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* 📥 Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type messages here..."
                />
                <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChatRoom;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#4CAF50",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#1f2d1e',
    },
    headerAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 10,
    },
    headerName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 8,
        paddingHorizontal: 10,
        maxWidth: "100%",
    },
    myMessageContainer: {
        alignSelf: "flex-end",
        flexDirection: "row-reverse",
    },
    otherMessageContainer: {
        alignSelf: "flex-start",
        flexDirection: "row",
    },
    myMessageBubble: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        maxWidth: "70%",
    },
    otherMessageBubble: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
        maxWidth: "70%",
    },
    chatAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        borderWidth: 2,
        borderColor: "#fff",
        marginHorizontal: 5,
        backgroundColor: "#fff",
    },
    senderName: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 10,
        color: "#aaa",
        marginTop: 4,
        textAlign: "right",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderTopWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: "#f9f9f9",
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 25,
    },
    sendButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
