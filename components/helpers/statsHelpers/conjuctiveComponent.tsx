
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import nlp from 'compromise';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const semanticScore = (textInput: string) => {
    var Sentiment = require('sentiment');
    var sentiment = new Sentiment();
    var result = sentiment.analyze(textInput);
    const semanticCalculationArray = result.score;

    return semanticCalculationArray;
}

function testConjunctionAndSplit(journalBody: string) {
    //const testPhrase = "I hate fish. I'm happy because I went to the gym, but I felt so lazy because I was only there for 30 minutes. I like fish";
    const doc = nlp(journalBody);
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


const ConjuctiveComponent = ({ journalBody }: { journalBody: string }) => {
    const [conjunctiveSentence, setConjunctiveSentence] = useState<string[]>();

    useEffect(() => {
        const positiveToNegative = testConjunctionAndSplit(journalBody);
        if (positiveToNegative) {
            setConjunctiveSentence(positiveToNegative);
        }
    }, [journalBody])

    

    return (
        <>
            {conjunctiveSentence && (
                <View>
                    <Text style={[defaultStyles.subTitleHeader, styles.header]}>Conjuctive Analysis</Text>
                    <View style={styles.conjunctiveContainer}>
                        <Text style={[defaultStyles.paragraph, styles.description]}>You might have turned a positive into a negative</Text>
                        <View style={[styles.conjunctiveElement, styles.positive]}>
                            <Text style={[styles.analysisText]}>{conjunctiveSentence[0]}</Text>
                        </View>
                        <View style={[styles.conjunctiveElement, styles.but]}>
                            <Text style={[styles.analysisText]}>{conjunctiveSentence[1]}</Text>
                        </View>
                        <View style={[styles.conjunctiveElement, styles.negative]}>
                            <Text style={[styles.analysisText]}>{conjunctiveSentence[2]}</Text>
                        </View>
                    </View>
                </View>
            )}
        </>
    );
}


const styles = StyleSheet.create({
    header: {
        paddingBottom: 10
    },

    positive: {
        backgroundColor: "rgba(98, 171, 96, 0.7)"
    },
    but: {
        backgroundColor: "rgba(208, 187, 1, 0.7)"
    },
    negative: {
        backgroundColor: "rgba(156, 50, 50, 0.7)"
    },
    analysisText: {
        color: "white",
        fontFamily: "mon-sb",

    },
    conjunctiveContainer: {
        paddingTop: 10,
        justifyContent: "flex-end",
        gap: 12,
        flexWrap: "wrap",
        flexDirection: "row"
    },
    conjunctiveElement: {
        backgroundColor: Colors.transparentWhite,
        padding: 15,
        borderRadius: 16,

    },
    description: {
        paddingBottom: 10
    },

})

export default ConjuctiveComponent;