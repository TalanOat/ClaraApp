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
  id: number;
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

//TODO: delete not being used
interface Journal {
  id: number;
  title: string;
  body: string;
  createdAt: string;
}

const DayView = ({ loadAnimation }: {
  loadAnimation: boolean;
}) => {

  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const [animating, setAnimating] = useState(loadAnimation);
  const [userElements, setUserElements] = useState<UserElement[]>([]);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  //TODO: try fixing without taking delay as the animation was smoother before
  useEffect(() => {
    //TODO: also refresh the userElements when the page is left and joined again i.e for the back navigation
    setAnimating(false);
    if (loadAnimation) {
      setTimeout(() => {
        setAnimating(true);
      }, 10);
    }
  }, [loadAnimation]);

  // useEffect(() => {
  //   console.log("animation triggered")
  //   setAnimating(loadAnimation); 
  // }, [loadAnimation]);

  const fetchJournalEntries = async () => {
    setLoading(true);
    try {
      const databaseResult = await databaseService.getAllJournalEntries(); // Adjust function name if needed
      const entries: UserElement[] = databaseResult.map(journal => ({
        id: journal.id,
        type: 'journal',
        title: journal.title,
        time: moment(journal.createdAt).format('HH:mm')
      }));
      setUserElements(entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  // useEffect(() => {
  //   console.log(userElements)
  // }, [userElements]);

  const handleDeleteEntry = (title: string, id: number) => {
    Alert.alert('Warning', `Are you sure you want to delete this entry: ${title}`, [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          databaseService.deleteJournalEntryByID(id)
          onRefresh();
        }
      },
    ]);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchJournalEntries();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRow: ListRenderItem<UserElement> = ({ item }) => {
    switch (item.type) {
      case 'journal':
        return (
          <Link style={styles.linkContainer} href={`/element/journal/${item.id}`} asChild>
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
          <Link style={styles.linkContainer} href={`/element/journal/${item.id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                <Text style={styles.elementTitle}>Mood Journal</Text>
                <Text style={defaultStyles.defaultFontGrey}>{item.time}</Text>
              </View>
              <View style={styles.remainingContent}>
                <View style={styles.contentRow}>
                  {item.moodValue1 !== undefined && (
                    <ProgressBar step={item.moodValue1} steps={10} height={25} isAnimating={animating} textLabel={item.moodType1} />
                  )}
                </View>
                <View style={styles.contentRow}>
                  {item.moodValue2 !== undefined && (
                    <ProgressBar step={item.moodValue2} steps={10} height={25} isAnimating={animating} textLabel={item.moodType2} />
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