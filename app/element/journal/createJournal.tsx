import { View, Text, TextInput, StyleSheet, Touchable, TouchableOpacity, } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { defaultStyles } from '@/constants/Styles'

import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { databaseService } from '@/model/databaseService'
import Colors from '@/constants/Colors'
import CryptoJS from "react-native-crypto-js";
import * as SecureStore from 'expo-secure-store';

import { JournalsContext } from '@/components/contexts/journalProvider'
import { DetectionContext } from '@/components/contexts/detectionContext'
import { adminDatabaseService } from '@/model/adminDatabaseService'
import * as Location from 'expo-location';
import { DateContext } from '@/components/contexts/dateProvider';

enum usageTypes {
  JOURNAL_LOG = "journal_add",
  MOOD_LOG = "mood_add",
  MAP_USE = "map_use"
}

interface Coordinate {
  latitude: number,
  longitude: number
}

const placeholderValues = [
  "What's on your mind?",
  "How are you feeling today?",
  "Write about a memorable moment...",
];

const createJournal = () => {
  const [text, setText] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [flashNotification, setFlashNotification] = useState(false);
  const [userPin, setUserPin] = useState('');

  const { fetchData } = useContext(JournalsContext);
  const {  headerDate } = useContext(DateContext);
  const { logWindowStart, logWindowEnd } = useContext(DetectionContext);
  const textInputRef = useRef<TextInput>(null);

  const handleInputChange = (input: string) => {
    setText(input);
    //console.log(text)
  }

  const loadPinSettings = async () => {
    try {
      const storedPin = await SecureStore.getItemAsync('userPin');
      if (storedPin) {
        setUserPin(storedPin);
      }
    } catch (error) {
      console.error('Error loading name:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 600);

    logWindowStart(usageTypes.JOURNAL_LOG);
    loadPinSettings();
  }, []);



  async function databaseCreateJournalEntry() {
    try {
      let locationId = null;
      if (locationToggle == true) {
        const journalLocation = await fetchUserLocation();

        if (journalLocation) {
          locationId = await databaseService.createLocation(journalLocation.latitude, journalLocation.longitude, "null")
        }
      }
      // encrypt body first then send to the database
      if (userPin !== "") {
      //console.log("headerDate: ", headerDate.date)
        //const currentTime = new Date().toISOString()
        const currentTime = headerDate.date.toISOString();
        //await databaseService.createJournalEntry("Journal Entry", text, currentTime);
        let cipherText = CryptoJS.AES.encrypt(text, userPin).toString();
        if (locationId != null) {
          await databaseService.createJournalEntryWithLocation("Journal Entry", cipherText, currentTime, locationId);
        }
        else {
          await databaseService.createJournalEntry("Journal Entry", cipherText, currentTime);
        }
      }
      else {
        console.log("error no pin")
      }
    }
    catch (error) {
      console.error("update error:", error);
    }
    finally {
      fetchData();
      logWindowEnd(usageTypes.JOURNAL_LOG);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex(prevIndex => (prevIndex + 1) % placeholderValues.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);


  const handleSubmit = () => {
    databaseCreateJournalEntry()
    setFlashNotification(true);

    setTimeout(() => {
      setFlashNotification(false);
    }, 1000);
  }

  const fetchUserLocation = async () => {
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

  const [locationToggle, setLocationToggle] = useState(false);

  const handleLocationToggle = () => {
    setLocationToggle(!locationToggle);
  };


  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.primary, Colors.pink]}
    >
      <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(50)}>
        <View style={styles.topRow}>
          <MaterialCommunityIcons name="lead-pencil" size={40} color="white" style={styles.elementIcon} />
          <Text style={styles.elementTitle}>Add Journal</Text>
          <TouchableOpacity onPress={() => { handleLocationToggle(); }} style={styles.locationPin} >
            <MaterialCommunityIcons name={locationToggle ? "map-marker" : "map-marker-off"} size={35} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { handleSubmit(); }} >
            <MaterialCommunityIcons name="check" size={40} color={Colors.pink} />
          </TouchableOpacity>

        </View>
        <View style={styles.contentRow}>
          <TextInput
            style={styles.journalInput}
            onChangeText={handleInputChange}
            value={text}
            placeholder={placeholderValues[placeholderIndex]}
            placeholderTextColor="gray"
            multiline={true}
            numberOfLines={20}
            ref={textInputRef}
          />
        </View>
      </Animated.ScrollView>
      {flashNotification && (
        <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
          <Text style={flashMessage.innerText}>Added</Text>
        </Animated.View>
      )}
    </LinearGradient>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  journalInput: {
    height: "100%",
    borderColor: 'transparent',
    color: "white",
    fontFamily: "mon",
    fontSize: 16,
    textAlignVertical: 'top',
    maxHeight: 250
  },
  journalContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
    borderRadius: 10,
    marginRight: 15,
    marginLeft: 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  elementTitle: {
    color: "white",
    fontSize: 15,
    fontFamily: "mon-b",
    flex: 1
  },
  elementIcon: {
    marginRight: 10
  },
  contentRow: {
    padding: 20
  },
  locationPin: {
    paddingRight: 20
  },
})

const flashMessage = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    //borderRadius: 10,
    overflow: "hidden"
  },
  innerText: {
    padding: 20,
    color: "white",
    fontFamily: "mon-b",
    fontSize: 15,

    backgroundColor: Colors.pink,
    borderRadius: 10,
    //margin: 50
    overflow: "hidden"
  }
})


export default createJournal