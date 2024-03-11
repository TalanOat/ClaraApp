import React, { useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, FlatList, ListRenderItem, TouchableOpacity, StyleSheet, Alert, } from 'react-native'
import { Link, useNavigation } from 'expo-router';
//import DayView from '@/components/dayView';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { defaultStyles } from '@/constants/Styles'
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
  trackingName1?: string,
  trackingValue1?: number,
  trackingName2?: string,
  trackingValue2?: number,
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
        duration: 400,
        easing: Easing.inOut(Easing.quad)
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

const Page = () => {
  /* -------------------------- Navigation page logic ------------------------- */
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

  /* ------------------------------- daviewLogic ------------------------------ */

  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const [animating, setAnimating] = useState(false);
  const [userElements, setUserElements] = useState<UserElement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchComplete, setFetchComplete] = useState(false);

  useEffect(() => {
    if (pageFocused) {
      onRefresh();
    }
     else {
      setAnimating(false);
    }
  }, [pageFocused])


  const fetchJournalEntries = async () => {
    setLoading(true);
    try {
      const databaseResult = await databaseService.getAllJournalEntries();
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

  const handleDeleteJournalEntry = (title: string, id: string) => {
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

  const handleDeleteMoodJournalEntry = (id: string) => {
    //(1) First get the id without the prefix
    const idWithNoPreix = splitId(id).id;
    console.log(idWithNoPreix)
    Alert.alert('Warning', `Are you sure you want to delete this mood journal entry:`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          databaseService.deleteMoodJournalEntryByID(idWithNoPreix)
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
      setTimeout(() => {
        setAnimating(true);
        setAnimating(false);
      }, 500);
    }
  };

  const fetchMoodJournalEntries = async () => {
    setLoading(true);
    try {
      const tempMoodJournals = await databaseService.getAllMoodJournals();
      if (tempMoodJournals) {
        const entries: UserElement[] = tempMoodJournals.map((moodJournal: any) => ({
          id: "mood_" + moodJournal.id,
          type: 'mood',
          title: 'Mood Journal',
          time: moment(moodJournal.createdAt).format('HH:mm'),
          trackingName1: moodJournal.tracking_name1,
          trackingValue1: moodJournal.tracking_value1,
          trackingName2: moodJournal.tracking_name2,
          trackingValue2: moodJournal.tracking_value2,
          trackingName3: moodJournal.tracking_name3,
          trackingValue3: moodJournal.tracking_value3
        }));

        //console.log(entries);
        setUserElements(prevElements => [...prevElements, ...entries]);

      }

    } catch (error) {
      console.error("error getting mood Journals:", error);
    } finally {
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

  // Fetch data once on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchJournalEntries(), fetchMoodJournalEntries()]);
      } 
      catch (error) {
        console.error("Error fetching data:", error);
      } 
      finally {
        setLoading(false);
        setAnimating(true);
        setTimeout(() => setAnimating(false), 500);
      }
    };
    fetchData();
  }, []);

  //TODO: ;set up trhe loading properly so that it waits to get all the promises back and then sets loading
  // to false


  /* -------------------- renderRows (for each userElement) ------------------- */

  const renderRow: ListRenderItem<UserElement> = ({ item }) => {
    switch (item.type) {
      case 'journal':
        return (
          <Link style={styles.linkContainer} href={`/element/journal/${splitId(item.id).id}`} asChild>
            <TouchableOpacity style={styles.listElement} onLongPress={() => handleDeleteJournalEntry(item.title, item.id)}>
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
            <TouchableOpacity style={styles.listElement} onLongPress={() => handleDeleteMoodJournalEntry(item.id)}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                <Text style={styles.elementTitle}>Mood Journal</Text>
                <Text style={defaultStyles.defaultFontGrey}>{item.time}</Text>
              </View>
              <View style={styles.remainingContent}>
                <View style={styles.contentRow}>
                  {item.trackingName1 !== undefined && item.trackingValue1 !== undefined && (
                    <ProgressBar step={item.trackingValue1} steps={100} height={25} isAnimating={animating} textLabel={item.trackingName1} />
                  )}
                </View>
                <View style={styles.contentRow}>
                  {item.trackingName2 !== undefined && item.trackingValue2 !== undefined && (
                    <ProgressBar step={item.trackingValue2} steps={100} height={25} isAnimating={animating} textLabel={item.trackingName2} />
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
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
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
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
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

export default Page