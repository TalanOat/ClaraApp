import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { databaseService } from '@/model/databaseService'
import moment from 'moment';
import Colors from '@/constants/Colors';
import { useNavigation } from 'expo-router';

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




//! TODO implement loading state and animation
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

  useEffect(() => {
    if (pageFocused) {
      fetchData();
    }
  }, [pageFocused])


  /* ------------------------- end of navigation code ------------------------- */

  const [journalEntry, setJournalEntry] = useState<Journal>()
  const [moodJournalEntry, setMoodJournalEntry] = useState<MoodJournal | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLastEntry = async () => {
    try {
      const entry = await databaseService.getLastJournalEntry();
      if (entry) {
        setJournalEntry({
          id: entry.id,
          title: entry.title,
          body: entry.body,
          time: moment(entry.createdAt).format('HH:mm')
        });
      }
      else {
        console.error("entry not found, or no entries exist")
        // TODO: entry not found
      }
    } catch (error) {
      console.error('error:', error);
    }
  }

  const fetchLastMoodJournal = async () => {
    setLoading(true);
    try {
      const tempMoodJournal = await databaseService.getLatestMoodJournal();
      if (tempMoodJournal) {
        console.log("tempMoodJournal: ", tempMoodJournal);
      }
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
      setMoodJournalEntry(returnedMoodJournal);
    }
    catch (error) {
      console.error("error getting mood Journals:", error);
    }
    finally {
      setLoading(false);
    }
  };

  /* ---------------------------- journal analysis ---------------------------- */

  //* Probabiliy analysis
  interface WordCount {
    [word: string]: number;
  }

  function compareDescending(a: [string, number], b: [string, number]): number {
    //only compare the second index being the count
    const [, countA] = a;
    const [, countB] = b;
    return countB - countA;
  }

  const analyiseWordProbabilty = async (text: string) => {
    const wordCounts: WordCount = {};
    //(1) split the input into separate strings for each word and remove (".")
    const words = text.toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/\.$/, ''));

    //(2) count the word occurrences
    words.forEach(word => {
      if (!wordCounts[word]) {
        wordCounts[word] = 0;
      }
      wordCounts[word]++;
    });

    //(3) sort the words based off of the occurance (decending order)
    const sortedWordCounts = Object.entries(wordCounts).sort(compareDescending);
    //console.log("sortedWordCounts: ", sortedWordCounts)

    return sortedWordCounts;
  }


  //* SEMANTIC ANALYSIS
  const semantic = async (journalBody: string) => {
    console.log("asad");
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(journalBody);
    //console.log(result);    // Score: -2, Comparative: -0.666
  }

  useEffect(() => {
    if (journalEntry) {
      const analyzeAndUseWords = async () => {
        const sortedWords = await analyiseWordProbabilty(journalEntry.body);
        if (sortedWords) {
          //console.log("Sorted Words:", sortedWords);
          //TODO do somehting with the sortedWords
        }
      }
      semantic(journalEntry.body);
      analyzeAndUseWords();  // Call the async function 
    }
  }, [journalEntry])

  useEffect(() => {
    if (moodJournalEntry) {
      console.log("moodJournalEntry, ", moodJournalEntry)
    }

  }, [moodJournalEntry])

  /* ---------------------- end of text journal analysis ---------------------- */

  /* -------------------------- mood journal analysis ------------------------- */

  interface TrackingValue {
    name: string;
    value: number;
    score?: string;
  }



  const assignScoreToTrackingValue = (trackingValue: TrackingValue) => {
    if (trackingValue.value <= 25) {
      trackingValue.score = "very_negative";
    } else if (trackingValue.value <= 50) {
      trackingValue.score = "negative";
    } else if (trackingValue.value >= 75) {
      trackingValue.score = "very_positive";
    } else {
      trackingValue.score = "positive";
    }
  }
  //   try {
  //     setLoading(true);
  //     await Promise.all([fetchLastEntry(), fetchLastMoodJournal()]);
  //     if (moodJournalEntry) {
  //       const tempTrackingValue1: TrackingValue = {
  //         name: moodJournalEntry.trackingName1,
  //         value: moodJournalEntry.figure1,
  //         score: undefined
  //       }
  //       const tempTrackingValue2: TrackingValue = {
  //         name: moodJournalEntry.trackingName2,
  //         value: moodJournalEntry.figure2,
  //         score: undefined
  //       }
  //       const tempTrackingValue3: TrackingValue = {
  //         name: moodJournalEntry.trackingName3,
  //         value: moodJournalEntry.figure3,
  //         score: undefined
  //       }
  //       assignScoreToTrackingValue(tempTrackingValue1);
  //       assignScoreToTrackingValue(tempTrackingValue2);
  //       assignScoreToTrackingValue(tempTrackingValue3);

  //     }
  //   }
  //   catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchLastEntry(), fetchLastMoodJournal()]);

      if (moodJournalEntry) {
        const results: Record<string, string[]> = {
          very_negative: [],
          negative: [],
          positive: [],
          very_positive: [],
        };

        const trackingProperties = [
          ["trackingName1", "figure1"],
          ["trackingName2", "figure2"],
          ["trackingName3", "figure3"]
        ] as const;

        for (const [nameKey, valueKey] of trackingProperties) {
          const trackingValue: TrackingValue = {
            name: moodJournalEntry[nameKey] as string,
            value: moodJournalEntry[valueKey] as number,
            score: undefined
          };
          assignScoreToTrackingValue(trackingValue);
          results[trackingValue.score || 'default'].push(trackingValue.name);
        }

        console.log(results);
      }
    } 
    catch (error) {
      console.error("Error fetching data:", error);
    } 
    finally {
      setLoading(false);
    }
  };

  //Initaliser function
  useEffect(() => {
    fetchData();
  }, []);



  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      {loading && (
        <View style={styles.loadingPopup}>
          <ActivityIndicator size="large" color={Colors.pink} />
        </View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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