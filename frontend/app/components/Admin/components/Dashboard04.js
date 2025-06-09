import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';
import { PieChart } from 'react-native-gifted-charts';
import baseURL from '../../../../assets/common/baseURL';

const screenWidth = Dimensions.get('window').width;

export default function DashboardCard04() {
    const [allRatings, setAllRatings] = useState([]);

    const fetchReviewRating = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/get-ratings-reviews`);
            const flatValues = data.data.flatMap(u => (u.stall?.rating ?? []).map(r => r.value));
            setAllRatings(flatValues);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchReviewRating();
        const timer = setInterval(fetchReviewRating, 5000);
        return () => clearInterval(timer);
    }, []);

    const avg = allRatings.length
        ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2)
        : '0.00';

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
        value: allRatings.filter(r => r === rating).length,
        label: `${rating}⭐`,
        color: getColorForRating(rating),
        textColor: '#fff',
    })).filter(item => item.value > 0); // remove 0-value slices

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Ratings Overview</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.statText}>📊 Avg Rating: {avg}</Text>
                <Text style={styles.statText}>Total Ratings: {allRatings.length}</Text>

                {ratingCounts.length > 0 ? (
                    <>
                        <PieChart
                            data={ratingCounts}
                            donut
                            radius={80}
                            innerRadius={50}
                            textColor="white"
                            centerLabelComponent={() => (
                                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                                    {avg}
                                </Text>
                            )}
                        />
                        <View style={styles.legendContainer}>
                            <Text style={styles.legendText}>🟢 5 stars: Green</Text>
                            <Text style={styles.legendText}>🔵 4 stars: Blue</Text>
                            <Text style={styles.legendText}>🟡 3 stars: Yellow</Text>
                            <Text style={styles.legendText}>🟠 2 stars: Orange</Text>
                            <Text style={styles.legendText}>🔴 1 star: Red</Text>
                        </View>
                    </>
                ) : (
                    <Text style={styles.emptyText}>No ratings yet</Text>
                )}
            </View>
        </View>
    );
}

const getColorForRating = (rating) => {
    switch (rating) {
        case 5: return '#22c55e'; // green
        case 4: return '#3b82f6'; // blue
        case 3: return '#facc15'; // yellow
        case 2: return '#f97316'; // orange
        case 1: return '#ef4444'; // red
        default: return '#9ca3af'; // gray
    }
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        flex: 1,
        maxWidth: '48%',
        elevation: 2,
    },
    legendContainer: {
        marginTop: 12,
        alignItems: 'flex-start',
    },
    legendText: {
        fontSize: 12,
        color: '#374151',
        marginBottom: 2,
    },
    header: {
        padding: 12,
        backgroundColor: '#4EFF56',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    content: {
        padding: 16,
        alignItems: 'center',
    },
    statText: {
        fontSize: 14,
        marginBottom: 8,
    },
    emptyText: {
        padding: 16,
        color: '#6B7280',
    },
});