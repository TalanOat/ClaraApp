
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import nlp from 'compromise';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';


interface WordCount {
  [word: string]: number;
}

interface JournalTheme {
  peopleAndActorsAnalysis: [string, number][]
  placesAnalysis: [string, number][]
  activitiesAnalysis: [string, number][]
}

function compareDescending(a: [string, number], b: [string, number]): number {
  //only compare the second index being the count
  const [, countA] = a;
  const [, countB] = b;
  return countB - countA;
}

const analyiseWordProbabilty = (text: string) => {
  const wordCounts: WordCount = {};
  //(1) split the input into separate strings for each word and remove (".")
  const words = text.toLowerCase()
    .split(/\s+/)
  //.map(word => word.replace(/\.$/, ''));

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


const applyThemeAnalysis = (journalBody: string) => {
  const doc = nlp(journalBody);
  const filteredPeople = doc.match("#Person")
    .out('array');

  const filteredActors = doc.match("#Actor")
    .not('my')
    .out('array');

  const filteredPlaces = doc.match('#Place')
    .out('array');

  const filteredActivities = doc.match("#Activity")
    .not('')
    .out('array')

  // combine the people and actors
  const combinedPeopleAndActors = filteredPeople.concat(filteredActors);

  const peopleAndActorsAnalysis = combinedPeopleAndActors.length > 0 ?
    analyiseWordProbabilty(combinedPeopleAndActors.join(' ')) : [];

  const placesAnalysis = filteredPlaces.length > 0 ?
    analyiseWordProbabilty(filteredPlaces.join(' ')) : [];

  const activitiesAnalysis = filteredActivities.length > 0 ?
    analyiseWordProbabilty(filteredActivities.join(' ')) : [];

  return [peopleAndActorsAnalysis, placesAnalysis, activitiesAnalysis]
}



const JournalThemesComponent = ({ journalBody }: { journalBody: string }) => {

  const [journalThemes, setJournalThemes] = useState<JournalTheme>()

  useEffect(() => {
    //console.log("journalBody in JournalThemesComponent: ", journalBody)
    const themesArray = applyThemeAnalysis(journalBody);
    const themeObject: JournalTheme = {
      peopleAndActorsAnalysis: themesArray[0],
      placesAnalysis: themesArray[1],
      activitiesAnalysis: themesArray[2]
    };
    //console.log("themeObject: ", themeObject)
    setJournalThemes(themeObject);
  },[journalBody])

  return (
    <>
      {journalThemes && (
        <View>
          <Text style={[defaultStyles.subTitleHeader, styles.header]}>Key Themes</Text>
          <View style={styles.themesContainer}>
            {journalThemes.activitiesAnalysis.length > 0 && (
              <View style={styles.themeTypeContainer}>
                <Text style={[defaultStyles.paragraph, styles.themeDescription]}>Activities</Text>
                <View style={styles.themeWordsContainer}>
                  {journalThemes.activitiesAnalysis.map(([word, count]) => (
                    <View key={word} style={styles.wordBubble}>
                      <Text style={styles.buttonText} >
                        {word}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {journalThemes.peopleAndActorsAnalysis.length > 0 && (
              <View style={styles.themeTypeContainer}>
                <Text style={[defaultStyles.paragraph, styles.themeDescription]}>People</Text>
                <View style={styles.themeWordsContainer}>
                  {journalThemes.peopleAndActorsAnalysis.map(([word, count]) => (
                    <View key={word} style={styles.wordBubble}>
                      <Text style={styles.buttonText} >
                        {word}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {journalThemes.placesAnalysis.length > 0 && (
              <View style={styles.themeTypeContainer}>
                <Text style={[defaultStyles.paragraph, styles.themeDescription]}>Places</Text>
                <View style={styles.themeWordsContainer}>
                  {journalThemes.placesAnalysis.map(([word, count]) => (
                    <View key={word} style={styles.wordBubble}>
                      <Text style={styles.buttonText} >
                        {word}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flex: 1,
    //marginBottom: 80,
    paddingLeft: 25,
    paddingRight: 25
  },
  buttonText: {
    color: "white",
    fontFamily: "mon-b",
    alignSelf: "center",
    fontSize: 12
  },
  wordBubble: {
    backgroundColor: Colors.transparentPrimary,
    padding: 12,
    borderRadius: 10,
    //elevation: 10,
  },
  header: {
    paddingBottom: 10
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
  themeTypeContainer: {
    //flexDirection: "row"
  },
  themeDescription: {
    flex: 1,
    paddingTop: 10,
    fontFamily: "mon-sb",
  },
  themeWordsContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingTop: 10
  }


})


export default JournalThemesComponent;