import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';

//import html_script from './leafletHTML'
import html_script from './mapboxHTML'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors'
import MapView from 'react-native-maps';
import { databaseService } from '@/model/databaseService';
import { NavigationProp } from '@react-navigation/native';

interface Coordinate {
  latitude: number,
  longitude: number
}

interface MarkerLocation {
  name: string,
  coords: Coordinate
}

// interface JournalMarker {
//   name: string,
//   journalId: number,
//   type: string,
//   date: string,
//   coords: Coordinate
// }

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface JournalEntry {
  id: number;
  title: string;
  location_id: number;
  createdAt: string;
}

interface JournalMarker {
  name: string;
  journalId: number;
  date: string;
  coords: {
    latitude: number;
    longitude: number;
  };
}


const MapboxMap = () => {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<Coordinate>();

  const MAPBOX_TOKEN = 'pk.eyJ1IjoidGFsYW5vIiwiYSI6ImNsd3A2M2xobjA5dWsyanFkNGE3aTc1NHYifQ.nKdkgfYCKT_zNUoGhDMhCQ';


  function parseStringToMarker(input: string) {
    const placeName = input.split(", Coordinates: ")[0].replace("Name: ", "");
    const coordinates = JSON.parse(input.split(", Coordinates: ")[1]);
    const returnMarker: MarkerLocation = ({
      name: placeName,
      coords: {
        latitude: coordinates[1],
        longitude: coordinates[0]
      }
    })
    console.log("returnMarker: ", returnMarker)
    return returnMarker;
  }

  const navigation = useNavigation<any>();

  const onMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === 'mapLoaded') {
      console.log('The map has been loaded successfully');
      setMapLoaded(true)
    }
    else if (message.includes('Name:')) {
      const markerToNav = parseStringToMarker(message);
      if (userCoords != undefined) {
        drawRoute(userCoords, markerToNav.coords)
      }
    }
    else if (message.includes('Navigate to journal entry:')) {
      //console.log("post message: ", message)
      const journalId = parseInt(message.split(':')[1].trim());

      navigation.navigate('element/journal/[id]', { id: journalId });
      //navigation.navigate(completeURL)

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

  const handleFocusMap = async () => {
    const userLocation = await handleGetLocation();

    if (userLocation) {
      setUserCoords(userLocation)
      flyToCoord(userLocation);
      removeUserMarker();
      addUserPinFromCoord(userLocation)
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

  const getNearestPOI = async (point: Coordinate) => {
    const lat = point.latitude;
    const lon = point.longitude;
    // fetch the reverse geocoded location data
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&types=poi`);
    const data = await response.json();

    // list of keywords to avoid
    const blacklistStrings = ['school', 'hospital', 'prison', 'police', 'fire station'];

    // check if the location type is in the avoid list
    if (data.features[0].place_type) {
      const placeName = data.features[0].place_name.split(',').slice(0, 2).join(',');
      const shouldAvoid = blacklistStrings.some(keyword => placeName.toLowerCase().includes(keyword));

      if (!shouldAvoid) {
        const returnMarker: MarkerLocation = ({
          name: placeName,
          coords: {
            latitude: data.features[0].center[1],
            longitude: data.features[0].center[0]
          }
        })

        return returnMarker;
      }
    }

    return null;
  }

  const plot_POI_Markers = async (points: Coordinate[]) => {
    for (const point of points) {
      const test = await getNearestPOI(point);
      if (test) {
        //addPinFromCoord(test?.coords)
        addMarkerFromCoord(test?.coords, test.name)
      }

    }
  }


  const fetchAllJournalLocations = async () => {
    try {
      const journals = await databaseService.getAllJournalEntriesWithLocations();
      if (journals) {
        const journalMarkers = journals.map(async (journal) => {
          const location = await databaseService.getLocation(journal.location_id);
          return {
            name: journal.title,
            journalId: journal.id,
            type: "Journal Entry",
            date: journal.createdAt,
            coords: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          };
        });
        return Promise.all(journalMarkers);
      }
    } catch (error) {
      console.error("error fetching journal locations: ", error);
    }
  };


  const setupMap = async () => {
    const userLocation = await handleGetLocation();

    if (userLocation) {
      setUserCoords(userLocation)
      flyToCoord(userLocation)
      addUserPinFromCoord(userLocation)
      const journalLocations = await fetchAllJournalLocations();
      if (journalLocations) {
        console.log("journalLocations", journalLocations)
        const coords = journalLocations.map(journal => journal.coords);
        const names = journalLocations.map(journal => journal.name);
        //addGroupedMarkers(coords, names);
        addClusteredMarkers(coords, names)
      }

      const randomPoints = generateRandomPoints(userLocation, 0.01, 10);
      //plot_POI_Markers(randomPoints);
    }
  }

  const addClusteredMarkers = async (locations: Coordinate[], popupTexts: string[]) => {
    console.log("locations: ", locations);
    if (mapRef.current) {
      const features = locations.map((location, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        properties: {
          popupText: popupTexts[index]
        }
      }));
  
      const sourceData = {
        type: 'FeatureCollection',
        features: features
      };
  
      const jsCode = `
        map.addSource('markers', {
          type: 'geojson',
          data: ${JSON.stringify(sourceData)},
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
  
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'markers',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#51bbd6',
            'circle-radius': 20
          }
        });
  
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'markers',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });
  
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'markers',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 10,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });
  
        map.on('click', 'unclustered-point', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const popupText = e.features[0].properties.popupText;
  
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupText)
            .addTo(map);
        });
  
        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
  
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });
      `;
  
      mapRef.current.injectJavaScript(jsCode);
    }
  }



  // const addJournalMarkersFromCoord = async (location: Coordinate, popupText: string, journalMarkers: JournalMarker[]) => {
  //   if (mapRef.current) {
  //     let journalList = '';
  //     for (let i = 0; i < journalMarkers.length; i++) {
  //       journalList += `<a href="#" onclick="window.ReactNativeWebView.postMessage('Navigate to journal entry: ${journalMarkers[i].journalId}')">${journalMarkers[i].name}</a><br/>`;
  //     }

  //     const markerInfo = `Name: ${popupText}, Coordinates: [${location.longitude}, ${location.latitude}]`;
  //     const html = `${popupText}<br/>${journalList}<button onclick="window.ReactNativeWebView.postMessage('${markerInfo}')">Navigate</button>`;
  //     const jsCode = `
  //       window.markers = window.markers || {};
  //       window.markers['${markerId}'] = new mapboxgl.Marker(({ color: 'pink'}))
  //         .setLngLat([${location.longitude}, ${location.latitude}])
  //         .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('${html.replace(/'/g, "\\'")}'))
  //         .addTo(map);
  //     `;
  //     mapRef.current.injectJavaScript(jsCode);

  //     markerId++;
  //   }
  // }

  useEffect(() => {
    if (mapLoaded == false) {
      setIsLoading(true);

    }
    if (mapLoaded == true) {
      setIsLoading(false);
      setupMap();

    }

  }, [mapLoaded])


  // TODO: mapbox functions
  const addUserPinFromCoord = async (location: Coordinate) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        window.userMarker = new mapboxgl.Marker(({ color: 'purple'}))
          .setLngLat([${location.longitude}, ${location.latitude}])
          .addTo(map);
      `);
    }
  }

  const removeUserMarker = () => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        if (window.userMarker) {
          window.userMarker.remove();
          window.userMarker = null;
        }
      `);
    }
  }

  let markerId = 0;
  const addPinFromCoord = async (location: Coordinate) => {
    if (mapRef.current) {
      const currentMarkerId = markerId;
      mapRef.current.injectJavaScript(`
        window.markers = window.markers || {};
        window.markers['${currentMarkerId}'] = new mapboxgl.Marker(({ color: 'pink'}))
          .setLngLat([${location.longitude}, ${location.latitude}])
          .addTo(map);
      `);

      markerId++;
    }
  }

  const addMarkerFromCoord = async (location: Coordinate, popupText: string) => {
    if (mapRef.current) {
      const markerInfo = `Name: ${popupText}, Coordinates: [${location.longitude}, ${location.latitude}]`;
      const html = `${popupText}<br/><button onclick="window.ReactNativeWebView.postMessage('${markerInfo}')">Navigate</button>`;
      const jsCode = `
        window.markers = window.markers || {};
        window.markers['${markerId}'] = new mapboxgl.Marker(({ color: 'pink'}))
          .setLngLat([${location.longitude}, ${location.latitude}])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('${html.replace(/'/g, "\\'")}'))
          .addTo(map);
      `;
      mapRef.current.injectJavaScript(jsCode);

      markerId++;
    }
  }



  const removeMarker = (id: number) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        if (window.markers && window.markers['${id}']) {
          window.markers['${id}'].remove();
          delete window.markers['${id}'];
        }
      `);
    }
  }

  const flyToCoord = (location: Coordinate) => {
    if (mapRef.current) {
      mapRef.current.injectJavaScript(`
        // Move the map to the specified location with a zoom level of 14
        map.flyTo({
          center: [${location.longitude}, ${location.latitude}],
          essential: true, // Make sure the map is essential for the app
          zoom: 14 // Set the zoom level to 14
        });
      `);
    }
  };

  const drawRoute = async (start: Coordinate, end: Coordinate) => {
    console.log('Start:', start);
    console.log('End:', end);

    const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`)
    const data = await response.json();
    //console.log('API Response:', data);

    const routeColor = Colors.primary;

    if (mapRef.current) {
      const route = data.routes[0].geometry.coordinates;
      console.log('Route:', route);

      const routeGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

      mapRef.current.injectJavaScript(`
        mapboxgl.accessToken = '${MAPBOX_TOKEN}';
        
        map.addSource('route', {
          type: 'geojson',
          data: ${JSON.stringify(routeGeoJSON)}
        });
  
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '${routeColor}', 'line-width': 6 }
        });
  
        map.flyTo({
          center: [${start.longitude}, ${start.latitude}],
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
    bottom: 500,
    //backgroundColor:
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 0,
    backgroundColor: Colors.pink,
    padding: 12,
    margin: 20,
    //elevation: 20,
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