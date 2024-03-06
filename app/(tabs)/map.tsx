import { View, Text, StyleSheet, Button, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import Colors from '@/constants/Colors'
import mapStyle from '@/assets/data/mapStyle.json';

import * as Location from 'expo-location';
import { defaultStyles } from '@/constants/Styles'
import { MaterialCommunityIcons } from '@expo/vector-icons'

let testlocatons = [{
  title: "test",
  location: {
    latitude: 52.6212,
    longitude: 1.25668
  },
  description: "test marker",
  calloutText: "location 1"
}]

interface Location {
  latitude: number;
  longitude: number;
}

const Page = () => {
  const onRegionChange = (region: any) => {
    console.log(region)
  }

  const [isLoading, setIsLoading] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: 52.62128509709368, latitudeDelta: 0.018099873381153486, longitude: 1.2566833989723016, longitudeDelta: 0.019608259215829094
  });

  //!TODO random point generation:
  const [randomMarkers, setRandomMarkers] = useState<Location[]>([]);

  const generateRandomPoints = (center: Location, radius: number, count: number) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const randomOffsetX = (Math.random() * 2 * radius) - radius;
      const randomOffsetY = (Math.random() * 2 * radius) - radius;

      points.push({
        latitude: center.latitude + randomOffsetX,
        longitude: center.longitude + randomOffsetY
      });
    }
    return points;
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

    if (location) {
      const generatedPoints = generateRandomPoints(
        location.coords,
        0.01, // Radius of 0.05 degrees (adjust as needed)
        10    // Number of points to generate
      );
      setRandomMarkers(generatedPoints);
      setIsLoading(false);
      console.log(location.coords)
    }
  };

  const testPrint = () => {
    console.log("test")
  }

  useEffect(() => {
    handleGetLocation();
  }, [])

  // const showLocations = () => {
  //   return testlocatons.map((item, index) => {
  //     return (
  //       <Marker
  //         key={index}
  //         coordinate={item.location}
  //         title={item.title}
  //         description={item.description}
  //         pinColor={Colors.pink}>
  //         <Callout>
  //           <Text>Count: {count}</Text>
  //           <Button title='Add Count?' onPress={() => setCount(count + 1)}></Button>
  //         </Callout>
  //       </Marker>
  //     )
  //   })
  // }

  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      <View style={styles.navAvoidingView}>
        <MapView
          //onRegionChange={onRegionChange}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
        //customMapStyle={mapStyle}
        >
          {/* {showLocations()} */}

          {/* <Button title="Get Location" onPress={() => { console.log("Button Pressed"); testPrint() }} /> */}
          {randomMarkers.map((marker, index) => (
            <Marker key={index} coordinate={marker} />
          ))}
        </MapView>
        {/* Loading Indicator */}
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
})

export default Page