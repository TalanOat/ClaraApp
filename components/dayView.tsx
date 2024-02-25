import { View, Text, FlatList, ListRenderItem, TouchableOpacity, StyleSheet, Alert, } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState, useEffect, useRef } from 'react'
import { defaultStyles } from '@/constants/Styles'
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  SlideInDown,
  SlideInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { databaseService } from '@/model/databaseService';
import moment from 'moment';

interface UserElement {
  id: string;
  type: 'journal' | 'mood' | 'goal';
  title: string;
  time: string;
  icon?: string;
  moodType1?: string;
  moodValue1?: number;
  moodType2?: string;
  moodValue2?: number;
  goalName?: string,
  goalTarget?: number,
  goalValue?: number
};


//TODO: export this as a component
const ProgressBar: React.FunctionComponent<{
  step: number;
  steps: number;
  height?: number;
  textLabel?: string;
  isAnimating?: boolean;

}> = ({ step, steps, height, textLabel, isAnimating }) => {
  const [barWidth, setBarWidth] = useState(0);
  const progressPercentage = (step / steps) * 100;
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    if (isAnimating) {
      animatedWidth.value = 0;
      animatedWidth.value = withTiming((progressPercentage * barWidth) / 100, {
        duration: 500,
        easing: Easing.linear
      });

    }
  }, [isAnimating]);

  return (
    <View>
      <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
        {textLabel}
      </Text>
      <View
        onLayout={e => {
          const barWidth = e.nativeEvent.layout.width;
          setBarWidth(barWidth);
        }}
        style={{
          height: height,
          backgroundColor: Colors.offWhite,
          borderRadius: height,
          overflow: "hidden"
        }}>
        <Animated.View
          style={[
            {
              height: height,
              width: animatedWidth,
              borderRadius: height,
              backgroundColor: Colors.primary,
              position: "absolute",
              left: 0,
              top: 0,
            },
          ]}
        />
      </View>
    </View>
  )
}

