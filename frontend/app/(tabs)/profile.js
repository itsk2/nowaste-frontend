import React, { useCallback, useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import Constants from "expo-constants";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import baseURL from "../../assets/common/baseURL";
import { logout, logoutAction } from "../(redux)/authSlice";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
const Profile = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user } = useSelector((state) => state.auth);
    const [userData, setUser] = useState([]);

    const handleLogout = () => {
        dispatch(logoutAction());
        router.replace("/auth/login");
    };

    useEffect(() => {
        if (!user) {
            router.replace("/");
            return;
        }
    }, [user, router]);


    const fetchUser = async () => {
        try {
            const data = await axios.get(`${baseURL}/get-user/${user?.user?._id}`);
            setUser(data?.data?.user);
        } catch (error) {
            console.error("Error fetching user:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (user?.user?._id) {
                fetchUser();
                const interval = setInterval(() => {
                    fetchUser();
                }, 3000);
                return () => clearInterval(interval);
            }
        }, [user?.user?._id])
    );

    return (
        <View style={styles.screen}>
            <View style={styles.headerContainer}>
                <View style={styles.profileImageWrapper}>
                    {userData?.avatar?.url ? (
                        <Image
                            source={{ uri: userData.avatar.url }}
                            style={styles.avatar}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderAvatar} />
                    )}
                </View>
                <Text style={styles.name}>{userData?.name || "Farmer1"}</Text>
                <Text style={styles.email}>{userData?.email || "james@gmail.com"}</Text>
                <Text style={styles.role}>Pig Farmer</Text>
            </View>

            <ScrollView contentContainerStyle={styles.bodyContainer}>
                <View style={styles.menuCard}>
                    <MenuItem icon="user" label="Edit Profile" onPress={() => navigation.navigate('components/User/components/EditProfile', { user })} />
                    <MenuItem icon="map" label="Location"
                        onPress={() => router.push({
                            pathname: "/components/User/components/map",
                        })}
                    />
                    <MenuItem icon="home" label="Address"
                        onPress={() => navigation.navigate('components/User/addAddress', { user })}
                    />
                    <MenuItem iconLib={MaterialCommunityIcons} icon="message-text-outline" label="Chat"
                        onPress={() => navigation.navigate('components/User/components/Chat/Chats')}
                    />
                    <MenuItem iconLib={AntDesign} icon="notification" label="Notifications"
                        onPress={() => navigation.navigate('components/User/components/Notification/notification')}
                    />
                    <MenuItem icon="sign-out" label="Log out" onPress={handleLogout} />
                </View>
            </ScrollView>
        </View>
    );
};

const MenuItem = ({ iconLib: Icon = FontAwesome, icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Icon name={icon} size={20} color="#fff" />
        <Text style={styles.menuLabel}>{label}</Text>
        <FontAwesome name="angle-right" size={20} color="#fff" style={styles.menuArrow} />
    </TouchableOpacity>
);


export default Profile;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#eafff2",
    },
    headerContainer: {
        backgroundColor: "#1e463a",
        paddingTop: Constants.statusBarHeight + 40,
        paddingBottom: 60,
        alignItems: "center",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    profileImageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#fff",
        marginBottom: 10,
        overflow: "hidden",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    placeholderAvatar: {
        width: "100%",
        height: "100%",
        backgroundColor: "#ccc",
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginTop: 5,
    },
    email: {
        fontSize: 14,
        color: "#d4d4d4",
        marginVertical: 2,
    },
    role: {
        fontSize: 14,
        color: "#a5d6a7",
        fontStyle: "italic",
    },
    bodyContainer: {
        padding: 20,
        alignItems: "center",
    },
    menuCard: {
        backgroundColor: "#1e463a",
        borderRadius: 20,
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomColor: "#2e6e5a",
        borderBottomWidth: 1,
    },
    menuLabel: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        marginLeft: 15,
    },
    menuArrow: {
        opacity: 0.5,
    },
});