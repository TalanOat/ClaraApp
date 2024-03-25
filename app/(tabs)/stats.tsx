import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, ViewStyle } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { databaseService } from '@/model/databaseService'
import moment from 'moment';
import Colors from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';
import { JournalsContext } from '@/components/contexts/journalProvider';

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
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useAnimatedStyle,
  ZoomIn,
} from 'react-native-reanimated';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import nlp from 'compromise';

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

interface JournalElement {
  id: string;
  type: 'journal' | 'mood' | 'goal';
  title: string;
  time: string;
  body?: string;
  trackingName1?: string;
  trackingValue1?: number;
  trackingName2?: string;
  trackingValue2?: number;
  trackingName3?: string;
  trackingValue3?: number;
  goalName?: string;
  goalTarget?: number;
  goalValue?: number;
}


//! does not reload the data after updates to moodJounrals/journal needs a whole app reload to persist changes

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

  /* ------------------------- end of navigation code ------------------------- */

  const [journalEntry, setJournalEntry] = useState<Journal>()
  const [moodJournalEntry, setMoodJournalEntry] = useState<MoodJournal | null>(null);
  const [loading, setLoading] = useState(false);
  const { journals, setJournals, fetchData } = useContext(JournalsContext);

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

  // const fetchLastEntry = async () => {
  //   //console.log("fetching")
  //   try {
  //     const entry = await databaseService.getLastJournalEntry();
  //     if (entry) {
  //       const returnedEntry: Journal = ({
  //         id: entry.id,
  //         title: entry.title,
  //         body: entry.body,
  //         time: moment(entry.createdAt).format('HH:mm')
  //       });
  //       return returnedEntry
  //     }
  //     else {
  //       console.error("entry not found, or no entries exist")
  //       // TODO: entry not found
  //     }
  //   } catch (error) {
  //     console.error('error:', error);
  //   }
  // }

  // const fetchLastMoodJournal = async () => {
  //   //console.log("fetching mood")
  //   setLoading(true);
  //   try {
  //     const tempMoodJournal = await databaseService.getLatestMoodJournal();
  //     // if (tempMoodJournal) {
  //     //   console.log("tempMoodJournal: ", tempMoodJournal);
  //     // }
  //     const returnedMoodJournal: MoodJournal = ({
  //       id: tempMoodJournal.id,
  //       createdAt: tempMoodJournal.created_at,
  //       trackingName1: tempMoodJournal.tracking_name1,
  //       figure1: tempMoodJournal.tracking_value1,
  //       trackingName2: tempMoodJournal.tracking_name2,
  //       figure2: tempMoodJournal.tracking_value2,
  //       trackingName3: tempMoodJournal.tracking_name3,
  //       figure3: tempMoodJournal.tracking_value3,
  //     });
  //     return (returnedMoodJournal);
  //   }
  //   catch (error) {
  //     console.error("error getting mood Journals:", error);
  //   }
  //   finally {
  //     setLoading(false);
  //   }
  // };



  //* SEMANTIC ANALYSIS

  const semanticSearch = async (journalBody: string, searchScore: number) => {
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(journalBody);
    const semanticCalculationArray = result.calculation;
    const matchingKeys = [];

    for (const entry of semanticCalculationArray) {
      for (const [key, value] of Object.entries(entry)) {
        if (value === searchScore) {
          matchingKeys.push(key);
        }
      }
    }

    return matchingKeys;
  }

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
      trackingValue.score = "very_positive";
    } else if (actualValue < 50) {
      trackingValue.score = "positive";
    } else if (actualValue < 75) {
      trackingValue.score = "negative";
    } else {
      trackingValue.score = "very_negative";
    }
  }

  const assignTrackingValues = (moodJournalInput: MoodJournal) => {
    //console.log("moodJournalInput: ", moodJournalInput)
    const results: TrackingValue[] = [];
    const trackingProperties = [
      ["trackingName1", "figure1"],
      ["trackingName2", "figure2"],
      ["trackingName3", "figure3"]
    ] as const;

    for (const [nameKey, valueKey] of trackingProperties) {
      let shouldInvert = false;
      if ((moodJournalInput[nameKey] as string) === "Happiness") {
        shouldInvert = true;
      }

      const trackingValue: TrackingValue = {
        name: moodJournalInput[nameKey] as string,
        value: moodJournalInput[valueKey] as number,
        score: undefined,
        invertScore: shouldInvert
      };
      assignScoreToTrackingValue(trackingValue);

      results.push(trackingValue);
    }
    //console.log("results", results)
    //setTrackingPoints(results);
    return results


  }

  /* -------------------------- emotion Bubble setup -------------------------- */

  const [wordBubble, setWordBubble] = useState<string[]>([]);

  const assignWordBubble = async (journalEntryInput: Journal, inputTrackingPoints: TrackingValue) => {
    //console.log("journalEntryInput in the bubble: ", journalEntryInput)

    //* if (word) <= -2 : very negative
    //* if (word) <= -1 : negative
    //* if (word) >=  1 : positive
    //* if (word) >=  2 : very positive
    const inputTrackingScore = inputTrackingPoints.score;
    //console.log("inputTrackingScore: ", inputTrackingScore)

    let searchValue = 0;

    switch (inputTrackingScore) {
      case "very_negative":
        searchValue = -2;
        break;
      case "negative":
        searchValue = -1;
        break;
      case "positive":
        searchValue = 1;
        break;
      case "very_positive":
        searchValue = 3;
        break;
      default:
      // code block
    }

    const semanticAnalysis = async (searchValue: number) => {
      const matchingKeys = await semanticSearch(journalEntryInput.body, searchValue);
      //remove duplicated and convert it back into an array
      const uniqueKeys = new Set(matchingKeys);
      return Array.from(uniqueKeys);
    };

    const tempReturn = await semanticAnalysis(searchValue);
    if (tempReturn) {
      //console.log("tempReturn: ", tempReturn);
      setWordBubble(tempReturn)
    }

  }

  /* ----------------------------- BarChart setup ----------------------------- */

  const assignChartData = (inputTrackingPoints: TrackingValue[]) => {
    let filteredTrackingPoints;
    setLoading(true);
    //console.log("in assign chart data")
    //if no button has been pressed...
    if (selectedTracking?.name === undefined) {
      // select the first point
      filteredTrackingPoints = [inputTrackingPoints[0]];
      // set the selected point to be the first one by default
      setSelectedTracking(inputTrackingPoints[0])
    }
    else {
      //console.log("defined in assignings")
      // filter based on selectedTracking
      filteredTrackingPoints = inputTrackingPoints.filter(
        point => point.name === selectedTracking?.name
      );
    }

    const trackingLabels = filteredTrackingPoints.map(point => point.name);
    const trackingValues = filteredTrackingPoints.map(point => point.value);
    //console.log("trackingLabels", trackingLabels)
    setChartData({
      labels: trackingLabels,
      datasets: [{ data: trackingValues }]
    });
    setLoading(false);
    return filteredTrackingPoints;
  };

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

  const [selectedTracking, setSelectedTracking] = useState<TrackingValue>();

  const handleTrackingPress = (selectedTrackingInput: TrackingValue) => {
    setSelectedTracking(selectedTrackingInput);
  };

  /* --------------------------- conjuctive analysis -------------------------- */

  //! ToDO allow for multiple sentences!
  const [conjunctiveSentence, setConjunctiveSentence] = useState<string[]>();

  //* SEMANTIC ANALYSIS
  const semanticScore = (textInput: string) => {
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(textInput);
    const semanticCalculationArray = result.score;

    return semanticCalculationArray;
  }

  const testConjunctionAndSplit = () => {
    setLoading(true);

    const testPhrase = "I hate fish. I'm happy because I went to the gym, but I felt so lazy because I was only there for 30 minutes. I like fish";
    const doc = nlp(testPhrase);
    const conjunctiveSentence = doc.if('but').text();
    const splitIndex = conjunctiveSentence.indexOf(' but ');

    if (conjunctiveSentence.length > 0) {
      const splitSentence = conjunctiveSentence.split(' but ');
      const [before, after] = splitSentence
      const middle = 'but';

      const beforeScore = semanticScore(before);
      const afterScore = semanticScore(after);

      //console.log("beforeSemantics :", beforeScore);
      //console.log("afterSemantics :", afterScore);

      if (beforeScore >= 1 && afterScore <= -1) {
        //console.log("flagged string")
        setLoading(false);
        //const returnedSentence = 
        return [before, middle, after];

      }
    }
    else {
      console.log("no 'but' found!");
      setLoading(false);
      return (false)
    }
  }

  /* ---------------------------- journal analysis ---------------------------- */

  interface JournalTheme {
    peopleAndActorsAnalysis: [string, number][]
    placesAnalysis: [string, number][]
    activitiesAnalysis: [string, number][]
  }

  const [journalThemes, setJournalThemes] = useState<JournalTheme>()

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

  const analyiseWordProbabilty = (text: string) => {
    const wordCounts: WordCount = {};
    //(1) split the input into separate strings for each word and remove (".")
    const words = text.toLowerCase()
      .split(/\s+/)
    //.map(word => word.replace(/\.$/, ''));

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


  const applyThemeAnalysis = (journalBody: string) => {
    const doc = nlp(journalBody);
    const filteredPeople = doc.match("#Person")
      .out('array');

    const filteredActors = doc.match("#Actor")
      .not('my')
      .out('array');

    const filteredPlaces = doc.match('#Place')
      .out('array');

    const filteredActivities = doc.match("#Activity")
      .not('')
      .out('array')

    //console.log("filteredActivities: ", filteredActivities)

    // combine the people and actors
    const combinedPeopleAndActors = filteredPeople.concat(filteredActors);

    const peopleAndActorsAnalysis = combinedPeopleAndActors.length > 0 ?
      analyiseWordProbabilty(combinedPeopleAndActors.join(' ')) : [];

    const placesAnalysis = filteredPlaces.length > 0 ?
      analyiseWordProbabilty(filteredPlaces.join(' ')) : [];

    const activitiesAnalysis = filteredActivities.length > 0 ?
      analyiseWordProbabilty(filteredActivities.join(' ')) : [];

    return [peopleAndActorsAnalysis, placesAnalysis, activitiesAnalysis]
  }

    /* ------------------------------ timeline code ----------------------------- */
    const [selectedTimeline, setSelectedTimeline] = useState('Daily'); // Initial selection

    const handleOptionPress = (option:string) => {
      //console.log("timeline option: ", option)
      setSelectedTimeline(option);
    };

  /* -------------- other code - including the first load useEffect ------------- */

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

  //if the selected tracking is changed
  useEffect(() => {
    if (trackingPoints && journalEntry && selectedTracking) {
      assignChartData(trackingPoints);
      assignWordBubble(journalEntry, selectedTracking);
      //console.log("trackingPoints: ", trackingPoints)
    }
  }, [selectedTracking]);

  const fetchDataAndAssignData = async () => {
    try {
      const fetchedObject = fetchLastJournals();
      //If the fetchData returns two promises set up the data accordingly 
      if (fetchedObject.journalEntryResult && fetchedObject.moodJournalResult) {

        //useState variable setup for which is used for the toggle buttons
        setJournalEntry(fetchedObject.journalEntryResult)
        setMoodJournalEntry(fetchedObject.moodJournalResult)

        //Inital Bar Chart setup
        const returnedTrackingPoints = assignTrackingValues(fetchedObject.moodJournalResult)
        //console.log()
        //console.log("returnedTrackingPoints: ", returnedTrackingPoints)
        setTrackingPoints(returnedTrackingPoints);
        //console.log("returnedTrackingPoints: ", returnedTrackingPoints)
        const defaultSelectedValue = assignChartData(returnedTrackingPoints);

        //console.log("defaultSelectedValue: ", defaultSelectedValue)
        //Word Bubble setup - using semantic Analysis modules
        if (defaultSelectedValue) {
          //console.log("teting")
          assignWordBubble(fetchedObject.journalEntryResult, defaultSelectedValue[0])
        }

        //Theme Analysis setup - using multiple Alogrithmns
        const themesArray = applyThemeAnalysis(fetchedObject.journalEntryResult.body);
        //console.log("themesArray: ", themesArray)
        const themeObject: JournalTheme = {
          peopleAndActorsAnalysis: themesArray[0],
          placesAnalysis: themesArray[1],
          activitiesAnalysis: themesArray[2]
        }
        setJournalThemes(themeObject);
        //console.log("themeObject: ", themeObject)
      }
    }
    catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setLoading(false);
    }
  };

  // //Initaliser function
  // useEffect(() => {
  //   setLoading(true)
  //   fetchDataAndAssignData();

  //   const positiveToNegative = testConjunctionAndSplit();
  //   if (positiveToNegative) {
  //     //console.log("testing here!! ", positiveToNegative )
  //     setConjunctiveSentence(positiveToNegative);
  //   }
  //   setLoading(false)
  // }, []);

  useEffect(() => {
    if (pageFocused) {
      //console.log("testing here!! " )
      setLoading(true)
      fetchDataAndAssignData();

      const positiveToNegative = testConjunctionAndSplit();
      if (positiveToNegative) {

        setConjunctiveSentence(positiveToNegative);
      }
      setLoading(false)
    }
  }, [pageFocused])




  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      <View style={{ flex: 1, paddingBottom: 0, marginBottom: 90 }}>
        {!loading && (
          <Animated.ScrollView style={styles.statsContainer} entering={ZoomIn.delay(100)}>
            <View style={styles.moodFeedbackContainer}>
              <Text style={[defaultStyles.titleHeader, styles.header]}>Daily Analysis</Text>
              {/* Timeline Navigation - (Daily, weekly, monthly) */}
              <View style={styles.timelineNav}>
                {['Daily', 'Weekly', 'Monthly'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.button,
                      selectedTimeline === option && styles.selectedBubble, // Apply selected style
                    ]}
                    onPress={() => handleOptionPress(option)}
                  >
                    <Text style={styles.buttonText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.chartContainer} onLayout={((e) => { handleLayout(e) })}>
                {/* Bar Chart */}
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
                      backgroundGradientTo: Colors.pink,
                      backgroundGradientFromOpacity: 0,
                      backgroundGradientToOpacity: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      barPercentage: 4,
                      style: {
                        borderRadius: 16,
                      },
                      propsForBackgroundLines: {
                        strokeWidth: 1
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
                {trackingPoints.map((trackingPoint, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      selectedTracking?.name === trackingPoint.name ? styles.selectedBubble : null
                    ]}
                    onPress={() => handleTrackingPress(trackingPoint)}
                  >
                    <Text style={styles.buttonText}>{trackingPoint.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.textIconRow}>
              <Text style={[defaultStyles.subTitleHeader]}>Linking Word Analysis</Text>
              <Animated.View entering={SlideInLeft.delay(50)} >
                <TouchableOpacity >
                  <MaterialCommunityIcons name='cog'
                    color={"white"}
                    size={30}>
                  </MaterialCommunityIcons>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Animated.View style={styles.wordBubbleContainer} entering={FadeInDown.delay(200)}>
              {wordBubble.map((word) => (
                <Animated.View key={word} entering={SlideInLeft.delay(50)}>
                  <TouchableOpacity style={styles.wordBubble} >
                    <Text style={styles.buttonText}>{word}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>
            {journalThemes && (
              <View>
                <Text style={[defaultStyles.subTitleHeader, styles.header]}>Key Themes</Text>
                <View style={styles.themesContainer}>
                  {journalThemes.activitiesAnalysis.length > 0 && (
                    <View style={styles.themeTypeContainer}>
                      <Text style={[defaultStyles.paragraph, styles.themeDescription]}>Activities</Text>
                      <View style={styles.themeWordsContainer}>
                        {journalThemes.activitiesAnalysis.map(([word, count]) => (
                          <View key={word} style={styles.wordBubble}>
                            <Text style={styles.buttonText} >
                              {word}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {journalThemes.peopleAndActorsAnalysis.length > 0 && (
                    <View style={styles.themeTypeContainer}>
                      <Text style={[defaultStyles.paragraph, styles.themeDescription]}>People</Text>
                      <View style={styles.themeWordsContainer}>
                        {journalThemes.peopleAndActorsAnalysis.map(([word, count]) => (
                          <View key={word} style={styles.wordBubble}>
                            <Text style={styles.buttonText} >
                              {word}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {journalThemes.placesAnalysis.length > 0 && (
                    <View style={styles.themeTypeContainer}>
                      <Text style={[defaultStyles.paragraph, styles.themeDescription]}>Places</Text>
                      <View style={styles.themeWordsContainer}>
                        {journalThemes.placesAnalysis.map(([word, count]) => (
                          <View key={word} style={styles.wordBubble}>
                            <Text style={styles.buttonText} >
                              {word}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
            {conjunctiveSentence && (
              <View>
                <Text style={[defaultStyles.subTitleHeader, styles.header]}>Conjuctive Analysis</Text>
                <View style={styles.conjunctiveContainer}>
                  <Text style={[defaultStyles.paragraph, styles.description]}>You might have turned a positive into a negative</Text>
                  <View style={[styles.conjunctiveElement, styles.positive]}>
                    <Text style={[styles.analysisText]}>{conjunctiveSentence[0]}</Text>
                  </View>
                  <View style={[styles.conjunctiveElement, styles.but]}>
                    <Text style={[styles.analysisText]}>{conjunctiveSentence[1]}</Text>
                  </View>
                  <View style={[styles.conjunctiveElement, styles.negative]}>
                    <Text style={[styles.analysisText]}>{conjunctiveSentence[2]}</Text>
                  </View>
                </View>
              </View>
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
    //elevation: 10,

  },
  buttonText: {
    color: "white",
    fontFamily: "mon-b",
    alignSelf: "center",
    fontSize: 12
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
  wordBubbleAdd: {
    backgroundColor: Colors.transparentPrimary,
    padding: 12,
    borderRadius: 10,
    //elevation: 10,
    alignSelf: "flex-end"
  },
  textIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingBottom: 10,
    paddingTop: 20
  },
  positive: {
    backgroundColor: "rgba(98, 171, 96, 0.7)"
  },
  but: {
    backgroundColor: "rgba(208, 187, 1, 0.7)"
  },
  negative: {
    backgroundColor: "rgba(156, 50, 50, 0.7)"
  },
  analysisText: {
    color: "white",
    fontFamily: "mon-sb",

  },
  conjunctiveContainer: {
    //backgroundColor: Colors.transparentWhite,
    //padding: 10'
    paddingTop: 10,
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
    flexDirection: "row"
  },
  conjunctiveElement: {
    backgroundColor: Colors.transparentWhite,
    padding: 15,
    borderRadius: 16,
    //width:  50
    //shadowColor: "pink",
    //shadowOpacity: 0.5,

  },
  description: {
    paddingBottom: 10
  },
  themesContainer: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  themeWord: {
    backgroundColor: Colors.transparentWhite,
    padding: 15,
    borderRadius: 16,
  },
  themeTypeContainer: {
    //flexDirection: "row"
  },
  themeDescription: {
    flex: 1,
    paddingTop: 10,
    fontFamily: "mon-sb",
  },
  themeWordsContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingTop: 10
  }


})

export default Page