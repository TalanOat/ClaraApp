import { View, Text, FlatList, ListRenderItem, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useState, useEffect, useRef } from 'react'
import { defaultStyles } from '@/constants/Styles'
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';

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
  focusedPage?: boolean;

}> = ({ step, steps, height, textLabel, isAnimating, focusedPage }) => {
  const animatedValue = React.useRef(new Animated.Value(-1000)).current;
  const destinationValue = React.useRef(new Animated.Value(-1000)).current;
  const [width, setWidth] = React.useState(0);

  //when the componeent mounts:
  //start the animation with set values, and start only once
  useEffect(() => {
    if (isAnimating) {
      animatedValue.setValue(-1000);
      Animated.timing(animatedValue, {
        toValue: destinationValue,
        duration: 2000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }).start();
    }
  }, [isAnimating]);

  React.useEffect(() => {
    const progressWidth = (width * step) / steps;
    destinationValue.setValue(progressWidth - width)
  }, [step, width])


  return (
    <View>
      <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
        {textLabel}
      </Text>
      <View
        onLayout={e => {
          const barWidth = e.nativeEvent.layout.width;
          setWidth(barWidth);
        }}
        style={{
          height: height,
          backgroundColor: Colors.offWhite,
          borderRadius: height,
          overflow: "hidden"
        }}>
        <Animated.View
          style={{
            height: height,
            width: "100%",
            borderRadius: height,
            backgroundColor: Colors.primary,
            position: "absolute",
            left: 0,
            top: 0,
            transform: [
              {
                translateX: animatedValue,
              }
            ]
          }} />
      </View>
    </View>
  )
}

const DayView = ({ items, pageFocused }: {
  items: UserElement[];
  pageFocused: boolean;
}) => {

  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (pageFocused) {
      console.log('animation triggered');
      setAnimating(true)

    }
    if (!pageFocused) {
      console.log('animation off');
      setAnimating(false)
    }
  }, [pageFocused]);


  const renderRow: ListRenderItem<UserElement> = ({ item }) => {
    switch (item.type) {
      case 'journal':
        return (
          <Link style={styles.linkContainer} href={`/element/${item.id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
                <View style={styles.topRow}>
                  <MaterialCommunityIcons name="lead-pencil" size={40} color="white" style={styles.elementIcon} />
                  <Text style={styles.elementTitle}>{item.title}</Text>
                  <Text style={styles.elementTime}>{item.time}</Text>
                </View>
            </TouchableOpacity>
          </Link>
        );
      case 'mood':
        return (
          <Link style={styles.linkContainer} href={`/element/${item.id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                <Text style={styles.elementTitle}>{item.title}</Text>
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
          <Link style={styles.linkContainer} href={`/element/${item.id}`} asChild>
            <TouchableOpacity style={styles.listElement}>
              <View style={styles.topRow}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                <Text style={styles.elementTitle}>{item.title}</Text>
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
      <FlatList
        renderItem={renderRow}
        ref={listRef}
        data={loading ? [] : items}
        style={styles.listContainer}
      >
      </FlatList>
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