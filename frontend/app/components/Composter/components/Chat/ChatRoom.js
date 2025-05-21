import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { sendMessage, subscribeToMessages } from "../../../../../firebase/chatService";
import { generateRoomId } from "../../../../../utils/generateRoom";
import baseURL from '../../../../../assets/common/baseURL';
import axios from 'axios';
import { timeAgo } from "../../../../../utils/timeAgo"

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
                console.error("Failed to fetch chat users:", error);
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

    const handleSend = async () => {
        if (!inputText.trim()) return;
        try {
            await sendMessage(roomId, userId, receiverId, inputText.trim());
            setInputText("");
        } catch (error) {
            console.error("Failed to send message:", error);
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
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={handleSend} />
            </View>
        </View>
    );
};

export default ChatRoom;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
    },
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
        textAlign: "right",
    },
    participantContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 10,
        flexWrap: "wrap",
    },
    participant: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
        marginBottom: 6,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 6,
    },
    name: {
        fontWeight: "bold",
        fontSize: 14,
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 6,
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
        backgroundColor: "#DCF8C6",
        borderRadius: 10,
        padding: 8,
        maxWidth: "75%",
    },

    otherMessageBubble: {
        backgroundColor: "#E2E2E2",
        borderRadius: 10,
        padding: 8,
        maxWidth: "75%",
    },

    chatAvatar: {
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