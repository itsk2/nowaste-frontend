import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';

const screenWidth = Dimensions.get('window').width;

const MarketDashboardCard01 = () => {
    const [stalls, setStalls] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchStalls = async () => {
        try {
            const response = await axios.get(`${baseURL}/get-all-stalls`);
            const fetchedStalls = response.data.stalls;

            const processed = fetchedStalls.map(s => {
                const ratings = s.stall?.rating ?? [];
                const avgRating =
                    ratings.length > 0
                        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
                        : 0;

                return {
                    name: s.name,
                    image: s.stall?.stallImage?.url,
                    address: s.stall?.stallAddress,
                    number: s.stall?.stallNumber,
                    openHours: s.stall?.openHours,
                    closeHours: s.stall?.closeHours,
                    status: s.stall?.status,
                    avgRating: avgRating.toFixed(2),
                };
            });

            setStalls(processed);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stalls:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStalls();
        const interval = setInterval(() => {
            fetchStalls();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % stalls.length);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color="#4eff56" size="large" />
            </View>
        );
    }

    if (!stalls.length) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>No stalls available.</Text>
            </View>
        );
    }

    const currentStall = stalls[currentIndex];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ratings Overview</Text>
            </View>

            <View style={styles.card}>
                {currentStall.image && (
                    <Image
                        source={{ uri: currentStall.image }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.info}>
                    <Text style={styles.name}>{currentStall.name}</Text>
                    <Text style={styles.label}>Stall Number: <Text style={styles.value}>{currentStall.number}</Text></Text>
                    <Text style={styles.label}>Address: <Text style={styles.value}>{currentStall.address}</Text></Text>
                    <Text style={styles.label}>Open: <Text style={styles.value}>{currentStall.openHours}</Text></Text>
                    <Text style={styles.label}>Close: <Text style={styles.value}>{currentStall.closeHours}</Text></Text>
                    <Text style={styles.label}>Status: <Text style={{ color: currentStall.status === 'open' ? '#4eff56' : 'red' }}>{currentStall.status}</Text></Text>
                    <Text style={styles.label}>Avg Rating: <Text style={styles.value}>{currentStall.avgRating} / 5</Text></Text>
                </View>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MarketDashboardCard01;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        width: '100%',
        marginBottom: 20,
    },
    header: {
        backgroundColor: '#4eff56',
        padding: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1D1D1D',
    },
    card: {
        backgroundColor: '#1D3B29',
        padding: 16,
        alignItems: 'center',
    },
    image: {
        width: screenWidth * 0.8,
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
    },
    info: {
        width: '100%',
        marginBottom: 16,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
        textAlign: 'center',
    },
    label: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: '#ffffff',
        fontWeight: '600',
    },
    nextButton: {
        backgroundColor: '#4eff56',
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    nextText: {
        color: '#1D1D1D',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        padding: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#888',
        fontSize: 16,
    },
});