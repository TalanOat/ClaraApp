import { View, Text, FlatList, ListRenderItem, TouchableOpacity, StyleSheet, } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState, useEffect, useRef } from 'react'
import { defaultStyles } from '@/constants/Styles'
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface UserElement {
  id: string;
  type: string;
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

const DayView = ({ items, loadAnimation }: {
  items: UserElement[];
  loadAnimation: boolean;
}) => {

  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const [animating, setAnimating] = useState(loadAnimation);

  //TODO: try fixing without taking delay as the animation was smoother before
  useEffect(() => {
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


  const renderRow: ListRenderItem<UserElement> = ({ item }) => {
    switch (item.type) {
      case 'journal':
        return (
          <Link style={styles.linkContainer} href={`/element/journal/${item.id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
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
    <View style={defaultStyles.container}>
      <Animated.FlatList
        renderItem={renderRow}
        ref={listRef}
        data={loading ? [] : items}
        style={styles.listContainer}
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