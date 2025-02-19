import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const Map = () => {
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

  const destination = {
    latitude: 14.55868,
    longitude: 121.13455,
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 14.55868,
            longitude: 121.13455,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {location && (
            <>
              {/* Marker for User Location */}
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
                pinColor="blue"
              />
              
              {/* Marker for Destination */}
              <Marker
                coordinate={destination}
                title="New Taytay Public Market"
                description="Pamilihang Bayan ng Taytay, Rizal"
              />

              {/* Simple Route Line */}
              <Polyline
                coordinates={[
                  { latitude: location.latitude, longitude: location.longitude },
                  { latitude: destination.latitude, longitude: destination.longitude },
                ]}
                strokeColor="blue"
                strokeWidth={4}
              />
            </>
          )}
        </MapView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  map: {
    width: '100%',
    height: '100%',
    paddingBottom: 60,
  },
});

export default Map;