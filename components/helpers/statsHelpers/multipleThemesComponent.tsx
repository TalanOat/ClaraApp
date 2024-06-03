import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import nlp from 'compromise';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CryptoJS from "react-native-crypto-js";
import { loadSettingFromStorage } from '../reusable/journalHelper';

interface WordCount {
  [word: string]: number;
}

interface JournalTheme {
  peopleAndActorsAnalysis: [string, number][];
  placesAnalysis: [string, number][];
  activitiesAnalysis: [string, number][];
}

function compareDescending(a: [string, number], b: [string, number]): number {
  const [, countA] = a;
  const [, countB] = b;
  return countB - countA;
}

const analyzeWordProbability = (text: string) => {
  const wordCounts: WordCount = {};
  const words = text.toLowerCase().split(/\s+/);

  words.forEach(word => {
    if (!wordCounts[word]) {
      wordCounts[word] = 0;
    }
    wordCounts[word]++;
  });

  const sortedWordCounts = Object.entries(wordCounts).sort(compareDescending);
  return sortedWordCounts;
}

const applyThemeAnalysis = (journalBody: string) => {
  const doc = nlp(journalBody);
  const filteredPeople = doc.match("#Person").out('array');
  const filteredActors = doc.match("#Actor").not('my').out('array');
  const filteredPlaces = doc.match('#Place').out('array');
  const filteredActivities = doc.match("#Activity").not('').out('array');

  const combinedPeopleAndActors = filteredPeople.concat(filteredActors);

  const peopleAndActorsAnalysis = combinedPeopleAndActors.length > 0 ?
    analyzeWordProbability(combinedPeopleAndActors.join(' ')) : [];

  const placesAnalysis = filteredPlaces.length > 0 ?
    analyzeWordProbability(filteredPlaces.join(' ')) : [];

  const activitiesAnalysis = filteredActivities.length > 0 ?
    analyzeWordProbability(filteredActivities.join(' ')) : [];

  return {
    peopleAndActorsAnalysis,
    placesAnalysis,
    activitiesAnalysis
  };
}



const MultipleJournalThemesComponent = ({ journalBodies }: { journalBodies: string[] }) => {
  const [journalThemes, setJournalThemes] = useState<JournalTheme[]>([]);

  useEffect(() => {
    //console.log("journalBodies in MultipleJournalThemesComponent: ", journalBodies)
    const allThemes = journalBodies.map(journalBody => applyThemeAnalysis(journalBody));
    setJournalThemes(allThemes);
  }, [journalBodies]);

  return (
    <>
      {journalThemes.map((journalTheme, index) => (
        <View key={index}>
          <Text style={[defaultStyles.subTitleHeader, styles.header]}>Journal {index + 1} Key Themes</Text>
          <View style={styles.themesContainer}>
            {journalTheme.activitiesAnalysis.length > 0 && (
              <View style={styles.themeTypeContainer}>
                <Text style={[defaultStyles.paragraph, styles.themeDescription]}>Activities</Text>
                <View style={styles.themeWordsContainer}>
                  {journalTheme.activitiesAnalysis.map(([word, count]) => (
                    <View key={word} style={styles.wordBubble}>
                      <Text style={styles.buttonText}>
                        {word} ({count})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {journalTheme.peopleAndActorsAnalysis.length > 0 && (
              <View style={styles.themeTypeContainer}>
                <Text style={[defaultStyles.paragraph, styles.themeDescription]}>People</Text>
                <View style={styles.themeWordsContainer}>
                  {journalTheme.peopleAndActorsAnalysis.map(([word, count]) => (
                    <View key={word} style={styles.wordBubble}>
                      <Text style={styles.buttonText}>
                        {word} ({count})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {journalTheme.placesAnalysis.length > 0 && (
              <View style={styles.themeTypeContainer}>
                <Text style={[defaultStyles.paragraph, styles.themeDescription]}>Places</Text>
                <View style={styles.themeWordsContainer}>
                  {journalTheme.placesAnalysis.map(([word, count]) => (
                    <View key={word} style={styles.wordBubble}>
                      <Text style={styles.buttonText}>
                        {word} ({count})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flex: 1,
    paddingLeft: 25,
    paddingRight: 25,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'mon-b',
    alignSelf: 'center',
    fontSize: 12,
  },
  wordBubble: {
    backgroundColor: Colors.transparentPrimary,
    padding: 12,
    borderRadius: 10,
  },
  header: {
    paddingBottom: 10,
  },
  themesContainer: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  themeWord: {
    backgroundColor: Colors.transparentWhite,
    padding: 15,
    borderRadius: 16,
  },
  themeTypeContainer: {},
  themeDescription: {
    flex: 1,
    paddingTop: 10,
    fontFamily: 'mon-sb',
  },
  themeWordsContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
});

export default MultipleJournalThemesComponent;