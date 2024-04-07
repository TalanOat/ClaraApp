import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, ViewStyle } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { JournalsContext } from '@/components/contexts/journalProvider';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  SlideInDown,
  SlideInUp,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  ZoomIn,
} from 'react-native-reanimated';

interface Journal {
  id: number;
  title: string;
  body: string;
  time: string;
}

interface MoodJournal {
  id: number;
  createdAt: string;
  trackingName1: string;
  figure1: number;
  trackingName2: string;
  figure2: number;
  trackingName3: string;
  figure3: number;
}

import JournalThemesComponent from '@/components/helpers/statsHelpers/themesComponent';
import ConjuctiveComponent from '@/components/helpers/statsHelpers/conjuctiveComponent';
import BarChartComponent from '@/components/helpers/statsHelpers/barChartComponent';
import { defaultStyles } from '@/constants/Styles';

const Page = () => {
  const navigation = useNavigation();
  const [pageFocused, setpageFocused] = useState(false);

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

  const [journalEntry, setJournalEntry] = useState<Journal>()
  const [moodJournalEntry, setMoodJournalEntry] = useState<MoodJournal | null>(null);
  const [loading, setLoading] = useState(false);
  const { journals } = useContext(JournalsContext);
  const [selectedTimeline, setSelectedTimeline] = useState<string>("Daily")

  const fetchLastEntry = () => {
    //setLoading(true);
    console.log("in lastJoruanl; ")
    const latestJournal = journals
      .filter(journal => journal.type === 'journal')
      .sort((a, b) => {
        return b.time.localeCompare(a.time);
      })[0];


    if (latestJournal.body) {
      const returnedEntry: Journal = ({
        id: splitId(latestJournal.id).id,
        title: latestJournal.title,
        body: latestJournal?.body,
        time: latestJournal.time
      });
      console.log("returnedEntry; ", returnedEntry)
      return returnedEntry
    }
    else {
      console.error("entry not found, or no entries exist")
    }
  }

  const fetchLastMoodJournal = () => {
    //setLoading(true);
    console.log("in moodJournal; ")
    const latestMoodJournal = journals
      .filter(journal => journal.type === 'mood')
      .sort((a, b) => {
        return b.time.localeCompare(a.time);
      })[0];
    //console.log("latestMoodJournal: ", latestMoodJournal)

    if (latestMoodJournal.trackingName1 && latestMoodJournal.trackingValue1 &&
      latestMoodJournal.trackingName2 && latestMoodJournal.trackingValue2 &&
      latestMoodJournal.trackingName3 && latestMoodJournal.trackingValue3) {
      const returnedMoodJournal: MoodJournal = ({
        id: splitId(latestMoodJournal.id).id,
        createdAt: latestMoodJournal.time,
        trackingName1: latestMoodJournal.trackingName1,
        figure1: latestMoodJournal.trackingValue1,
        trackingName2: latestMoodJournal.trackingName2,
        figure2: latestMoodJournal.trackingValue2,
        trackingName3: latestMoodJournal.trackingName3,
        figure3: latestMoodJournal.trackingValue3,
      });
      return (returnedMoodJournal);
    }
    else {
      console.error("no moodJournal to analysise")
    }

  };

  function splitId(prefixedId: string) {
    const parts = prefixedId.split("_");
    if (parts.length !== 2) {
      throw new Error("invalid string to split");
    }
    const prefix = parts[0];
    const id = parseInt(parts[1]);

    return { prefix, id };
  }


  const fetchLastJournals = () => {
    try {
      setLoading(true);
      if (journals.length === 0) {
        console.log("No mood Journal or Text Journal");

        const currentTime = new Date().toISOString()

        const journalEntryResult: Journal = ({
          id: -1,
          title: "placeholder",
          body: "placeholder",
          time: currentTime
        });

        const moodJournalResult: MoodJournal = ({
          id: -1,
          createdAt: currentTime,
          trackingName1: "placeholder",
          figure1: 0,
          trackingName2: "placeholder",
          figure2: 0,
          trackingName3: "placeholder",
          figure3: 0,
        });

        return { journalEntryResult, moodJournalResult }
      }
      else {
        const [journalEntryResult, moodJournalResult] = [fetchLastEntry(), fetchLastMoodJournal()]
        return { journalEntryResult, moodJournalResult };
      }
    }
    catch (error) {
      console.log("error fetching data:", error);
      return { journalEntryResult: undefined, moodJournalResult: undefined };
    }
    finally {
      setLoading(false);
    }
  };

  const fetchDataAndAssignData = async () => {
    try {
      //setLoading(true)
      setLoading(true)
      const fetchedObject = fetchLastJournals();

      if (fetchedObject.journalEntryResult && fetchedObject.moodJournalResult) {
        console.log("fetchedObject.journalEntryResult: ", fetchedObject.journalEntryResult)
        console.log("fetchedObject.moodJournalResult: ", fetchedObject.moodJournalResult)
        setJournalEntry(fetchedObject.journalEntryResult);
        setMoodJournalEntry(fetchedObject.moodJournalResult);
      }

    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setLoading(false);
    }
  };

  const handleTimelineChanged = (timeline: string) => {
    setSelectedTimeline(timeline)
  }



  useEffect(() => {
    if (pageFocused) {
      fetchDataAndAssignData();
    }
  }, [pageFocused])

  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      <View style={{ flex: 1, paddingBottom: 0, marginBottom: 90 }}>
        {!loading && (
          <Animated.ScrollView style={styles.statsContainer} >

            {journalEntry?.id === -1 && moodJournalEntry?.id === -1 && !loading && (
              <View>
                <BarChartComponent handleTimelineChanged={handleTimelineChanged} journalParam={journalEntry} moodJournalParam={moodJournalEntry}></BarChartComponent>
                <View style={styles.warningRow}>
                  <Text style={[defaultStyles.subTitleHeader]}>No Daily Analysis Available:</Text>
                  <Text style={styles.warningText}>Please add today's mood Journal</Text>
                  <Text style={styles.warningText}>Please add today's text Journal</Text>
                </View>
              </View>
            )}

            {journalEntry && journalEntry?.id !== -1 && moodJournalEntry && moodJournalEntry?.id !== -1 && !loading && (
              <>
                <BarChartComponent handleTimelineChanged={handleTimelineChanged} journalParam={journalEntry} moodJournalParam={moodJournalEntry}></BarChartComponent>
                {selectedTimeline === "Daily" && (
                  <>
                    <JournalThemesComponent journalBody={journalEntry.body}></JournalThemesComponent>
                    <ConjuctiveComponent journalBody={journalEntry.body}></ConjuctiveComponent>
                  </>
                )}
                {selectedTimeline !== "Daily" && (

                  <View style={styles.warningRow}>
                    <Text style={[defaultStyles.subTitleHeader]}>No Daily Analysis Available in {selectedTimeline} View</Text>
                  </View>

                )}
              </>
            )}

          </Animated.ScrollView>
        )}
        {loading && (
          <Animated.View style={styles.loadingPopup} entering={ZoomIn.delay(200)} exiting={SlideInUp.delay(100)}>
            <ActivityIndicator size="large" color={Colors.pink} />
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flex: 1,
    //marginBottom: 80,
    paddingLeft: 25,
    paddingRight: 25
  },
  loadingPopup: {
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center'
  },
  moodFeedbackContainer: {
    flexDirection: 'column',
    justifyContent: "flex-start",
    paddingTop: 20
  },
  chartContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "center",
  },
  timelineNav: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    paddingBottom: 15,
    paddingTop: 15,
  },
  trackingNav: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 15,
    paddingTop: 5,
    gap: 10
  },
  button: {
    backgroundColor: Colors.transparentWhite,
    padding: 12,
    borderRadius: 10,
    //elevation: 10,
  },
  buttonText: {
    color: "white",
    fontFamily: "mon-b",
    alignSelf: "center",
    fontSize: 12
  },
  wordBubble: {
    backgroundColor: Colors.transparentPrimary,
    padding: 12,
    borderRadius: 10,
    //elevation: 10,
  },
  selectedBubble: {
    backgroundColor: Colors.pink,
    padding: 12,
    borderRadius: 10,
  },
  header: {
    paddingBottom: 10
  },
  wordBubbleContainer: {
    justifyContent: "flex-start",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    paddingTop: 10,
    paddingBottom: 20
  },

  textIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingBottom: 10,
    paddingTop: 20
  },
  warningRow: {
    justifyContent: "space-between",
    //alignItems: "center",
    //flex: 1,
    paddingBottom: 10,
    paddingTop: 20,
    gap: 5
  },
  warningText: {
    color: "white",
    fontFamily: "mon-sb",
    fontSize: 16
  }

})

export default Page