import { StyleSheet, Text, View, StatusBar, TouchableOpacity } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'
import { useNavigation, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import Icon from "react-native-vector-icons/FontAwesome";
import { logoutAction } from '../(redux)/authSlice';

const Profile = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const navigation = useNavigation();

    const handleLogout = () => {
        dispatch(logoutAction());
        router.push("/");
    };
    return (
        <>
            <StatusBar translucent backgroundColor={"transparent"} />
            <View style={styles.container}>
                <Text> Profile </Text>
                <TouchableOpacity style={styles.option} onPress={handleLogout}>
                    <Icon name="sign-out" size={24} color="#e91e63" />
                    <Text style={styles.optionText}>Logout</Text>
                    <Icon
                        name="angle-right"
                        size={24}
                        color="#999"
                        style={styles.optionIcon}
                    />
                </TouchableOpacity>
            </View>
        </>
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 10,
        elevation: 2,
    },
    optionText: {
        flex: 1,
        fontSize: 18,
        marginLeft: 10,
        color: "#333",
    },
    optionIcon: {
        marginLeft: "auto",
    },
})
