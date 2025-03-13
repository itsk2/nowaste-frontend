import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { getAllStalls } from '../../../(services)/api/Users/getAllStalls';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { Dimensions } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Entypo from '@expo/vector-icons/Entypo';

const AdminHome = () => {
    const [roleCounts, setRoleCounts] = useState({ farmer: 0, composter: 0, vendor: 0 });
    const [numStalls, setStalls] = useState(0);
    const [barData, setBarData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [sacks, setSacks] = useState([]);

    const fetchStoreCounts = async () => {
        try {
            const data = await getAllStalls();
            setStalls(data.stalls.length);
        } catch (error) {
            console.error("Error fetching stalls:", error);
        }
    };

    const fetchUserCounts = async () => {
        try {
            const response = await axios.get(`${baseURL}/get-all-users`);
            // Count roles
            const counts = { farmer: 0, composter: 0, vendor: 0 };
            response.data.users.forEach(user => {
                if (user.role === "farmer") counts.farmer++;
                else if (user.role === "composter") counts.composter++;
                else if (user.role === "vendor") counts.vendor++;
            });

            setRoleCounts(counts);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchSackCounts = async () => {
        try {
            const response = await axios.get(`${baseURL}/sack/get-sacks`);
            setSacks(response.data.sacks);
        } catch (error) {
            console.error("Error fetching sacks:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStoreCounts();
            fetchUserCounts();
            fetchSackCounts();
        }, [])
    );
    useFocusEffect(
        useCallback(() => {
            if (sacks.length > 0) {
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                const sacksThisMonth = sacks.filter((sack) => {
                    const createdAt = new Date(sack.createdAt);
                    return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
                });

                const statusKilos = sacksThisMonth.reduce((acc, sack) => {
                    const status = sack.status.toLowerCase();
                    const kilo = parseFloat(sack.kilo) || 0;

                    acc[status] = (acc[status] || 0) + kilo;
                    return acc;
                }, {});

                const statusColors = {
                    spoiled: "#D70040",
                    claimed: "#097969",
                    posted: "#F88379",
                    pickup: "#EC5800"
                };

                const formattedPieData = Object.keys(statusKilos).map((status) => ({
                    value: statusKilos[status],
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    color: statusColors[status.toLowerCase()] || "#CCCCCC"
                }));

                setPieData(formattedPieData);

                const statusCounts = sacksThisMonth.reduce((acc, sack) => {
                    const status = sack.status.toLowerCase();
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});

                const newBarData = Object.keys(statusCounts).map((status) => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: statusCounts[status],
                }));

                setBarData(newBarData);
            }
        }, [sacks])
    );
    console.log(barData, 'BarData')
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#0F6B5C', paddingBottom: 20, }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Dashboard</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    {Object.entries(roleCounts).map(([role, count]) => {
                        let IconComponent;

                        if (role === "farmer") {
                            IconComponent = <FontAwesome name="user" size={24} color="black" />;
                        } else if (role === "composter") {
                            IconComponent = <MaterialIcons name="takeout-dining" size={24} color="black" />;
                        } else if (role === "vendor") {
                            IconComponent = <FontAwesome6 name="user-ninja" size={24} color="black" />;
                        }

                        return (
                            <View key={role} style={styles.statBox}>
                                {IconComponent}
                                <Text style={styles.statText}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}/s: {count}
                                </Text>
                            </View>
                        );
                    })}
                    <View style={styles.statBox}>
                        <Entypo name="shop" size={24} color="black" />
                        <Text style={styles.statText}>Stall/s: {numStalls}</Text>
                    </View>
                </View>

                {/* Reports Header */}
                <View style={styles.reportHeader}>
                    <Text style={styles.reportHeaderText}>Reports</Text>
                </View>

                {/* Charts */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Sacks This Month</Text>
                    <View style={{
                        alignSelf: 'center',
                    }}>
                        <BarChart
                            data={barData}
                            barWidth={30}
                            height={150}
                            showYAxisIndices
                            yAxisThickness={1}
                            xAxisThickness={1}
                            hideRules
                            frontColor="#E91E63"
                        />
                    </View>
                    <View style={{ marginTop: 40 }}>
                        <Text style={styles.chartTitle}>Kilograms of Sacks {'\n'} This Month</Text>
                        <View style={{ alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                radius={100}
                                showText
                                textColor="black"
                                showValuesAsLabels // This should display values
                                textSize={14}
                                focusOnPress
                            />
                            <View style={{ marginTop: 10, flexDirection: 'row', }}>
                                {pieData.map((item, index) => (
                                    <View key={index} style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}>
                                        <View style={{ width: 12, height: 12, backgroundColor: item.color, marginRight: 8, borderRadius: 6, marginLeft: 8 }} />
                                        <Text style={{ fontSize: 14 }}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#E91E63',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '90%',
        marginTop: 20
    },
    headerText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },

    statsContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        width: '90%',
        marginTop: 15,
        borderWidth: 3,
        borderColor: '#E91E63',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    statBox: {
        backgroundColor: '#E91E63',
        padding: 15,
        borderRadius: 50,
        width: '48%',
        marginBottom: 10,
        alignItems: 'center'
    },
    statText: {
        color: 'white',
        fontSize: 16
    },

    reportHeader: {
        backgroundColor: '#E91E63',
        padding: 10,
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '90%'
    },
    reportHeaderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },

    chartContainer: {
        backgroundColor: 'white',
        padding: 15,
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
    }
});

export default AdminHome;