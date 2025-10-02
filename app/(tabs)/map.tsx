import { View, Text, StyleSheet, Button, Pressable, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
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
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from 'expo-router'
import { Pedometer } from 'expo-sensors';
import { Subscription } from 'expo-notifications'
import MapboxMap from '@/components/leaflet/mapboxMap'
import StepCounter from '@/components/stepCounter'
//import LeafletMap from '@/components/leaflet/leafletMap'
//import MapboxMap from '@/components/leaflet/leafletMap'



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
  const navigation = useNavigation();
  const [pageFocused, setpageFocused] = useState(false);

  //listens for navigation changes, carries out code when this page is focused
  useEffect(() => {
    const navigationListener = navigation.addListener("focus", () => {
      setpageFocused(true);
      setTimeout(() => setpageFocused(false), 1000);
    });

    const blurListener = navigation.addListener("blur", () => {
      setpageFocused(false);
    });

    return () => {
      navigation.removeListener("focus", navigationListener);
      navigation.removeListener("blur", blurListener);
    };
  }, [navigation]);

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


  const switchDestination = (marker: Location) => {
    setDestination(marker);
    console.log(marker)
    reverseGeocode(marker);
  }

  const [thirdPartyEnabled, setThirdPartyEnabled] = useState<boolean>(true);

  const loadThirdPartySettings = async () => {
    try {
      const storedSetting = await SecureStore.getItemAsync('mapsEnabled');
      if (storedSetting) {
        const storedSettingAsBoolean = (storedSetting.toLowerCase() === "true");
        setThirdPartyEnabled(storedSettingAsBoolean);
      }
    } catch (error) {
      console.error('Error loading name:', error);
    }
  };


  // useEffect(() => {
  //   handleGetLocation();
  //   loadThirdPartySettings();
  // }, [])

  useEffect(() => {
    if (pageFocused) {
      //handleGetLocation();
      loadThirdPartySettings();
    }
  }, [pageFocused])



  useEffect(() => {
    //handleGetLocation();
    setDestination(randomMarkers[0])
  }, [randomMarkers])

  const [selectedMarker, setSelectedMarker] = useState<Location>();


  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.primary, Colors.pink]}>
      {thirdPartyEnabled && (
        <View style={styles.navAvoidingView}>

          <MapboxMap />


          {isLoading && (
            <View style={styles.loadingPopup}>
              <ActivityIndicator size="large" color={Colors.pink} />
            </View>
          )}

          {/* {Platform.OS === 'ios' && <StepCounter />}  */}
        </View>
      )}
      {!thirdPartyEnabled && (
        <View style={styles.navAvoidingView}>
          <Text style={styles.warningText}>Enable third party map settings to see this part of the app</Text>
        </View>
      )}


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
    bottom: 80,
    right: 0,
    backgroundColor: Colors.pink,
    padding: 12,
    margin: 10,
    //elevation: 20,
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
  },
  warningText: {
    color: "white",
    fontSize: 18,
    fontFamily: "mon-b",
    padding: 20
  }
})

export default Page