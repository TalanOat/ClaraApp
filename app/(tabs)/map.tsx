import { View, Text, StyleSheet, Button, Pressable, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps'
import Colors from '@/constants/Colors'
import mapStyle from '@/assets/data/mapStyle.json';

import * as Location from 'expo-location';
import { defaultStyles } from '@/constants/Styles'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_API_KEY } from '@/environments'
import { Image } from 'expo-image'




//import * as turf from '@turf/turf';

const GOOGLE_MAPS_APIKEY = GOOGLE_API_KEY;


interface Location {
  latitude: number;
  longitude: number;
}

const { width, height } = Dimensions.get("window");

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;




const Page = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: 52.62128509709368, latitudeDelta: LATITUDE_DELTA, longitude: 1.2566833989723016, longitudeDelta: LONGITUDE_DELTA
  });

  const [randomMarkers, setRandomMarkers] = useState<Location[]>([]);
  const [destination, setDestination] = useState<Location>();
  const [origin, setOrigin] = useState<Location>();
  const [randomPointsGenerated, setRandomPointsGenerated] = useState(false);



  const generateRandomPoints = (center: Location, radius: number, count: number): Location[] => {
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

  const filterPoints = (points: Location[]) => {

  }

  const reverseGeocode = async (point: Location) => {
    try {
      if (point) {
        const results = await Location.reverseGeocodeAsync({
          longitude: point.longitude,
          latitude: point.latitude,
        });

        console.log("reverseGeocode Results: ", results);

      }
    } catch (error) {
      console.error("Error in reverseGeocode:", error);
    }
  };



  const handleGetLocation = async () => {
    setIsLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission not granted');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setMapRegion({
      ...mapRegion,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    setOrigin({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })


    if (location && !randomPointsGenerated) {
      const generatedPoints = generateRandomPoints(
        location.coords,
        0.01,
        10
      );
      setRandomMarkers(generatedPoints);
      setDestination(generatedPoints[0]);
      setRandomPointsGenerated(true);
    }

    if (location) {

      setIsLoading(false);
      console.log(location.coords)
    }
  };

  const switchDestination = (marker: Location) => {
    setDestination(marker);
    console.log(marker)
    reverseGeocode(marker);
  }

  useEffect(() => {
    handleGetLocation();
  }, [])



  useEffect(() => {
    //handleGetLocation();
    setDestination(randomMarkers[0])
  }, [randomMarkers])

  const [selectedMarker, setSelectedMarker] = useState<Location>();


  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.primary, Colors.pink]}>
      <View style={styles.navAvoidingView}>
        <MapView
          //onRegionChange={onRegionChange}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          initialRegion={mapRegion
          }
        //customMapStyle={mapStyle}
        >
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="red"
          />
          {origin && (
            <Marker
              coordinate={origin}>
              <MaterialCommunityIcons name="pencil-circle" size={40} color="black" />
            </Marker>
          )}

          {randomMarkers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker}
              onPress={() => { setSelectedMarker(marker); }}
            >
              {selectedMarker && (
                <Callout key={index}
                  onPress={() => switchDestination(selectedMarker)}>
                  <Text>Navigate to marker</Text>
                </Callout>
              )}
            </Marker>
          ))}

        </MapView>
        {isLoading && (
          <View style={styles.loadingPopup}>
            <ActivityIndicator size="large" color={Colors.pink} />
          </View>
        )}
        <TouchableOpacity style={styles.currentLocationButton} onPress={() => { console.log("Button Pressed"); handleGetLocation() }}>
          <MaterialCommunityIcons name="crosshairs-gps" size={26} color="white" />
        </TouchableOpacity>
      </View>

    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%"
  },
  navAvoidingView: {
    flex: 1,
    marginBottom: 80
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
  currentLocationButtonText: {

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
  markerImage: {
    width: 35,
    height: 35
  }
})

export default Page