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

  const fetchLastEntry = () => {
    //setLoading(true);

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
      //console.log("returnedEntry; ", returnedEntry)
      return returnedEntry
    }
    else {
      console.error("entry not found, or no entries exist")
    }



  }

  const fetchLastMoodJournal = () => {
    //setLoading(true);

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
      //const [journalEntryResult, moodJournalResult] = await Promise.all([fetchLastEntry(), fetchLastMoodJournal()]);
      const [journalEntryResult, moodJournalResult] = [fetchLastEntry(), fetchLastMoodJournal()]
      //console.log("journalEntryResult: ", journalEntryResult)
      //console.log("moodJournalResult: ", moodJournalResult)
      return { journalEntryResult, moodJournalResult };

    }
    catch (error) {
      console.log("Error fetching data:", error);
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

            {journalEntry && moodJournalEntry && !loading && (
              <BarChartComponent journalParam={journalEntry} moodJournalParam={moodJournalEntry}></BarChartComponent>
            )}

            {journalEntry?.body && !loading && (
              <JournalThemesComponent journalBody={journalEntry.body}></JournalThemesComponent>
            )}

            {journalEntry?.body && !loading && (
              <ConjuctiveComponent journalBody={journalEntry.body}></ConjuctiveComponent>
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

})

export default Page