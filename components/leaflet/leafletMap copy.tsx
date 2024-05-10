import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

import html_script from './leafletHTML'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors'
import MapView from 'react-native-maps';

interface Coordinate {
  latitude: number,
  longitude: number
}


const LeafletMap = () => {
  const mapRef = useRef<any>(null);

  const handleGetLocation = async () => {
    //setIsLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission not granted');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const mapRegion: Coordinate = ({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    console.log("mapRegion", mapRegion)

    return mapRegion

    //L.marker([${mapRegion.latitude}, ${mapRegion.longitude}]).addTo(map);

    // if (mapRef.current) {
    //   mapRef.current.injectJavaScript(`
    //     map.setView([${mapRegion.latitude}, ${mapRegion.longitude}], 15);
    //     L.marker([${mapRegion.latitude}, ${mapRegion.longitude}]).addTo(map);

    //   `);
    // }
  };

  const handleFocusMap = async () => {
    const userLocation = await handleGetLocation();
    if (userLocation) {
      if (mapRef.current) {
        mapRef.current.injectJavaScript(`
          map.setView([${userLocation.latitude}, ${userLocation.longitude}], 15);
        `);
      }
    }
  }

  const focusMapToCoord = async (location: Coordinate) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        map.setView([${location.latitude}, ${location.longitude}], 15);
      `);
    }
  }

  const addMarkerToCoord = async (location: Coordinate) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        L.marker([${location.latitude}, ${location.longitude}]).addTo(map);
      `);
    }
  }

  useEffect(() => {
    const initMapDelay = setTimeout(async () => {
      const userLocation = await handleGetLocation();
      if (userLocation) {
        focusMapToCoord(userLocation)
        addMarkerToCoord(userLocation)
      }
    }, 1000);

    return () => clearTimeout(initMapDelay);
  }, []);

  return (
    <>
      <WebView
        style={styles.container}
        source={{ html: html_script }}
        ref={mapRef}
      />
      <TouchableOpacity style={styles.currentLocationButton} onPress={() => { handleFocusMap() }}>
        <MaterialCommunityIcons name="crosshairs-gps" size={26} color="white" />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 500
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 0,
    backgroundColor: Colors.pink,
    padding: 12,
    margin: 25,
    elevation: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default LeafletMap;