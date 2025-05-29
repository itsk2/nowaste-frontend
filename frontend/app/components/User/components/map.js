import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const Map = () => {
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const destination = {
    latitude: 14.558498,
    longitude: 121.133965,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);

      fetchDirections(userLocation.coords);
    })();
  }, []);


  const fetchDirections = async (userLocation) => {
    if (!userLocation) {
      console.error("User location not available.");
      return;
    }

    const startLat = userLocation.latitude;
    const startLng = userLocation.longitude;
    const destinationLat = 14.558498;
    const destinationLng = 121.133965;

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${startLat},${startLng}|${destinationLat},${destinationLng}&mode=bicycle&apiKey=6aac00f54b30483f88eb51497becc4eb`
      );
      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        console.error("No route found.");
        return;
      }

      const coordinates = data.features[0].geometry.coordinates.flatMap(segment =>
        segment.map(point => ({
          latitude: point[1],
          longitude: point[0],
        }))
      );

      setCoordinates(coordinates);
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };



  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: destination.latitude,
            longitude: destination.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {location && (
            <>
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
                pinColor="blue"

              />

              <Marker
                coordinate={destination}
                title="New Taytay Public Market"
                description="Pamilihang Bayan ng Taytay, Rizal"
              />

              {coordinates.length > 0 && (
                <Polyline
                  coordinates={coordinates}
                  strokeColor="blue"
                  strokeWidth={5}
                />
              )}
            </>
          )}
        </MapView>
      </View>
    </View>
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
  },
});

export default Map;