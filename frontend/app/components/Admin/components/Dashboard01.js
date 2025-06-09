import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-gifted-charts';
import baseURL from '../../../../assets/common/baseURL';

const screenWidth = Dimensions.get('window').width;

const Dashboard01 = () => {
    const [wasteData, setWasteData] = useState([]);
    const [co2Data, setCo2Data] = useState([]);
    const [labels, setLabels] = useState([]);

    const fetchChartData = async () => {
        try {
            const collectedProgress = await axios.get(
                `${baseURL}/ml/waste-collected-progress`
            );
            const pastData = collectedProgress.data?.past_data || [];

            const waste = pastData.map((item) => ({
                value: item.total_kilo,
                label: new Date(item.date).getDate().toString(),
                dataPointText: `${item.total_kilo}kg`,
            }));

            const co2 = pastData.map((item) => ({
                value: item.total_kilo * 0.7,
                label: '',
                dataPointText: `${(item.total_kilo * 0.7).toFixed(1)}kg`,
            }));

            setWasteData(waste);
            setCo2Data(co2);
            setLabels(pastData.map((item) => new Date(item.date).getDate().toString()));
        } catch (err) {
            console.error('Error fetching chart data:', err);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    return (
        <View
            style={{
                borderRadius: 20,
                padding: 16,
                margin: 16,
            }}
        >
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    CO2 & Waste Reserve
                </Text>
            </View>
            <View style={{
                backgroundColor: '#1D3B29',
                width: '100%',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
            }}>
                <LineChart
                    data={wasteData}
                    data2={co2Data}
                    width={screenWidth * 1.5}
                    height={250}
                    spacing={30}
                    initialSpacing={20}
                    xAxisLabelTextStyle={{ color: '#fff' }}
                    yAxisTextStyle={{ color: '#fff' }}
                    color1="#16A34A"
                    color2="#0617d6"
                    textColor1="#ffffff"
                    dataPointsColor1="#16A34A"
                    dataPointsColor2="#0617d6"
                    showDataPointText
                    dataPointTextColor="#fff"
                    thickness1={2}
                    thickness2={2}
                    hideRules
                    yAxisColor="#ccc"
                    xAxisColor="#ccc"
                    noOfSections={4}
                    isAnimated
                    curved
                />
            </View>
        </View>
    );
};

export default Dashboard01;

const styles = StyleSheet.create({
    header: {
        padding: 12,
        backgroundColor: '#4EFF56',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
})