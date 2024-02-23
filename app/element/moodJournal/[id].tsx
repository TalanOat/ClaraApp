import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Touchable, TouchableOpacity } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import testData from '@/assets/data/testData.json';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors';

import Animated, {
  SlideInDown,
} from 'react-native-reanimated';
import { databaseService } from '@/model/databaseService';
import moment from 'moment';

interface Journal {
  id: number;
  title: string;
  body: string;
  time: string;
}

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [journalEntry, setJournalEntry] = useState<Journal>();
  const [textInputValue, setTextInputValue] = useState('');
  const [text, setText] = useState('');


  const handleInputChange = (input: string) => {
    setTextInputValue(input);
  }

  //the input ref is used to get a reference to the textinput component
  //  to ensure the users keyboard is opened on the page load and their
  //  cursor is at the top of the input box
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 1000);
  }, []);



  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const entry = await databaseService.getJournalEntryByID(parseInt(id));
        if (entry) {
          setJournalEntry({
            id: entry.id,
            title: entry.title,
            body: entry.body,
            time: moment(entry.createdAt).format('HH:mm')
          });
          setTextInputValue(entry.body);
        } else {
          // TODO: entry not found
        }
      } catch (error) {
        console.error('error:', error);
      }
    }
    fetchEntry();
  }, []);

  async function databaseUpdateJournalEntry() {
    try {
      //console.log("databae update")
      if (journalEntry) {
        await databaseService.updateJournalEntry(journalEntry.id, "Journal Entry", textInputValue);
        //TODO: possibly add loading
        //TODO: visual feedback to the user that it has worked
      }
      else {
        //TODO:  (VFB) journal not loaded yet
      }
    } catch (error) {
      console.error("update error:", error);
    }
  }

  const handleUpdate = (e: any) => {
    e.preventDefault();
    console.log("handle submit")
    databaseUpdateJournalEntry()
  }



  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}
    >
      <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(50)}>
        <View style={styles.topRow}>
          <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
          <Text style={styles.elementTitle}>{journalEntry?.title}</Text>
          <TouchableOpacity onPress={(e) => { handleUpdate(e); }} >
            <MaterialCommunityIcons name="check" size={40} color="white"  />
          </TouchableOpacity>
        </View>
        <View style={styles.contentRow}>
          <TextInput
            style={styles.journalInput}
            onChangeText={handleInputChange}
            value={textInputValue}
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
  journalInput: {
    height: "100%",
    borderColor: 'transparent',
    color: "white",
    fontFamily: "mon",
    fontSize: 16,
    textAlignVertical: 'top',
    maxHeight: 250
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