import { View, Text, TextInput, StyleSheet, Touchable, TouchableOpacity, } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { defaultStyles } from '@/constants/Styles'

import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { databaseService } from '@/model/databaseService'
import Colors from '@/constants/Colors'

import { JournalsContext } from '@/components/contexts/journalProvider'
import { DetectionContext } from '@/components/contexts/detectionContext'

enum usageTypes {
  JOURNAL_LOG = "journal_add",
  MOOD_LOG = "mood_add",
  MAP_USE = "map_use"
}

const placeholderValues = [
  "What's on your mind?",
  "How are you feeling today?",
  "Write about a memorable moment...",
];

const createJournal = () => {
  const [text, setText] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [flashNotification, setFlashNotification] = useState(false);

  //context useStates
  const { fetchData } = useContext(JournalsContext);
  const { logWindowStart, logWindowEnd } = useContext(DetectionContext);

  const handleInputChange = (input: string) => {
    setText(input);
    //console.log(text)
  }

  const textInputRef = useRef<TextInput>(null);



  useEffect(() => {
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 600);

    logWindowStart(usageTypes.JOURNAL_LOG);


  }, []);

  async function databaseCreateJournalEntry() {
    try {
      const currentTime = new Date().toISOString()
      //TODO add the ability to set the title manually 
      await databaseService.createJournalEntry("Journal Entry", text, currentTime);
    }
    catch (error) {
      console.error("update error:", error);
    }
    finally {
      fetchData();
      logWindowEnd(usageTypes.JOURNAL_LOG);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex(prevIndex => (prevIndex + 1) % placeholderValues.length);
    }, 5000); 
  
    return () => clearInterval(intervalId);
  }, []); 



  const handleSubmit = () => {
    databaseCreateJournalEntry()
    setFlashNotification(true);

    setTimeout(() => {
      setFlashNotification(false);
    }, 1000);
  }

  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.primary, Colors.pink]}
    >
      <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(50)}>
        <View style={styles.topRow}>
          <MaterialCommunityIcons name="lead-pencil" size={40} color="white" style={styles.elementIcon} />
          <Text style={styles.elementTitle}>Add Journal</Text>
          <TouchableOpacity onPress={() => { handleSubmit(); }} >
            <MaterialCommunityIcons name="check" size={40} color="white" />
          </TouchableOpacity>

        </View>
        <View style={styles.contentRow}>
          <TextInput
            style={styles.journalInput}
            onChangeText={handleInputChange}
            value={text}
            placeholder={placeholderValues[placeholderIndex]}
            placeholderTextColor="gray"
            multiline={true}
            numberOfLines={20}
            ref={textInputRef}
          />
        </View>
      </Animated.ScrollView>
      {flashNotification && (
        <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
          <Text style={flashMessage.innerText}>Added</Text>
        </Animated.View>
      )}
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

const flashMessage = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    //borderRadius: 10,
    overflow: "hidden"
  },
  innerText: {
    padding: 20,
    color: "white",
    fontFamily: "mon-b",
    fontSize: 15,

    backgroundColor: Colors.pink,
    borderRadius: 10,
    //margin: 50
    overflow: "hidden"
  }
})


export default createJournal