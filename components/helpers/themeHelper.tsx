
import nlp from 'compromise';


interface WordCount {
    [word: string]: number;
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

  export { applyThemeAnalysis };