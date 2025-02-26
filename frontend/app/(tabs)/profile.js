import React from "react";
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
    Image,
    ImageBackground,
} from "react-native";
import Constants from "expo-constants";
import { useNavigation, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome";
import { logoutAction } from "../(redux)/authSlice";

const Profile = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigation = useNavigation();

    const handleLogout = () => {
        dispatch(logoutAction());
        router.replace("/auth/login");
    };
    console.log(user)
    return (
        <>
            <StatusBar translucent backgroundColor={"transparent"} />
            <View style={styles.background}>
                <View style={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <Image
                                source={{ uri: user?.user?.avatar?.url || user?.avatar?.url || "https://via.placeholder.com/150" }}
                                style={styles.avatar}
                            />
                            <View>
                                <Text style={styles.name}>{user?.user?.name || user?.name || "John Smith Meu"}</Text>
                                <Text style={styles.country}>{user?.user?.address?.city || user?.address?.city || 'nothing'}</Text>
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Icon name="phone" size={20} color="#000" />
                                <Text style={styles.actionText}>Call Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.mailButton]}>
                                <Icon name="envelope" size={20} color="#fff" />
                                <Text style={[styles.actionText, { color: "#fff" }]}>Mail Us</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.menu}>
                            <TouchableOpacity style={styles.menuItem}
                                onPress={() => router.push({
                                    pathname: "/components/User/components/map",
                                })}
                            >
                                <Icon name="map-marker" size={20} color="#000" />
                                <Text style={styles.menuText}>Location</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}
                                onPress={() => navigation.navigate('components/User/components/EditProfile', { user })}
                            >
                                <Icon name="user" size={20} color="#000" />
                                <Text style={styles.menuText}>Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}
                                onPress={() => navigation.navigate('components/User/addAddress', { user })}
                            >
                                <Icon name="book" size={20} color="#000" />
                                <Text style={styles.menuText}>Address Book</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}>
                                <Icon name="info-circle" size={20} color="#000" />
                                <Text style={styles.menuText}>About Us</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}>
                                <Icon name="question-circle" size={20} color="#000" />
                                <Text style={styles.menuText}>FAQ</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Sign Out</Text>
                            <Icon name="sign-out" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

export default Profile;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#317256'
    },
    container: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: "#fff",
        width: "100%",
        padding: 20,
        borderRadius: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
    },
    country: {
        fontSize: 16,
        color: "gray",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
        flex: 1,
        justifyContent: "center",
        marginHorizontal: 5,
    },
    mailButton: {
        backgroundColor: "#e91e63",
    },
    actionText: {
        marginLeft: 5,
        fontSize: 16,
    },
    menu: {
        marginTop: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    menuText: {
        fontSize: 18,
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e91e63",
        padding: 15,
        borderRadius: 10,
        justifyContent: "center",
        marginTop: 40,
    },
    logoutText: {
        color: "#fff",
        fontSize: 18,
        marginRight: 10,
    },
});