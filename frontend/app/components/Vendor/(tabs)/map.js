import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const TaytayMarketMap = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 14.55868,
            longitude: 121.13455,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{ latitude: 14.55868, longitude: 121.13455 }}
            title="New Taytay Public Market"
            description="Pamilihang Bayan ng Taytay, Rizal"
          />
        </MapView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight, // Adjust the top padding
  },
  map: {
    width: '100%',
    height: '100%',
    paddingBottom: 60, // Ensure there's room at the bottom for the location button
  },
});

export default TaytayMarketMap;