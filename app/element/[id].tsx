import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import testData from '@/assets/data/testData.json';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors';

import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';
import ExpandedHeader from '@/components/expandedHeader';


const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const journalEntry = (testData as any[]).find((item) => item.id === id)
  //write condition if the id can't be found

  const [text, setText] = useState('');

  const handleInputChange = (input: string) => {
    setText(input);
    //console.log(text)
  }

  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 600); // Adjust the delay (in milliseconds) 
  }, []);

  console.log(journalEntry)
  return (

      <LinearGradient
        style={styles.container}
        colors={["#20115B", "#C876FF"]}
      >
        <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(100)}>
          <View style={styles.topRow}>
            <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
            <Text style={styles.elementTitle}>{journalEntry.title}</Text>
            <Text style={defaultStyles.defaultFontGrey}>{journalEntry.time}</Text>
          </View>
          <View style={styles.contentRow}>
            <TextInput
              style={{ height: "100%", borderColor: 'transparent', color: "white", fontFamily: "mon", fontSize: 16, textAlignVertical: 'top', maxHeight: 250 }}
              onChangeText={handleInputChange}
              value={text}
              multiline={true}
              numberOfLines={20}
              ref={textInputRef}
            />
          </View>
        </Animated.ScrollView>
      </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  journalContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
    borderRadius: 10,
    marginRight: 15,
    marginLeft: 15,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  elementTitle: {
    color: "white",
    fontSize: 15,
    fontFamily: "mon-b",
    flex: 1
  },
  elementIcon: {
    marginRight: 10
  },
  contentRow: {
    padding: 20
  },
})


export default Page