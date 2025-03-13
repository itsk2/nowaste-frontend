import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

const index = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScrollView style={styles.container}>
      {/* Banner Section */}
      <Animated.View style={[styles.banner, { opacity: fadeAnim }]}> 
        <Image source={{ uri: 'https://example.com/veg-waste.jpg' }} style={styles.bannerImage} />
        <Text style={styles.bannerText}>NoWaste: Bridging Waste from Markets to Farms</Text>
      </Animated.View>
      
      {/* Project Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Overview</Text>
        <Text style={styles.sectionText}>
          NoWaste is a platform that facilitates the collection of vegetable waste from markets and delivers them to pig farms and composters.
        </Text>
      </View>
      
      {/* Challenges & Solutions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenges & Solutions</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Challenge: Inefficient Waste Collection</Text>
          <Text style={styles.cardText}>Solution: An optimized system that allows farmers to locate and collect waste easily.</Text>
        </View>
      </View>

      {/* Articles Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related Articles</Text>
        <View style={styles.card}>
          <Image source={{ uri: 'https://example.com/pig-farm.jpg' }} style={styles.cardImage} />
          <Text style={styles.cardTitle}>How Pig Farmers Benefit from Vegetable Waste</Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About NoWaste</Text>
        <Text style={styles.sectionText}>NoWaste is dedicated to reducing food waste by connecting markets with sustainable waste management solutions.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', },
  banner: { alignItems: 'center', padding: 20, backgroundColor: '#4CAF50' },
  bannerImage: { width: '100%', height: 200, borderRadius: 10 },
  bannerText: { fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 10 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  sectionText: { fontSize: 16, color: '#666' },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginTop: 10, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardText: { fontSize: 14, color: '#444' },
  cardImage: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
});

export default index;