const DayView = ({ loadAnimation }: {
  loadAnimation: boolean;
}) => {

  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const [animating, setAnimating] = useState(loadAnimation);
  const [userElements, setUserElements] = useState<UserElement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("animation triggered")
    setAnimating(loadAnimation);

  }, [loadAnimation]);

  const fetchJournalEntries = async () => {
    setLoading(true);
    try {
      const databaseResult = await databaseService.getAllJournalEntries(); // Adjust function name if needed
      const entries: UserElement[] = databaseResult.map(journal => ({
        id: "journal_" + journal.id,
        type: 'journal',
        title: journal.title,
        time: moment(journal.createdAt).format('HH:mm')
      }));
      setUserElements(entries);
    }
    catch (error) {
      console.error('Error fetching entries:', error);
    }
    finally {
      setLoading(false);
    }
  }

  // useEffect(() => {
  //   console.log(userElements)
  // }, [userElements]);

  const handleDeleteEntry = (title: string, id: string) => {
    //(1) First get the id without the prefix
    const idWithNoPreix = splitId(id).id;
    console.log(idWithNoPreix)
    Alert.alert('Warning', `Are you sure you want to delete this entry: ${title}`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          databaseService.deleteJournalEntryByID(idWithNoPreix)
          onRefresh();
        }
      },
    ]);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchJournalEntries();
      await fetchMoodJournalEntries();
    }
    catch (error) {
      console.error("Refresh error:", error);
    }
    finally {
      setRefreshing(false);
    }
  };

  //TODO: get the moodScores and populate it as a varaible 
  //set it to the userElelemtn array
  const fetchTrackingValues = async () => {
    try {
      const tempTrackingValues = await databaseService.getAllTrackingValues();
      return (tempTrackingValues);

    }
    catch (error) {
      console.error("error getting values:", error);
    }
  };

  const fetchTrackingData = async (dataValueID: number) => {
    try {
      const tempTrackingData = await databaseService.getAllTrackingAndData(dataValueID);
      return (tempTrackingData);

    }
    catch (error) {
      console.error("error getting values:", error);
    }
  };

  const fetchMoodJournalEntries = async () => {
    setLoading(true);
    try {
      //(1) Get the last row in the "tracking_values" table
      const trackingValuesArray = await fetchTrackingValues();
      //(2) Get the tracking data for the "trackingValuesArray"
      if (trackingValuesArray) {
        //console.log("tackingid: ", trackingValuesArray.id)
        const trackingDataArray = await fetchTrackingData(trackingValuesArray.id);
        //console.log("trackingDataArray: ", trackingDataArray) 
        const entries: UserElement[] = trackingDataArray.map((moodJournal: any) => ({
          id: "mood_" + moodJournal.id,
          type: 'mood',
          title: moodJournal.title,
          time: moment(moodJournal.createdAt).format('HH:mm'),
          moodType1: trackingValuesArray.value1, // How do we get "Happiness" here?
          moodValue1: moodJournal.figure1,
          moodType2: trackingValuesArray.value2, // How do we get "Anxiety" here?
          moodValue2: moodJournal.figure2,
          moodType3: trackingValuesArray.value3, // How do we get "Depression" here?
          moodValue3: moodJournal.figure3
        }));
        setUserElements(prevElements => [...prevElements, ...entries]);
        //console.log(userElements)
      }
      //TODO: make this work with USerElement interface. Values always the same but data is different for each
      //console.log("trackingValuesArray: ", trackingValuesArray);

      //(3) Map the tracking data to the USerElement interface object
    }
    catch (error) {
      console.error('Error fetching entries:', error);
    }
    finally {
      setLoading(false);
    }
  }

  function splitId(prefixedId: string) {
    const parts = prefixedId.split("_");
    if (parts.length !== 2) {
      throw new Error("invalid string to split");
    }
    const prefix = parts[0];
    const id = parseInt(parts[1]);

    return { prefix, id };
  }

  useEffect(() => {
    fetchJournalEntries();
    fetchMoodJournalEntries();
    //onRefresh();
  }, []);

  //TODO: ;set up trhe loading properly so that it waits to get all the promises back and then sets loading
  // to false

  //TODO: allow for mood Journals to be deleted

  const renderRow: ListRenderItem<UserElement> = ({ item }) => {
    switch (item.type) {
      case 'journal':
        return (
          <Link style={styles.linkContainer} href={`/element/journal/${splitId(item.id).id}`} asChild>
            <TouchableOpacity style={styles.listElement} onLongPress={() => handleDeleteEntry(item.title, item.id)}>
              <Animated.View>
                <View style={styles.topRow}>
                  <MaterialCommunityIcons name="lead-pencil" size={40} color="white" style={styles.elementIcon} />
                  <Text style={styles.elementTitle}>Journal Entry</Text>
                  <Text style={styles.elementTime}>{item.time}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Link>
        );
      case 'mood':
        return (
          <Link style={styles.linkContainer} href={`/element/moodJournal/${splitId(item.id).id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                <Text style={styles.elementTitle}>Mood Journal</Text>
                <Text style={defaultStyles.defaultFontGrey}>{item.time}</Text>
              </View>
              <View style={styles.remainingContent}>
                <View style={styles.contentRow}>
                  {item.moodValue1 !== undefined && (
                    <ProgressBar step={item.moodValue1} steps={100} height={25} isAnimating={animating} textLabel={item.moodType1} />
                  )}
                </View>
                <View style={styles.contentRow}>
                  {item.moodValue2 !== undefined && (
                    <ProgressBar step={item.moodValue2} steps={100} height={25} isAnimating={animating} textLabel={item.moodType2} />
                  )}
                </View>
              </View>

            </TouchableOpacity>
          </Link>
        );
      case 'goal':
        return (
          <Link style={styles.linkContainer} href={`/element/journal/${item.id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                <Text style={styles.elementTitle}>Goal Activity</Text>
                <Text style={defaultStyles.defaultFontGrey}>{item.time}</Text>
              </View>
              <View style={styles.remainingContent}>
                <View style={styles.contentRow}>
                  {item.goalValue !== undefined && item.goalTarget !== undefined && item.goalName !== undefined && (
                    <ProgressBar step={item.goalValue} steps={item.goalTarget} height={25} isAnimating={animating} textLabel={item.goalName} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        );
      default:
        console.warn(`unknown type : ${item.type}`);
        return null;
    }
  };

  return (
    <View style={{ flex: 1, paddingBottom: 0, marginBottom: 90 }}>
      <Animated.FlatList
        renderItem={renderRow}
        ref={listRef}
        data={loading ? [] : userElements}
        style={styles.listContainer}
        entering={SlideInUp.delay(50)}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
      </Animated.FlatList>
    </View>
  )
}

const styles = StyleSheet.create({
  linkContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
    borderRadius: 10,
    marginRight: 5,
    marginLeft: 5

  },
  progressText: { marginBottom: 5, marginLeft: 10 },
  listContainer: {
    padding: 10,
  },
  listElement: {},
  contentRow: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    width: "70%"
  },
  remainingContent: {
    paddingBottom: 15
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  elementIcon: {
    marginRight: 10
  },
  elementTitle: {
    color: "white",
    fontSize: 15,
    fontFamily: "mon-b",
    flex: 1
  },
  elementTime: {
    color: "#ABABAB",
    fontSize: 15,
    fontFamily: "mon-b",
  },
  moodType: {},

})

export default DayView