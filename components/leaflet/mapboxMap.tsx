import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

//import html_script from './leafletHTML'
import html_script from './mapboxHTML'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors'
import MapView from 'react-native-maps';

interface Coordinate {
  latitude: number,
  longitude: number
}

const MapboxMap = () => {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onMessage = (event: any) => {
    if (event.nativeEvent.data === 'mapLoaded') {
      console.log('The map has been loaded successfully');
      setMapLoaded(true)
    }
  };

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

    return mapRegion
  };

  const removeExistingMarkers = async () => {
    if (mapRef.current) {
      const teststring = "ahsdas";
      mapRef.current.injectJavaScript(`
        focusMapInstant(${teststring});
      `);
    }
  };

  const addMarkerToCoord = async (location: Coordinate) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
      const marker1 = new mapboxgl.Marker(({ color: 'purple'}))
        .setLngLat([${location.longitude}, ${location.latitude}])
        .addTo(map);
      `);
    }
  }

  const handleFocusMap = async () => {
    //removeExistingMarkers();

    const userLocation = await handleGetLocation();

    if (userLocation) {


      flyToCoord(userLocation);
      //   focusMapToCoord(userLocation)
      //   addMarkerToCoord(userLocation)
    }

  }

  const generateRandomPoints = (center: Coordinate, radius: number, count: number): Coordinate[] => {
    const points = [];
    // (1) loop the specified "count"
    for (let i = 0; i < count; i++) {
      // (2) generate random offsets for latitude and longitude, in random locations 
      //  contained in the boundary of double the users radius
      const randomOffsetX = (Math.random() * 2 * radius) - radius;
      const randomOffsetY = (Math.random() * 2 * radius) - radius;

      points.push({
        latitude: center.latitude + randomOffsetX,
        longitude: center.longitude + randomOffsetY
      });
    }
    return points;
  };

  const setupMap = async () => {
    const userLocation = await handleGetLocation();
    if (userLocation) {
      flyToCoord(userLocation)
      addMarkerToCoord(userLocation)
      //const test = generateRandomPoints(userLocation, 0.01, 10);
    }
  }

  useEffect(() => {
    if (mapLoaded == false) {
      setIsLoading(true);
    }
    if (mapLoaded == true) {
      setIsLoading(false);
      setupMap();
    }

  }, [mapLoaded])

  const flyToCoord = (location: Coordinate) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
      map.flyTo({
        center: [${location.longitude}, ${location.latitude}],
        essential: true,
        zoom: 14
    });
      `);
    }
  };




  return (
    <>
      <WebView
        style={styles.container}
        source={{ html: html_script }}
        ref={mapRef}
        onMessage={onMessage}
      />
      <TouchableOpacity style={styles.currentLocationButton} onPress={() => { handleFocusMap() }}>
        <MaterialCommunityIcons name="crosshairs-gps" size={26} color="white" />
      </TouchableOpacity>
      {isLoading && (
        <View style={styles.loadingPopup}>
          <ActivityIndicator size="large" color={Colors.pink} />
        </View>
      )}
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
    margin: 20,
    elevation: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingPopup: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center'
  },
});

export default MapboxMap;