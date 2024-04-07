
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
    positiveScore: boolean;
    invertScore?: boolean;
}


//Tracking Value assigning
const assignScoreToTrackingValue = (trackingValue: TrackingValue) => {
    let actualValue = trackingValue.value;
    if (trackingValue.invertScore) {
        actualValue = 100 - actualValue;
    }

    if (actualValue <= 50) {
        trackingValue.positiveScore = true;
    } else {
        trackingValue.positiveScore = false;
    }
}


const semanticAnalysis = (stringInput: string) => {
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(stringInput);
    return result.score
}



const calculateCompleteTrackingValues = (moodJournalInput: MoodJournal) => {
    const results: TrackingValue[] = [];
    const trackingProperties = [
        ["trackingName1", "figure1"],
        ["trackingName2", "figure2"],
        ["trackingName3", "figure3"]
    ] as const;

    for (const [nameKey, valueKey] of trackingProperties) {
        let shouldInvert = false;
        //search to try and guess whether the word is positive or negative:

        const testScore = semanticAnalysis(moodJournalInput[nameKey] as string);
        if(testScore >= 0){
            shouldInvert = true;
        }


        const trackingValue: TrackingValue = {
            name: moodJournalInput[nameKey] as string,
            value: moodJournalInput[valueKey] as number,
            positiveScore: true,
            invertScore: shouldInvert
        };
        assignScoreToTrackingValue(trackingValue);

        results.push(trackingValue);
    }
    //console.log("results: ", results)
    return results
}

export { calculateCompleteTrackingValues };