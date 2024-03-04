import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Touchable, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import testData from '@/assets/data/testData.json';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors';

import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInDown,

} from 'react-native-reanimated';
import { databaseService } from '@/model/databaseService';
import moment from 'moment';

import emotionsData from '@/assets/data/emotionsUpdated.json';
import Slider from '@react-native-community/slider'

interface TrackingValues {
  id: number;
  value1: string;
  value2: string;
  value3: string;
}

interface SelectedEmotion {
  baseKey: number;
  extendedKey?: string;
}



const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [userTrackingVals, setUserTrackingVals] = useState<TrackingValues>();

  /* ------------------------- BACKEND FOR THE SLIDERS ------------------------ */
  const [sliderValue1, setSliderValue1] = useState<number>(0);
  const [sliderValue2, setSliderValue2] = useState<number>(0);
  const [sliderValue3, setSliderValue3] = useState<number>(0);

  const fetchTrackingValues = async () => {
      try {
          const tempValues = await databaseService.getAllTrackingValues();
          setUserTrackingVals(tempValues);
      } catch (error) {
          console.error("error getting values:", error);
      }
  };

  const fetchTrackingData = async () => {
    try {
        const tempValues = await databaseService.getAllTrackingValues();
        setUserTrackingVals(tempValues);
    } catch (error) {
        console.error("error getting values:", error);
    }
};

  useEffect(() => {
      if (userTrackingVals) {
          setLoading(false);
      }
  }, [userTrackingVals]);

  useEffect(() => {
      setLoading(true);
      fetchTrackingValues().then(() => {
          setLoading(false);
      })
      console.log("pageID param: ", id)
  }, []);

  /* ---------------------------------- other --------------------------------- */


  const handleUpdate = () => {

    console.log("handle submit")
    //databaseUpdateMoodJournalEntry()
  }



  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}
    >
      <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(50)}>
        <View style={styles.topRow}>
          <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
          <Text style={styles.elementTitle}>Check In</Text>
          <TouchableOpacity onPress={() => { handleUpdate(); }} >
            <MaterialCommunityIcons name="check" size={40} color="white" />
          </TouchableOpacity>

        </View>
        <View style={styles.contentRow}>
          <Text style={[defaultStyles.titleHeader, styles.moodHeader]}>Morning John</Text>
          {/* first slider row : user interaction affects the sliderValue using a range from 0-1*/}
          {!loading && (
            <View style={styles.sliderRow}>
              <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                {userTrackingVals?.value1}
              </Text>
              <Slider style={{ width: 200, height: 40 }}
                value={sliderValue1}
                onValueChange={(value) => { setSliderValue1(value) }}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={Colors.pink}
                maximumTrackTintColor={Colors.primary} />
            </View>
          )}
          {/* second slider row */}
          {!loading && (
            <View style={styles.sliderRow}>
              <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                {userTrackingVals?.value2}
              </Text>
              <Slider style={{ width: 200, height: 40 }}
                value={sliderValue2}
                onValueChange={(value) => { setSliderValue2(value) }}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={Colors.pink}
                maximumTrackTintColor={Colors.primary} />
            </View>
          )}
          {/* third slider row */}
          {!loading && (
            <View style={styles.sliderRow}>
              <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                {userTrackingVals?.value3}
              </Text>
              <Slider style={{ width: 200, height: 40 }}
                value={sliderValue3}
                onValueChange={(value) => { setSliderValue3(value) }}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor={Colors.pink}
                maximumTrackTintColor={Colors.primary} />
            </View>
          )}
          {/* Emotions container */}
          <View style={emotionsStyles.emotionsContainer}>
          
          </View>
          

        </View>
      </Animated.ScrollView>
      {flashNotification && (
        <Animated.View entering={FadeInDown.delay(50)} exiting={FadeOutUp.delay(50)} style={flashMessage.container}>
          <Text style={flashMessage.innerText}>Success</Text>
        </Animated.View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  journalContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
    borderRadius: 10,
    marginRight: 15,
    marginLeft: 15,
  },
  submitFormButton: {
    marginTop: 100
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
  progressText: { marginBottom: 10, },
  sliderRow: {
    paddingTop: 10
  },
  moodHeader: {
    marginBottom: 15
  }
})

const emotionsStyles = StyleSheet.create({
  emotionsContainer: {
    marginTop: 25,
    flexDirection: "row",
    gap: 15,
    flexWrap: "wrap"
  },
  button: {
    //backgroundColor: Colors.pink,
    padding: 15,
    alignSelf: 'flex-start',
    borderRadius: 10,
    elevation: 10,
    opacity: 0.5
  },
  buttonText: {
    color: "white",
    fontFamily: "mon-b",
  },
  selectedButton: {
    //backgroundColor: Colors.primary,
    color: "black",
    opacity: 1
  },
  extendedEmotionsContainer: {
    marginTop: 15,
    flexDirection: "row",
    gap: 15,
    flexWrap: "wrap"
  },
  cancelButtonContainer: {},
  cancelButton: {
    padding: 11,
    alignSelf: 'flex-end',
    borderRadius: 10,
    elevation: 10,
    backgroundColor: Colors.primary
  },
  cancelButtonText: {}

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
  },
  innerText: {
    padding: 20,
    color: "white",
    fontFamily: "mon-b",
    fontSize: 15,

    backgroundColor: Colors.pink,
    borderRadius: 10,
    //margin: 50
  }
})



export default Page