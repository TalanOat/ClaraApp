
import Colors from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import nlp from 'compromise';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from "react-native-chart-kit";
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    SlideInDown,
    SlideInUp,
    FadeInDown,
    FadeInUp,
    SlideInLeft,
    SlideInRight,
    useAnimatedStyle,
    ZoomIn,
} from 'react-native-reanimated';

import { calculateCompleteTrackingValues } from '@/components/helpers/statsHelpers/scoreTrackingValues';

interface TrackingValue {
    name: string;
    value: number;
    score?: string;
    invertScore?: boolean;
}

interface ChartData {
    labels: string[];
    datasets: [{ data: number[] }]
}


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

interface Journal {
    id: number;
    title: string;
    body: string;
    time: string;
}



const BarChartComponent = ({ journalParam, moodJournalParam }: { journalParam: Journal, moodJournalParam: MoodJournal }) => {
    const [journalEntry, setJournalEntry] = useState<Journal>()
    const [moodJournalEntry, setMoodJournalEntry] = useState<MoodJournal | null>(null);
    const [loading, setLoading] = useState<Boolean>(false);

    const [selectedTimeline, setSelectedTimeline] = useState('Daily');
    const [chartData, setChartData] = useState<ChartData>();
    const [selectedTracking, setSelectedTracking] = useState<TrackingValue>();

    const [chartWidth, setChartWidth] = useState(0);
    const [trackingPoints, setTrackingPoints] = useState<TrackingValue[]>()
    const [linkingWords, setLinkingWords] = useState<string[]>([]);

    const handleTimelineOptionPressed = (option: string) => {
        setSelectedTimeline(option);
    };


    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setChartWidth(width);
    };

    const handleTrackingPress = (selectedTrackingInput: TrackingValue) => {
        setSelectedTracking(selectedTrackingInput);
    };

    const assignChartData = (inputTrackingPoints: TrackingValue[]) => {
        let filteredTrackingPoints;
        setLoading(true);
        if (selectedTracking?.name === undefined) {
            // select the first point
            filteredTrackingPoints = [inputTrackingPoints[0]];
            // set the selected point to be the first one by default
            setSelectedTracking(inputTrackingPoints[0])
        }
        else {
            //console.log("defined in assignings")
            // filter based on selectedTracking
            filteredTrackingPoints = inputTrackingPoints.filter(
                point => point.name === selectedTracking?.name
            );
        }

        const trackingLabels = filteredTrackingPoints.map(point => point.name);
        const trackingValues = filteredTrackingPoints.map(point => point.value);
        //console.log("trackingLabels", trackingLabels)
        setChartData({
            labels: trackingLabels,
            datasets: [{ data: trackingValues }]
        });
        setLoading(false);
        return filteredTrackingPoints;
    };

    // useEffect(() => {
    //     if (trackingPoints && journalEntry && selectedTracking) {
    //         assignChartData(trackingPoints);
    //         assignWordBubble(journalEntry, selectedTracking);
    //     }
    // }, [selectedTracking]);


    const semanticSearch = async (journalBody: string, searchScore: number) => {
        var Sentiment = require('sentiment');
        var sentiment = new Sentiment();
        var result = sentiment.analyze(journalBody);
        const semanticCalculationArray = result.calculation;
        const matchingKeys = [];

        for (const entry of semanticCalculationArray) {
            for (const [key, value] of Object.entries(entry)) {
                if (value === searchScore) {
                    matchingKeys.push(key);
                }
            }
        }

        return matchingKeys;
    }

    const assignLinkingWords = async (journalEntryInput: Journal, inputTrackingPoints: TrackingValue) => {
        const inputTrackingScore = inputTrackingPoints.score;

        let searchValue = 0;
        switch (inputTrackingScore) {
            case "negative":
                searchValue <= -1;
                break;
            case "positive":
                searchValue >= 1;
                break;
            default:
        }

        const semanticAnalysis = async (searchValue: number) => {
            const matchingKeys = await semanticSearch(journalEntryInput.body, searchValue);
            //remove duplicated and convert it back into an array
            const uniqueKeys = new Set(matchingKeys);
            return Array.from(uniqueKeys);
        };

        const tempReturn = await semanticAnalysis(searchValue);
        if (tempReturn) {
            setLinkingWords(tempReturn)
        }

    }

    const AssignGraphStates = async (journalInput: Journal, moodJournalInput: MoodJournal) => {
        try {
            //first get the tracking values and give each one a consistent value
            const returnedTrackingPoints = calculateCompleteTrackingValues(moodJournalInput);
            //console.log
            setTrackingPoints(returnedTrackingPoints);
            const defaultSelectedValue = assignChartData(returnedTrackingPoints);

            if (defaultSelectedValue) {
                assignLinkingWords(journalInput, defaultSelectedValue[0]);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            //setLoading(false);
        }
    };

    useEffect(() => {
        if (journalParam && moodJournalParam) {
            AssignGraphStates(journalParam, moodJournalParam);
        }
    }, [journalParam, moodJournalParam])





    return (
        <>
            <View style={styles.moodFeedbackContainer}>
                <Text style={[defaultStyles.titleHeader, styles.header]}>Daily Analysis</Text>
                {/* Timeline Navigation - (Daily, weekly, monthly) */}
                <View style={styles.timelineNav}>
                    {['Daily', 'Weekly', 'Monthly'].map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.button,
                                selectedTimeline === option && styles.selectedBubble,
                            ]}
                            onPress={() => handleTimelineOptionPressed(option)}
                        >
                            <Text style={styles.buttonText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.chartContainer} onLayout={((e) => { handleLayout(e) })}>
                    {/* Bar Chart */}
                    {chartData && (
                        <BarChart
                            data={chartData}
                            width={chartWidth}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            fromZero
                            fromNumber={100}
                            chartConfig={{
                                backgroundColor: Colors.primary,
                                backgroundGradientFrom: Colors.primary,
                                backgroundGradientTo: Colors.pink,
                                backgroundGradientFromOpacity: 0,
                                backgroundGradientToOpacity: 0,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                barPercentage: 4,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForBackgroundLines: {
                                    strokeWidth: 1
                                },
                                decimalPlaces: 0,
                            }}
                            style={{
                                marginVertical: 2,
                                borderRadius: 16,
                            }}
                        />
                    )}
                </View>
            </View>
            {trackingPoints !== undefined && (
                <View style={styles.trackingNav}>
                    {trackingPoints.map((trackingPoint, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.button,
                                selectedTracking?.name === trackingPoint.name ? styles.selectedBubble : null
                            ]}
                            onPress={() => handleTrackingPress(trackingPoint)}
                        >
                            <Text style={styles.buttonText}>{trackingPoint.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            <View style={styles.textIconRow}>
                <Text style={[defaultStyles.subTitleHeader]}>Linking Word Analysis</Text>
                <Animated.View  >
                    <TouchableOpacity >
                        <MaterialCommunityIcons name='cog'
                            color={"white"}
                            size={30}>
                        </MaterialCommunityIcons>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <Animated.View style={styles.wordBubbleContainer} entering={FadeInDown.delay(200)}>
                {linkingWords.map((word) => (
                    <Animated.View key={word} entering={SlideInLeft.delay(50)}>
                        <TouchableOpacity style={styles.wordBubble} >
                            <Text style={styles.buttonText}>{word}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </Animated.View>
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
    loadingPopup: {
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center'
    },
    moodFeedbackContainer: {
        flexDirection: 'column',
        justifyContent: "flex-start",
        paddingTop: 20
    },
    chartContainer: {
        width: '100%',
        borderRadius: 16,
        overflow: "hidden",
        alignSelf: "center",
    },
    timelineNav: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 10,
        paddingBottom: 15,
        paddingTop: 15,
    },
    trackingNav: {
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingBottom: 15,
        paddingTop: 5,
        gap: 10
    },
    button: {
        backgroundColor: Colors.transparentWhite,
        padding: 12,
        borderRadius: 10,
        //elevation: 10,
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
    selectedBubble: {
        backgroundColor: Colors.pink,
        padding: 12,
        borderRadius: 10,
    },
    header: {
        paddingBottom: 10
    },
    wordBubbleContainer: {
        justifyContent: "flex-start",
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
        paddingTop: 10,
        paddingBottom: 20
    },

    textIconRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flex: 1,
        paddingBottom: 10,
        paddingTop: 20
    },

})

export default BarChartComponent;