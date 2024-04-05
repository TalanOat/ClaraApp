var Sentiment = require('sentiment');
import nlp from 'compromise';

interface MoodJournal {
    id: number;
    createdAt: string;
    trackingName1: string;
    figure1: number;
    trackingName2: string;
    figure2: number;
    trackingName3: string;
    figure3: number;
}

interface TrackingValue {
    name: string;
    value: number;
    score?: string;
    invertScore?: boolean;
}

//Tracking Value assigning
const assignScoreToTrackingValue = (trackingValue: TrackingValue) => {
    let actualValue = trackingValue.value;
    if (trackingValue.invertScore) {
        actualValue = 100 - actualValue;
    }

    if (actualValue <= 25) {
        trackingValue.score = "very_positive";
    } else if (actualValue < 50) {
        trackingValue.score = "positive";
    } else if (actualValue < 75) {
        trackingValue.score = "negative";
    } else {
        trackingValue.score = "very_negative";
    }
}

const assignTrackingValues = (moodJournalInput: MoodJournal) => {
    const results: TrackingValue[] = [];
    const trackingProperties = [
        ["trackingName1", "figure1"],
        ["trackingName2", "figure2"],
        ["trackingName3", "figure3"]
    ] as const;

    for (const [nameKey, valueKey] of trackingProperties) {
        let shouldInvert = false;
        if ((moodJournalInput[nameKey] as string) === "Happiness") {
            shouldInvert = true;
        }

        const trackingValue: TrackingValue = {
            name: moodJournalInput[nameKey] as string,
            value: moodJournalInput[valueKey] as number,
            score: undefined,
            invertScore: shouldInvert
        };
        assignScoreToTrackingValue(trackingValue);

        results.push(trackingValue);
    }
    console.log("results: ", results)
    return results
}


//Conjuctive analysis
const semanticScore = (textInput: string) => {
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(textInput);
    const semanticCalculationArray = result.score;

    return semanticCalculationArray;
}

function testConjunctionAndSplit() {
    const testPhrase = "I hate fish. I'm happy because I went to the gym, but I felt so lazy because I was only there for 30 minutes. I like fish";
    const doc = nlp(testPhrase);
    const conjunctiveSentence = doc.if('but').text();

    if (conjunctiveSentence.length > 0) {
        const splitSentence = conjunctiveSentence.split(' but ');
        const [before, after] = splitSentence
        const middle = 'but';

        const beforeScore = semanticScore(before);
        const afterScore = semanticScore(after);

        if (beforeScore >= 1 && afterScore <= -1) {
            return [before, middle, after];
        }
    }
    else {
        console.log("no 'but' found!");
        return (false)
    }
}


export { assignTrackingValues, testConjunctionAndSplit };