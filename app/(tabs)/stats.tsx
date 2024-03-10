import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { databaseService } from '@/model/databaseService'
import moment from 'moment';

interface Journal {
  id: number;
  title: string;
  body: string;
  time: string;
}

interface MoodJournalEntry {
  id: number;
  createdAt: string; // Assuming the database returns a string for created_at 
  trackingData: {
    figure1: number;
    figure2: number;
    figure3: number;
  };
  // Add other mood journal fields here as needed
}


interface TrackingValues {
  id: number;
  value1: string;
  value2: string;
  value3: string;
}



//! TODO implement loading state and animation
const Page = () => {
  const [journalEntry, setJournalEntry] = useState<Journal>()
  const [moodJournalEntry, setMoodJournalEntry] = useState<MoodJournalEntry>();
  const [loading, setLoading] = useState(false);
  const [userTrackingVals, setUserTrackingVals] = useState<TrackingValues>();

  const fetchLastEntry = async () => {
    try {
      const entry = await databaseService.getLastJournalEntry();
      if (entry) {
        setJournalEntry({
          id: entry.id,
          title: entry.title,
          body: entry.body,
          time: moment(entry.createdAt).format('HH:mm')
        });
      }
      else {
        console.error("entry not found, or no entries exist")
        // TODO: entry not found
      }
    } catch (error) {
      console.error('error:', error);
    }
  }

  const fetchLastMoodJournal = async () => {
    setLoading(true);
    try {
      const tempMoodJournal = await databaseService.getLatestMoodJournal();
      // if (tempMoodJournal) {
      //   return tempMoodJournal
      // }
      if(tempMoodJournal){
        console.log("tempMoodJournal: ", tempMoodJournal);
      }
      
      //setMoodJournalEntry(tempMoodJournal);

    }
    catch (error) {
      console.error("error getting mood Journals:", error);
    }
    finally {
      setLoading(false);
    }
  };

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

  const analyiseWordProbabilty = async (text: string) => {
    const wordCounts: WordCount = {};
    //(1) split the input into separate strings for each word and remove (".")
    const words = text.toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/\.$/, ''));

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

  //* SEMANTIC ANALYSIS
  const semantic = async (journalBody: string) => {
    console.log("asad");
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(journalBody);
    //console.log(result);    // Score: -2, Comparative: -0.666
  }


  //* OTHER
  //Initaliser function
  useEffect(() => {
    fetchLastEntry();
    fetchLastMoodJournal();
  }, [])

  useEffect(() => {
    if (journalEntry) {
      const analyzeAndUseWords = async () => {
        const sortedWords = await analyiseWordProbabilty(journalEntry.body);
        if (sortedWords) {
          //console.log("Sorted Words:", sortedWords);
          //TODO do somehting with the sortedWords
        }
      }
      semantic(journalEntry.body);
      analyzeAndUseWords();  // Call the async function 
    }
  }, [journalEntry])

  useEffect(() => {
    console.log("moodJournalEntry, ",moodJournalEntry)
  }, [moodJournalEntry])



  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

export default Page