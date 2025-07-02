import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllStalls } from '../../../(services)/api/Users/getAllStalls';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import { BarChart, PieChart, LineChart } from 'react-native-gifted-charts';
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
    const [barMonth, setBarMonth] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [sacks, setSacks] = useState([]);
    const [predictedWaste, setPredictedWaste] = useState([]);
    const [optimalSchedule, setOptimalSchedule] = useState([]);
    const [co2Data, setCo2Data] = useState([]);
    const [wasteData, setWasteData] = useState([]);
    const [wasteGeneration, setWasteGeneration] = useState([]);
    const router = useRouter();

    const fetchPredictedWaste = async () => {
        try {

            //predict-waste-data
            const predictWaste = await axios.get(`${baseURL}/ml/predict-waste`);
            setPredictedWaste(predictWaste.data);

            //optimal-collection-schedule-data
            const optimalSchedule = await axios.get(`${baseURL}/ml/optimal-collection-schedule`);
            setOptimalSchedule(optimalSchedule.data);

            //waste-collected-progress-data
            const collectedProgress = await axios.get(`${baseURL}/ml/waste-collected-progress`);
            const pastData = collectedProgress.data?.past_data || [];
            const predictions = collectedProgress.data?.predictions || [];
            // Process past data (Actual waste collected)
            const wastePoints = pastData.map((item, index) => ({
                value: item.total_kilo,
                label: new Date(item.date).getDate().toString(),
            }));
            setWasteData(wastePoints);
            const co2Points = pastData.map((item, index) => ({
                value: item.total_kilo * 0.7,
                label: new Date(item.date).getDate().toString(),
            }));
            setCo2Data(co2Points);

            //waste-generation-trend-data
            const wasteGeneration = await axios.get(`${baseURL}/ml/waste-generation-trend`);
            console.log("Waste Generation Data:", wasteGeneration.data);
            setWasteGeneration(wasteGeneration.data);
        } catch (error) {
            console.error("Error fetching predicted waste data:", error);
        }
    };

    useEffect(() => {
        fetchPredictedWaste();
    }, []);

    // console.log(co2Data, 'Data that can be used as co2Data co2Data.')

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
            const interval = setInterval(() => {
                fetchStoreCounts();
                fetchUserCounts();
                fetchSackCounts();
            }, 3000);
            return () => clearInterval(interval);
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

                // Check if the pie data really needs to be updated
                if (JSON.stringify(pieData) !== JSON.stringify(formattedPieData)) {
                    setPieData(formattedPieData);
                }

                const statusCounts = sacks.reduce((acc, sack) => {
                    acc[sack.status] = (acc[sack.status] || 0) + 1;
                    return acc;
                }, {});

                const barData = Object.entries(statusCounts).map(([status, count]) => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: count,
                }));
                setBarMonth(barData)
                // Check if the bar data really needs to be updated
                if (JSON.stringify(barData) !== JSON.stringify(barData)) {
                    setBarData(barData);
                }
            }
        }, [sacks, pieData])
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, }}>
            <View style={{ flex: 1, alignItems: 'center', }}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Dashboard</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    {Object.entries(roleCounts).map(([role, count]) => {
                        let IconComponent;
                        let routePath = "";

                        if (role === "farmer") {
                            IconComponent = <FontAwesome name="user" size={24} color="black" />;
                            routePath = "/components/Admin/components/Users/Farmers/FarmersList";
                        } else if (role === "composter") {
                            IconComponent = <MaterialIcons name="takeout-dining" size={24} color="black" />;
                            routePath = "/components/Admin/components/Users/Composters/CompostersList";
                        } else if (role === "vendor") {
                            IconComponent = <FontAwesome6 name="user-ninja" size={24} color="black" />;
                            routePath = "/components/Admin/components/Users/Vendors/VendorsList";
                        }

                        return (
                            <TouchableOpacity
                                key={role}
                                onPress={() => router.push(routePath)}
                                style={styles.statBox}
                            >
                                {IconComponent}
                                <Text style={styles.statText}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}/s: {count}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    <View style={styles.statBox}>
                        <TouchableOpacity onPress={() => router.push('components/Admin/components/Stalls/StallList')} >
                            <Entypo name="shop" size={24} color="black" />
                            <Text style={styles.statText}>Stall/s: {numStalls}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Reports Header */}
                <View style={styles.reportHeader}>
                    <Text style={styles.reportHeaderText}>Reports</Text>
                </View>

                {/* Charts */}
                <View style={styles.chartContainer}>
                    <View style={{ marginTop: 20, width: "100%", padding: 5, borderWidth: 2, alignSelf: 'center' }}>
                        <Text style={styles.chartTitle}>Sacks This Month</Text>
                        <View style={{ alignSelf: 'center' }}>
                            <BarChart
                                data={barMonth}
                                barWidth={30}
                                height={150}
                                showYAxisIndices
                                yAxisThickness={1}
                                xAxisThickness={1}
                                hideRules
                                frontColor="#E91E63"
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 40, width: "100%", padding: 5, borderWidth: 2, alignSelf: 'center' }}>
                        <Text style={styles.chartTitle}>Kilograms of Sacks {'\n'} This Month</Text>
                        <View style={{ alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                radius={100}
                                showText
                                textColor="black"
                                showValuesAsLabels
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
            </View >
        </ScrollView >
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
    },
    tableHeader: {
        backgroundColor: '#E91E63',
        paddingVertical: 10,
        borderRadius: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tableCell: {
        padding: 10,
        textAlign: 'center',
        minWidth: 80, // Adjust based on your needs
        borderWidth: 1,
        borderColor: '#ccc',
    },
    stallCell: {
        fontWeight: 'bold',
        backgroundColor: '#E91E63',
        color: 'white',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5
    }
});

export default AdminHome;