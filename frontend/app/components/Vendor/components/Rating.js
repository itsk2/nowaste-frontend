import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from 'expo-router';
import { useSelector } from 'react-redux';
import baseURL from '../../../../assets/common/baseURL';
import { FontAwesome } from '@expo/vector-icons';
import {
    LineChart,
    BarChart,
    PieChart,
} from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;
const REVIEWS_PER_PAGE = 4;

const Rating = () => {
    const { user } = useSelector((state) => state.auth);
    const [userData, setUser] = useState([]);
    const [reviewPage, setReviewPage] = useState(1);
    const navigation = useNavigation();

    const fetchUser = async () => {
        try {
            const data = await axios.get(`${baseURL}/get-user/${user?.user?._id}`);
            setUser(data.data.user);
        } catch (error) {
            console.error('Error fetching user', error);
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

    const getAverageRating = () => {
        const ratings = userData?.stall?.rating;
        if (!ratings || ratings.length === 0) return 0;
        const total = ratings.reduce((sum, item) => sum + item.value, 0);
        return total / ratings.length;
    };

    const StarRatingDisplay = ({ rating }) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FontAwesome
                    key={i}
                    name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half-full' : 'star-o'}
                    size={18}
                    color="#ffd700"
                />
            );
        }
        return <View style={{ flexDirection: 'row' }}>{stars}</View>;
    };

    const ratingArray = userData?.stall?.rating || [];
    const lineData = ratingArray.map((item) => ({
        value: item.value,
        label: new Date(item.date).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
        }),
    }));

    const barData = [1, 2, 3, 4, 5].map((value) => ({
        value: ratingArray.filter((r) => r.value === value).length,
        label: `${value}★`,
        frontColor: '#4caf50',
    }));

    const pieData = [1, 2, 3, 4, 5]
        .map((value) => {
            const count = ratingArray.filter((r) => r.value === value).length;
            return {
                value: count,
                color: ['#ef5350', '#ffb74d', '#ffee58', '#81c784', '#66bb6a'][value - 1],
                text: `${value}★`,
            };
        })
        .filter((item) => item.value > 0);

    const paginatedReviews = userData?.stall?.review?.slice(
        (reviewPage - 1) * REVIEWS_PER_PAGE,
        reviewPage * REVIEWS_PER_PAGE
    );
    const totalPages = Math.ceil((userData?.stall?.review?.length || 0) / REVIEWS_PER_PAGE);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#E9FFF3' }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
                    <View style={{ marginLeft: 10 }}>
                        <Text style={styles.greeting}>Stall</Text>
                        <Text style={styles.name}>Ratings</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {ratingArray.length > 0 && (
                <View style={styles.container}>
                    {/* Pie Chart */}
                    <View style={styles.chartCard}>
                        <Text style={styles.chartTitle}>🥧 Rating Breakdown</Text>
                        <PieChart
                            data={pieData}
                            donut
                            radius={80}
                            textColor="#fff"
                            textSize={10}
                            innerRadius={45}
                            centerLabelComponent={() => (
                                <Text style={styles.centerLabel}>{getAverageRating().toFixed(1)}★</Text>
                            )}
                            showValuesAsLabels
                        />
                        <View style={{ alignItems: 'center', marginTop: 10 }}>
                            <Text style={styles.legendText}>Average Rating</Text>
                            <StarRatingDisplay rating={getAverageRating()} />
                            <Text style={styles.subText}>
                                {getAverageRating().toFixed(1)} / 5 ({ratingArray.length} ratings)
                            </Text>
                        </View>
                        {pieData.length > 0 && (
                            <View style={styles.legendContainer}>
                                {pieData.map((item, index) => (
                                    <View key={index} style={styles.legendRow}>
                                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendText}>
                                            {item.text} – {item.value} rating{item.value > 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Line & Bar Chart Side by Side */}
                    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <View style={[styles.chartCard, { width: screenWidth * 0.45 }]}>
                            <Text style={styles.chartTitle}>📊 Frequency</Text>
                            <BarChart
                                data={barData}
                                barWidth={20}
                                barBorderRadius={4}
                                frontColor="#81c784"
                                height={150}
                                yAxisTextStyle={{ color: '#fff', fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: '#fff', fontSize: 10 }}
                                yAxisLabelWidth={20}
                                yAxisColor="#fff"
                                isAnimated
                            />
                        </View>
                        <View style={[styles.chartCard, { width: screenWidth * 0.45 }]}>
                            <Text style={styles.chartTitle}>📈 Trend</Text>
                            <LineChart
                                data={lineData}
                                thickness={2}
                                color="#66bb6a"
                                hideDataPoints={false}
                                curved
                                isAnimated
                                height={150}
                                xAxisLabelTextStyle={{ color: '#fff', fontSize: 10 }}
                                yAxisTextStyle={{ color: '#fff', fontSize: 10 }}
                            />
                        </View>
                    </View>
                </View>
            )}
            {/* Reviews Section */}
            <View style={styles.container}>
                <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>📝 Stall Reviews</Text>
                    {paginatedReviews?.length > 0 ? (
                        paginatedReviews.map((review, index) => (
                            <View key={review._id || index} style={styles.reviewCard}>
                                <Text style={styles.reviewText}>“{review.text}”</Text>
                                <Text style={styles.reviewDate}>
                                    {new Date(review.date).toLocaleDateString('en-PH', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ color: '#ccc', fontStyle: 'italic', marginTop: 10 }}>
                            No reviews yet.
                        </Text>
                    )}
                    {totalPages > 1 && (
                        <View style={styles.paginationControls}>
                            <TouchableOpacity
                                onPress={() => setReviewPage((prev) => Math.max(prev - 1, 1))}
                                disabled={reviewPage === 1}
                            >
                                <Text style={styles.pageBtn}>Previous</Text>
                            </TouchableOpacity>
                            <Text style={styles.pageIndicator}>{reviewPage} / {totalPages}</Text>
                            <TouchableOpacity
                                onPress={() => setReviewPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={reviewPage === totalPages}
                            >
                                <Text style={styles.pageBtn}>Next</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default Rating;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2F23',
        padding: 20,
        height: 90,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '500',
        color: '#fff',
    },
    name: {
        fontSize: 23,
        fontWeight: 'bold',
        color: '#2BA84A',
        marginVertical: 4,
    },
    iconButton: {
        padding: 8,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        padding: 10,
    },
    chartCard: {
        backgroundColor: '#1A2F23',
        borderRadius: 16,
        padding: 15,
        marginVertical: 10,
        width: '95%',
        alignItems: 'center',
    },
    chartTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    reviewCard: {
        backgroundColor: '#273c32',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
    },
    reviewText: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    reviewDate: {
        color: '#ccc',
        fontSize: 12,
        textAlign: 'right',
    },
    centerLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    legendContainer: {
        marginTop: 12,
        width: '100%',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        paddingLeft: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        marginRight: 8,
        borderRadius: 2,
    },
    legendText: {
        color: '#fff',
        fontSize: 13,
    },
    subText: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 2,
    },
    paginationControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    pageBtn: {
        color: '#2BA84A',
        fontWeight: 'bold',
    },
    pageIndicator: {
        color: '#fff',
    },
});