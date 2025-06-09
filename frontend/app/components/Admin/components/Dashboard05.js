import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';

export default function DashboardCard05() {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const perPage = 4;

    const fetchReviews = async () => {
        try {
            const { data } = await axios.get(`${baseURL}/get-ratings-reviews`);
            const now = new Date();
            const first = new Date(now.setDate(now.getDate() - now.getDay()));
            first.setHours(0, 0, 0, 0);
            const last = new Date(first);
            last.setDate(last.getDate() + 6);
            last.setHours(23, 59, 59, 999);

            const arr = [];
            data.data.forEach(u => {
                (u.stall?.review || []).forEach(r => {
                    const d = new Date(r.date);
                    if (d >= first && d <= last && r.text?.trim()) {
                        arr.push({ text: r.text, date: d, user: u.name, email: u.email });
                    }
                });
            });
            setReviews(arr);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchReviews();
        const timer = setInterval(fetchReviews, 5000);
        return () => clearInterval(timer);
    }, []);

    const totalPages = Math.ceil(reviews.length / perPage);
    const start = (page - 1) * perPage;
    const paged = reviews.slice(start, start + perPage);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.headerText}>User Reviews</Text>
            </View>
            {paged.length === 0 ? (
                <Text style={styles.emptyText}>No reviews available.</Text>
            ) : (
                <FlatList
                    data={paged}
                    scrollEnabled={false}
                    keyExtractor={(_, idx) => idx.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.review}>
                            <Text>“{item.text}”</Text>
                            <Text style={styles.meta}>
                                — {item.user} {item.email ? `(${item.email})` : ''}
                            </Text>
                        </View>
                    )}
                />
            )}
            <View style={styles.pagination}>
                {[...Array(totalPages)].map((_, idx) => {
                    const num = idx + 1;
                    return (
                        <TouchableOpacity
                            key={num}
                            style={[styles.pageBtn, page === num && styles.pageBtnActive]}
                            onPress={() => setPage(num)}
                        >
                            <Text style={page === num ? styles.pageTxtActive : styles.pageTxt}>
                                {num}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
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
    header: {
        padding: 12,
        backgroundColor: '#4EFF56',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    chartContainer: {
        alignItems: 'flex-end',
        padding: 12,
    },
    barWrapper: {
        alignItems: 'center',
        marginRight: 12,
    },
    bar: {
        width: 20,
        backgroundColor: '#1D3B29',
        borderRadius: 4,
    },
    barLabel: {
        marginTop: 4,
        fontSize: 10,
        textAlign: 'center',
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
    review: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    meta: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 12,
    },
    pageBtn: {
        padding: 8,
        margin: 2,
        borderRadius: 6,
        backgroundColor: '#E5E7EB',
    },
    pageBtnActive: {
        backgroundColor: '#2563EB',
    },
    pageTxt: {
        color: '#374151',
    },
    pageTxtActive: {
        color: '#fff',
    },
    placeholder: {
        padding: 24,
        textAlign: 'center',
        color: '#6B7280',
    },
});
