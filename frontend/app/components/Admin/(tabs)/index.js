import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
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

    const processChartData = () => {
        if (!predictedWaste || predictedWaste.length === 0) return {};

        const stallNumbers = [...new Set(predictedWaste.map(item => item.stallNumber))];
        const groupedData = {};

        stallNumbers.forEach(stall => {
            groupedData[stall] = predictedWaste
                .filter(item => item.stallNumber === stall)
                .map(item => ({
                    value: parseFloat(item.predicted_kilos) || 0,
                    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // Ensure valid label
                }));
        });

        return groupedData;
    };

    const totalWaste = wasteData.reduce((sum, item) => sum + item.value, 0);
    const totalCO2 = co2Data.reduce((sum, item) => sum + item.value, 0);

    const generationTrend = wasteGeneration.map((item) => ({
        value: item.yhat,
        label: new Date(new Date(item.ds).getTime() - 24 * 60 * 60 * 1000)
            .toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    }));

    const lowerBound = wasteGeneration.map((item) => item.yhat_lower);
    const upperBound = wasteGeneration.map((item) => item.yhat_upper)

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: '#0F6B5C', paddingBottom: 20, }}>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: Constants.statusBarHeight }}>
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
                    <View style={{ marginTop: 40 }}>
                        <View style={{ marginTop: 20, width: "100%", padding: 5, borderWidth: 2, alignSelf: 'center' }}>
                            <Text style={styles.chartTitle}>Predicted Waste for Next 7 Days</Text>
                            <ScrollView horizontal>
                                <View>
                                    {/* Table Header */}
                                    <View style={[styles.tableRow, styles.tableHeader]}>
                                        <Text style={[styles.tableCell, styles.stallCell]}>Stall</Text>
                                        {predictedWaste.length > 0 &&
                                            [...new Set(predictedWaste.map(item => item.date))].map((date, index) => {
                                                const formattedDate = new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric' });
                                                return (
                                                    <Text key={index} style={styles.tableCell}>{formattedDate}</Text>
                                                );
                                            })}
                                    </View>

                                    {/* Table Body */}
                                    {[...new Set(predictedWaste.map(item => item.stallNumber))].map((stall, index) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={[styles.tableCell, styles.stallCell]}>{stall}</Text>
                                            {predictedWaste
                                                .filter(item => item.stallNumber === stall)
                                                .map((item, i) => (
                                                    <Text key={i} style={styles.tableCell}>{item.predicted_kilos.toFixed(2)} kg</Text>
                                                ))}
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                            <View style={{ marginTop: 15 }}>
                                <BarChart
                                    data={predictedWaste.map(item => ({
                                        label: item.stallNumber,
                                        value: item.predicted_kilos,
                                    }))}
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
                        <View style={{ marginTop: 20, width: "90%", padding: 5, borderWidth: 2, alignSelf: 'center' }}>
                            <Text style={styles.chartTitle}>Waste Collection & CO₂ Savings</Text>
                            <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: "green", marginRight: 5 }} />
                                    <Text style={{ fontSize: 12 }}>Waste Collected (kg)</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <View style={{ width: 12, height: 12, backgroundColor: "blue", marginRight: 5 }} />
                                    <Text style={{ fontSize: 12 }}>CO₂ Saved (kg)</Text>
                                </View>
                            </View>
                            <LineChart
                                data={wasteData}
                                data2={co2Data}
                                color1="green"
                                color2="blue"
                                width={300}
                                height={200}
                                thickness={2}
                                curved
                                showYAxisIndices
                                yAxisTextStyle={{ fontSize: 12 }}
                                xAxisTextStyle={{ fontSize: 12 }}
                                yAxisLabelSuffix=" kg"
                                dataPointsColor1="green"
                                dataPointsColor2="blue"
                                hideRules
                                data2StrokeDashArray={[5, 5]}
                            />
                        </View>
                        <View style={{ marginTop: 20, width: "90%", padding: 5, borderWidth: 2, alignSelf: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
                                Waste & CO₂ Data Table
                            </Text>
                            <View style={{ flexDirection: "row", backgroundColor: "#ccc", padding: 10 }}>
                                <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>Date</Text>
                                <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>Waste (kg)</Text>
                                <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>CO₂ (kg)</Text>
                            </View>
                            {wasteData.map((item, index) => (
                                <View key={index} style={{ flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
                                    <Text style={{ flex: 1, textAlign: "center" }}>{item.label}</Text>
                                    <Text style={{ flex: 1, textAlign: "center" }}>{item.value.toFixed(2)}</Text>
                                    <Text style={{ flex: 1, textAlign: "center" }}>{co2Data[index]?.value.toFixed(2) || "0.00"}</Text>
                                </View>
                            ))}
                            <View style={{ flexDirection: "row", padding: 10, backgroundColor: "#ddd", marginTop: 5 }}>
                                <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>Total</Text>
                                <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>{totalWaste.toFixed(2)}</Text>
                                <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>{totalCO2.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 20, width: "90%", padding: 5, borderWidth: 2, alignSelf: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 10, borderWidth: 2, padding: 5 }}>
                                Waste Generation Trend
                            </Text>
                            <LineChart
                                data={generationTrend}
                                width={250}
                                height={150}
                                spacing={40}
                                thickness={3}
                                color="red"
                                yAxisTextStyle={{ fontSize: 12 }}
                                xAxisLabelTextStyle={{ fontSize: 12, rotate: -45 }}
                                areaChart={false}
                                curved={false}
                                dashedLine={true}
                                hideDataPoints={false}
                                dataPointsColor="blue"
                                dataPointsRadius={4}
                                yAxisOffset={0}
                                yAxisSide="left"
                                maxValue={Math.max(...upperBound) + 20}
                                minValue={Math.min(...lowerBound) - 20}
                            />
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