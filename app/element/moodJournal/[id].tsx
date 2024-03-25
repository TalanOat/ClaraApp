import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Touchable, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
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
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { databaseService } from '@/model/databaseService';
import moment from 'moment';

import emotionsData from '@/assets/data/emotionsUpdated.json';
import Slider from '@react-native-community/slider'
import { JournalsContext } from '@/components/contexts/journalProvider'

interface TrackingValues {
  id: number;
  value1: string;
  value2: string;
  value3: string;
}

interface MoodJournal {
  id: number,
  createdAt: string;
  trackingName1: number;
  figure1: number;
  trackingName2: number;
  figure2: number;
  trackingName3: number;
  figure3: number;
}

interface SelectedEmotion {
  baseKey: number;
  extendedKey?: string;
}

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [moodJournalEntry, setMoodJournalEntry] = useState<MoodJournal>();

  /* ------------------------- BACKEND FOR THE SLIDERS ------------------------ */
  const [sliderValue1, setSliderValue1] = useState<number>(0);
  const [sliderValue2, setSliderValue2] = useState<number>(0);
  const [sliderValue3, setSliderValue3] = useState<number>(0);


  const { fetchData } = useContext(JournalsContext);


  const fetchMoodJournal = async (): Promise<MoodJournal | undefined> => {
    setLoading(true);
    try {
      const tempMoodJournal = await databaseService.getMoodJournalByID(parseInt(id));
      if (tempMoodJournal) {
        const returnedMoodJournal: MoodJournal = ({
          id: tempMoodJournal.id,
          createdAt: tempMoodJournal.created_at,
          trackingName1: tempMoodJournal.tracking_name1,
          figure1: tempMoodJournal.tracking_value1,
          trackingName2: tempMoodJournal.tracking_name2,
          figure2: tempMoodJournal.tracking_value2,
          trackingName3: tempMoodJournal.tracking_name3,
          figure3: tempMoodJournal.tracking_value3,
        });

        // console.log("returnedMoodJournal: ", returnedMoodJournal)
        //console.log("tempMoodJournal: ", tempMoodJournal)
        return returnedMoodJournal
      }
    }
    catch (error) {
      console.error("error getting mood Journals:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const fetchEmotionsForMoodJournal = async () => {
    //setLoading(true);
    try {
      if (moodJournalEntry) {
        //console.log("moodJournalEntry.id!! ", moodJournalEntry.id)
        const test = await databaseService.getEmotionsForMoodJournal(moodJournalEntry.id)
        if (test) {
          return test
        }
      }
      else if (!moodJournalEntry) {
        console.log("no moodJournal to link")
        return null
      }

    }
    catch (error) {
      console.error("error getting mood journal emotions:", error);
    }
    finally {
      setLoading(false);
    }
  };

  //! todo handle the emotions array being empty
  useEffect(() => {
    //console.log("moodJournalEntry: ", moodJournalEntry)
    setLoading(true);
    const fetchEmotionsData = async () => {
      const emotions = await fetchEmotionsForMoodJournal();
      if (emotions) {
        console.log("emotions: ", emotions)
      }
    }
    fetchEmotionsData().finally(() => {
      setLoading(false)
    });

  }, [moodJournalEntry]);

  /* ---------------------------------- other --------------------------------- */


  const databaseUpdateMoodJournalEntry = async (figure1: number, figure2: number, figure3: number) => {
    try {
      console.log("figure1:", figure1, "figure2:", figure2, "figure3:", figure3)
      const updatedMoodJournal = await databaseService.updateMoodJournalFigures(parseInt(id),
        figure1,
        figure2,
        figure3);
      if (updatedMoodJournal) {
        console.log("success")
      }
    }
    catch (error) {
      console.error(error, "there was an problem updating the mood Journal")
    }
    finally{
      fetchData();
    }
  }

  const handleUpdate = () => {
    setFlashNotification(true);

    databaseUpdateMoodJournalEntry(
      Math.round(sliderValue1),
      Math.round(sliderValue2),
      Math.round(sliderValue3)
    )

    setTimeout(() => {
      setFlashNotification(false);
    }, 1000);
  }

  //! TODO do the tracking values need to be syncrounous, can it not be asycn  ?
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const tempMoodJournal = await fetchMoodJournal();

      if (tempMoodJournal) {
        setMoodJournalEntry(tempMoodJournal)
        setSliderValue1(tempMoodJournal.figure1);
        setSliderValue2(tempMoodJournal.figure2);
        setSliderValue3(tempMoodJournal.figure3);
      }
    }
    fetchData().finally(() => {
      setLoading(false)
    });
  }, []);


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
                {moodJournalEntry?.trackingName1}
              </Text>
              <Slider style={{ width: 200, height: 40 }}
                value={moodJournalEntry?.figure1}
                onValueChange={(value) => { setSliderValue1(value) }}
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor={Colors.pink}
                maximumTrackTintColor={Colors.primary} />
            </View>
          )}
          {/* second slider row */}
          {!loading && (
            <View style={styles.sliderRow}>
              <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                {moodJournalEntry?.trackingName2}
              </Text>
              <Slider style={{ width: 200, height: 40 }}
                value={moodJournalEntry?.figure2}
                onValueChange={(value) => { setSliderValue2(value) }}
                minimumValue={0}
                maximumValue={100}
                minimumTrackTintColor={Colors.pink}
                maximumTrackTintColor={Colors.primary} />
            </View>
          )}
          {/* third slider row */}
          {!loading && (
            <View style={styles.sliderRow}>
              <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                {moodJournalEntry?.trackingName3}
              </Text>
              <Slider style={{ width: 200, height: 40 }}
                value={moodJournalEntry?.figure3}
                onValueChange={(value) => { setSliderValue3(value) }}
                minimumValue={0}
                maximumValue={100}
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
        <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
          <Text style={flashMessage.innerText}>Updated</Text>
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