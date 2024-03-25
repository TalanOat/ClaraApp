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

const createJournal = () => {
  const [text, setText] = useState('');
  const [flashNotification, setFlashNotification] = useState(false);
  const { fetchData } = useContext(JournalsContext);

  const handleInputChange = (input: string) => {
    setText(input);
    //console.log(text)
  }

  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 600);
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
    }
  }


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
      colors={["#20115B", "#C876FF"]}
    >
      <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(50)}>
        <View style={styles.topRow}>
          <MaterialCommunityIcons name="lead-pencil" size={40} color="white" style={styles.elementIcon} />
          <Text style={styles.elementTitle}>Title Here</Text>
          <TouchableOpacity onPress={() => { handleSubmit(); }} >
            <MaterialCommunityIcons name="check" size={40} color="white" />
          </TouchableOpacity>

        </View>
        <View style={styles.contentRow}>
          <TextInput
            style={styles.journalInput}
            onChangeText={handleInputChange}
            value={text}
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
    borderRadius: 16,
  },
  innerText: {
    padding: 20,
    color: "white",
    fontFamily: "mon-b",
    fontSize: 15,

    backgroundColor: Colors.pink,
    borderRadius: 16,
    //margin: 50
  }
})


export default createJournal