import { StyleSheet, Text, View, FlatList, Button, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import axios from 'axios';
import baseURL from '../../../../../../assets/common/baseURL';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
const ITEMS_PER_PAGE = 10;

const CompostersList = () => {
  const [composters, setComposters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigation = useNavigation()
  const router = useRouter()
  const role = 'composter'
  const fetchSellerCounts = async () => {
    try {
      const response = await axios.get(`${baseURL}/get-all-users`);
      const composterUsers = response.data.users.filter(user => user.role === 'composter');
      setComposters(composterUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSellerCounts();
      const interval = setInterval(() => {
        fetchSellerCounts();
      }, 3000);
      return () => clearInterval(interval);
    }, [])
  );

  // Pagination logic
  const totalPages = Math.ceil(composters.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentComposters = composters.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={{
          padding: 8,
          borderRadius: 50,
        }} onPress={() => navigation.goBack()}>
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 90 }}>
            <View style={{ marginRight: 10, flexDirection: 'row', }}>
              <Ionicons name="arrow-back-circle-sharp" size={28} color="#2BA84A" />
              <View style={{ marginTop: 5, marginLeft: 10 }}>
                <Text style={styles.greeting}>Composters List</Text>
                <Text style={styles.name}>(Page {currentPage} of {totalPages})</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity onPress={() =>
          router.push({
            pathname: '/components/Admin/components/Users/CreateUser',
            params: { role },
          })
        }>
          <Text style={{ textAlign: 'center' }}>Create Composter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentComposters}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.composterItem}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.composterName}>{item.name}</Text>
                <Text style={styles.composterEmail}>{item.email}</Text>
              </View>
              <View>
                <TouchableOpacity onPress={() =>
                  router.push({
                    pathname: '/components/Admin/components/Users/EditUser',
                    params: { item: JSON.stringify(item) },
                  })
                }>
                  <Feather name="edit" size={16} color="green" />
                </TouchableOpacity>
                <Text>----</Text>
                <Feather name="delete" size={16} color="red" />
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.pagination}>
        <Button
          title="Prev"
          onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        />
        <Button
          title="Next"
          onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        />
      </View>
    </View >
  );
};

export default CompostersList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9FFF3'
  },
  headerContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A2F23',
    padding: 20,
    height: 77,
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
    fontFamily: 'Inter-Medium',
  },
  iconGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 50,
  },
  composterItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  composterName: {
    fontSize: 16,
    fontWeight: '600'
  },
  composterEmail: {
    fontSize: 14,
    color: 'gray'
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  }
});