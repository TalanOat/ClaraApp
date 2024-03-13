import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { databaseService } from '@/model/databaseService'
import moment from 'moment';
import Colors from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';

//chart imports
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";

import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  SlideInDown,
  SlideInUp,
  FadeInDown,
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

// const MyBarChart = () => {
//   return (

//   );
// };

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
      // if (tempMoodJournal) {
      //   console.log("tempMoodJournal: ", tempMoodJournal);
      // }
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
    //console.log("asad");
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


  /* ---------------------- end of text journal analysis ---------------------- */

  /* -------------------------- mood journal analysis ------------------------- */

  const [trackingPoints, setTrackingPoints] = useState<TrackingValue[]>()

  interface TrackingValue {
    name: string;
    value: number;
    score?: string;
    invertScore?: boolean;
  }

  const assignScoreToTrackingValue = (trackingValue: TrackingValue) => {
    let actualValue = trackingValue.value;
    if (trackingValue.invertScore) {
      actualValue = 100 - actualValue;
    }
    if (actualValue <= 25) {
      trackingValue.score = "very_negative";
    } else if (actualValue <= 50) {
      trackingValue.score = "negative";
    } else if (actualValue >= 75) {
      trackingValue.score = "very_positive";
    } else {
      trackingValue.score = "positive";
    }
  }

  const setUpTrackingValues = () => {
    if (moodJournalEntry) {
      //console.log("moodJournalEntry: ", moodJournalEntry)

      const results: TrackingValue[] = [];
      const trackingProperties = [
        ["trackingName1", "figure1"],
        ["trackingName2", "figure2"],
        ["trackingName3", "figure3"]
      ] as const;

      for (const [nameKey, valueKey] of trackingProperties) {
        let shouldInvert = false;
        if ((moodJournalEntry[nameKey] as string) === "Happiness") {
          shouldInvert = true;
        }

        const trackingValue: TrackingValue = {
          name: moodJournalEntry[nameKey] as string,
          value: moodJournalEntry[valueKey] as number,
          score: undefined,
          invertScore: shouldInvert
        };
        assignScoreToTrackingValue(trackingValue);

        results.push(trackingValue);
      }
      //console.log("results", results)
      setTrackingPoints(results);
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchLastEntry(), fetchLastMoodJournal()]);
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setLoading(false);
    }
  };

  // //! is this still needed
  useEffect(() => {
    if (moodJournalEntry) {
      setUpTrackingValues();
    }

  }, [moodJournalEntry])

  /* ----------------------------- BarChart setup ----------------------------- */

  const assignChartData = () => {
    if (trackingPoints) {
      let filteredTrackingPoints;

      //if no button has been pressed...
      if (selectedTracking === "") {
        // select the first point
        filteredTrackingPoints = [trackingPoints[0]];
      } 
      else {
        // filter based on selectedTracking
        filteredTrackingPoints = trackingPoints.filter(
          point => point.name === selectedTracking
        );
      }
      //console.log("filteredTrackingPoints: ", filteredTrackingPoints)

      const trackingLabels = filteredTrackingPoints.map(point => point.name);
      const trackingValues = filteredTrackingPoints.map(point => point.value);

      setChartData({
        labels: trackingLabels,
        datasets: [{ data: trackingValues }]
      });
    }
  };
  //const widht = Dimensions.get("window").width
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    //console.log("width: ", width)
    setChartWidth(width);
  };

  interface ChartData {
    labels: string[];
    datasets: [{ data: number[] }]
  }

  const [chartData, setChartData] = useState<ChartData>();

  /* ---------------------------- trackingNav code ---------------------------- */

  const [selectedTracking, setSelectedTracking] = useState("");

  const handleTrackingPress = (trackingName: string) => {
    setSelectedTracking(trackingName);
  };

  //! testing function
  useEffect(() => {
    if (selectedTracking) {
      console.log("selectedTracking: ", selectedTracking)
    }
  }, [selectedTracking]);

  /* -------------- other code - including the first load useEffect ------------- */

  useEffect(() => {
    if (trackingPoints) {
      assignChartData();
      //console.log("trackingPoints: ", trackingPoints)
    }
  }, [trackingPoints, selectedTracking]);

  //Initaliser function
  useEffect(() => {
    //console.log("first load")
    fetchData()
  }, []);

  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      <View style={{ flex: 1, paddingBottom: 0, marginBottom: 90 }}>
        {!loading && (
          <Animated.View style={styles.statsContainer} entering={SlideInUp.delay(100)}>
            <View style={styles.timelineNav}>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Monthly</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.moodFeedbackContainer}>
              <Text style={defaultStyles.subTitleHeader}>Daily Analysis</Text>
              <View style={styles.chartContainer} onLayout={((e) => { handleLayout(e) })}>
                {chartData && (
                  <BarChart
                    data={chartData}
                    width={chartWidth}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    fromZero
                    fromNumber={100}
                    chartConfig={{
                      backgroundColor: Colors.primary,
                      backgroundGradientFrom: Colors.primary,
                      backgroundGradientTo: Colors.primary,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForBackgroundLines: {
                        strokeWidth: 0
                      },
                      decimalPlaces: 0,
                    }}
                    style={{
                      marginVertical: 2,
                      borderRadius: 16,
                    }}
                  />
                )}

              </View>
            </View>
            {trackingPoints !== undefined && (
              <View style={styles.trackingNav}>
                <TouchableOpacity style={styles.smallButton} onPress={() => handleTrackingPress(trackingPoints[0].name)}>
                  <Text style={styles.smallButtonText}>{trackingPoints[0].name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButton} onPress={() => handleTrackingPress(trackingPoints[1].name)}>
                  <Text style={styles.smallButtonText}>{trackingPoints[1].name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButton} onPress={() => handleTrackingPress(trackingPoints[2].name)}>
                  <Text style={styles.smallButtonText}>{trackingPoints[2].name}</Text>
                </TouchableOpacity>
              </View>
            )}


          </Animated.View>
        )}
        {loading && (
          <Animated.View style={styles.loadingPopup} entering={SlideInDown.delay(200)} exiting={SlideInUp.delay(100)}>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center'
  },
  moodFeedbackContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: "flex-start",
    //backgroundColor: "gray"
    //width: "90%",
    //paddingLeft: 10,
    //paddingRight: 10,

  },
  chartContainer: {
    //flex: 1,
    width: '100%',
    borderRadius: 16,
    overflow: "hidden",
    //backgroundColor: "pink",
    alignSelf: "center",
    paddingTop: 20
  },
  timelineNav: {
    flexDirection: "row",
    justifyContent: "flex-start",
    //padding: 5,
    paddingBottom: 30,
    gap: 10

    //backgroundColor: "gray"
  },
  trackingNav: {
    flexDirection: "row",
    justifyContent: "flex-end",
    //padding: 5,
    paddingBottom: 30,
    gap: 10

    //backgroundColor: "gray"
  },
  button: {
    backgroundColor: Colors.pink,
    padding: 15,
    //alignSelf: "center",
    borderRadius: 10,
    elevation: 10,
    //flex: 1
    //opacity: 0.5
  },
  buttonText: {
    color: "white",
    fontFamily: "mon-b",
    alignSelf: "center",
    fontSize: 12
  },
  smallButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    //alignSelf: "center",
    borderRadius: 10,
    elevation: 10,
    //flex: 1
    //opacity: 0.5
  },
  smallButtonText: {
    color: "white",
    fontFamily: "mon-b",
    alignSelf: "center",
    fontSize: 12
  },

})

export default Page