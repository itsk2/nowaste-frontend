import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import baseURL from '../../../../../assets/common/baseURL';
import axios from 'axios';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const MySack = () => {
    const { user } = useSelector((state) => state.auth);
    const userId = user.user._id
    const router = useRouter()
    const navigation = useNavigation()
    const [mySack, setMySacks] = useState([]);
    const addToSackId = mySack.length > 0 ? mySack[0]._id : undefined;
    const status = mySack.length > 0 ? mySack[0].status : undefined;
    // console.log(userId)

    const fetchMySacks = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/sack/get-my-sacks/${userId}`);
            const pendingSacks = data.mySack.filter(sack => sack.status === "pending");

            setMySacks(pendingSacks);
        } catch (error) {
            console.error("Error fetching:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchMySacks();
            }
        }, [userId])
    );
    // console.log("My Sack Data:", mySack);
    const totalKilos = mySack.reduce((sum, item) => {
        return sum + item.sacks.reduce((sackSum, sack) => sackSum + Number(sack.kilo || 0), 0);
    }, 0);

    const handlePickUpSacks = async () => {
        // console.log(totalKilos, 'Kilos');
        console.log(mySack, 'My sacks');
        // const status = 'pending';
        try {
            const { data } = await axios.post( `${baseURL}/sack/pick-up-sacks/${addToSackId}`, { mySack, totalKilos });
            Alert.alert(
                "Pickup Your Sacks Now?",
                "Go to Pickups!!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error("Error fetching:", error);
        }
    }

    return (
        <ImageBackground
            source={require("../../../../../assets/bg-leaf.png")}
            style={{
                flex: 1,
            }}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {/* Header */}
                <Text style={styles.header}>MY SACK</Text>

                {/* Sack Image & Weight */}
                <View style={styles.sackContainer}>
                    <MaterialCommunityIcons name="sack" size={100} color="white" style={styles.sackImage} />
                    <Text style={styles.sackWeight}>{totalKilos} KG</Text>
                </View>

                {/* Pickup Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.pickupButton}
                        onPress={() => handlePickUpSacks()}
                    >
                        <Text style={styles.pickupText}>PICKUP</Text>
                    </TouchableOpacity>
                </View>

                {/* Sack List */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={mySack}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            item.sacks.map((sack, index) => (
                                <View key={index} style={styles.sackCard}>
                                    <Image source={{ uri: sack.images[0]?.url }} style={styles.sackItemImage} />
                                    <View style={styles.sackDetails}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ color: 'white' }}>Description: {sack.description}</Text>
                                            <TouchableOpacity>
                                                <FontAwesome name="trash" size={20} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={{ marginBottom: 4, color: 'white' }}>Kilo: {sack.kilo} kg/s</Text>
                                        <Text style={{ marginBottom: 4, color: 'white' }}>Posted: {new Date(item.createdAt).toLocaleDateString()}</Text>
                                        <Text style={{ marginBottom: 4, color: 'white' }}>Spoilage Date: {new Date(sack.dbSpoil).toLocaleDateString()}</Text>
                                        <TouchableOpacity>
                                            <FontAwesome name="star" size={20} color="gold" style={{ alignSelf: 'flex-end' }} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    />
                </View>
            </View>
        </ImageBackground>
    );
};

export default MySack;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        paddingHorizontal: 10,
    },
    header: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'left',
        marginVertical: 10,
        color: 'white'
    },
    sackContainer: {
        alignItems: 'center',
        backgroundColor: '#2E4237',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
    },
    sackImage: {
        width: 100,
        height: 100,
    },
    sackWeight: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonContainer: {
        alignItems: 'center',
    },
    pickupButton: {
        backgroundColor: '#FFD89C',
        paddingVertical: 10,
        width: '50%',
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    pickupText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        backgroundColor: '#E5E5E5',
        borderRadius: 15,
        padding: 10,
        marginTop: 10,
    },
    sackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2E4237',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    sackItemImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
    },
    sackDetails: {
        flex: 1,
        color: 'white',
    },
});
