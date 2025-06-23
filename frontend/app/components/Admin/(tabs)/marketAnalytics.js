import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import baseURL from '../../../../assets/common/baseURL';
import DashboardCard04 from '../components/Dashboard04';
import DashboardCard05 from '../components/Dashboard05';
import MarketDashboardCard01 from '../components/MarketDashboard01';
import Dashboard01 from '../components/Dashboard01';
import { router } from 'expo-router';

const Dashboard = () => {
  const [allRatings, setAllRatings] = useState([]);
  const [topSeller, setTopSeller] = useState(null);

  const fetchReviewRating = async () => {
    try {
      const res = await axios.get(`${baseURL}/get-ratings-reviews`);
      const stalls = res.data.data;
      setAllRatings(stalls);
    } catch (error) {
      console.error("Error fetching stalls:", error);
    }
  };

  useEffect(() => {
    fetchReviewRating();
  }, []);

  useEffect(() => {
    if (allRatings.length > 0) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const ratingsThisMonth = allRatings.map(seller => {
        const ratings = seller.stall?.rating || [];

        const thisMonthRatings = ratings.filter(r =>
          r?.date &&
          new Date(r.date).getMonth() === currentMonth &&
          new Date(r.date).getFullYear() === currentYear
        );

        const avgRating = thisMonthRatings.length > 0
          ? (thisMonthRatings.reduce((sum, r) => sum + (r.value || 0), 0) / thisMonthRatings.length)
          : 0;

        return {
          name: seller.name,
          email: seller.email,
          avgRating,
          totalReviews: thisMonthRatings.length,
        };
      }).filter(s => s.totalReviews > 0);

      const top = ratingsThisMonth.sort((a, b) => b.avgRating - a.avgRating)[0];
      setTopSeller(top);
    }
  }, [allRatings]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📉 Market Analytics</Text>
      <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/components/Admin/components/MarketList')}>
        <Text style={styles.nextText}>Price List</Text>
      </TouchableOpacity>

      {topSeller && (
        <View style={styles.topSellerCard}>
          <Text style={styles.cardTitle}>🏆 Top Rated Waste Distributor This Month</Text>
          <Text><Text style={styles.bold}>Name:</Text> {topSeller.name}</Text>
          <Text><Text style={styles.bold}>Email:</Text> {topSeller.email}</Text>
          <Text><Text style={styles.bold}>Average Rating:</Text> {topSeller.avgRating} ⭐</Text>
          <Text><Text style={styles.bold}>Total Reviews:</Text> {topSeller.totalReviews}</Text>
        </View>
      )}

      <View style={styles.cardGrid}>
        <MarketDashboardCard01 />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <DashboardCard04 />
          <DashboardCard05 />
        </View>
        <Dashboard01 />
      </View>
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9FFF3',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
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
    textAlign: 'center'
  },
  topSellerCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  cardGrid: {
    flex: 1
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
  },
});
