
import nlp from 'compromise';

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


export { testConjunctionAndSplit };