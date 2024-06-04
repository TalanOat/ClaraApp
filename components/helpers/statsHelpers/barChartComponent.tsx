
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
import { databaseService } from '@/model/databaseService';
import moment from 'moment';
import CustomScorePrompt from '../customScorePrompt';
import { semanticSearch } from '../reusable/journalHelper';

interface TrackingValue {
    name: string;
    value: number;
    positiveScore: boolean;
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
    created_at?: string;
    tracking_value1?: number;
}

interface BarChartProps {
    journalParam: Journal
    moodJournalParam: MoodJournal
    handleTimelineChanged: (selectedTimeline: string) => void;
}



const BarChartComponent = ({ journalParam, moodJournalParam, handleTimelineChanged }: BarChartProps) => {
    const [loading, setLoading] = useState<boolean>(false);

    const [selectedTimeline, setSelectedTimeline] = useState('Daily');
    const [chartData, setChartData] = useState<ChartData>();
    const [selectedTracking, setSelectedTracking] = useState<TrackingValue>();

    const [chartWidth, setChartWidth] = useState(0);
    const [trackingValues, setTrackingValues] = useState<TrackingValue[]>()
    const [linkingWords, setLinkingWords] = useState<string[]>([]);
    const [barWidth, setBarWidth] = useState<number>(4)

    const [noDailyEntries, setNoDailyEntries] = useState(false)

    const handleTimelineOptionPressed = (option: string) => {
        setSelectedTimeline(option);
        handleTimelineChanged(option);
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
        setBarWidth(4)
        setLoading(false);
        return filteredTrackingPoints;
    };



    const assignLinkingWords = async (journalEntryInput: Journal, inputTrackingPoints: TrackingValue) => {
        const inputTrackingScore = inputTrackingPoints.positiveScore;

        const semanticAnalysis = async (positive: boolean) => {
            const matchingKeys = await semanticSearch(journalEntryInput.body, positive);
            const uniqueKeys = new Set(matchingKeys);
            return Array.from(uniqueKeys);
        };

        const tempReturn = await semanticAnalysis(inputTrackingScore);
        if (tempReturn) {
            setLinkingWords(tempReturn)
        }

    }

    const SetupDailyGraphValues = async (journalInput: Journal, moodJournalInput: MoodJournal) => {
        try {
            const returnedTrackingPoints = calculateCompleteTrackingValues(moodJournalInput);
            setTrackingValues(returnedTrackingPoints);
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

    const assignWeeklyChartData = (inputJournals: Journal[]) => {
        const days: string[] = [];
        const values: number[] = [];

        inputJournals.forEach((journal) => {
            if (journal.created_at) {
                const formattedDay = moment(journal.created_at).format('DD/MM')
                days.push(formattedDay);

                if (journal.tracking_value1 !== undefined) {
                    values.push(journal.tracking_value1);
                } else {
                    values.push(0);
                }
            }
        });

        setBarWidth(1)

        setChartData({
            labels: days,
            datasets: [{ data: values }]
        });
    };




    const SetupWeeklyGraphValues = async () => {
        try {
            //assign the chart data from happiness only
            const currentDate = new Date().toISOString();
            const weeklyJournalEntries = await databaseService.getAllMoodJournalsForDaysFromDate(currentDate, 7)
            if (weeklyJournalEntries) {
                assignWeeklyChartData(weeklyJournalEntries)
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            //setLoading(false);
        }
    };

    const assignMonthlyChartData = (inputJournals: Journal[]) => {
        const days: string[] = [];
        const values: number[] = [];

        inputJournals.forEach((journal) => {
            if (journal.created_at) {
                const formattedDay = moment(journal.created_at).format('DD')
                days.push(formattedDay);

                if (journal.tracking_value1 !== undefined) {
                    values.push(journal.tracking_value1);
                } else {
                    values.push(0);
                }
            }
        });

        setBarWidth(0.5)

        setChartData({
            labels: days,
            datasets: [{ data: values }]
        });
    };

    const SetupMonthlyGraphValues = async () => {
        try {
            //assign the chart data from happiness only
            const currentDate = new Date().toISOString();
            const monthlyJournalEntries = await databaseService.getAllMoodJournalsForDaysFromDate(currentDate, 28)
            if (monthlyJournalEntries) {
                assignMonthlyChartData(monthlyJournalEntries)
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            //setLoading(false);
        }
    };



    //* probably being called twice after selectedTracking has been set and on the inital load as well
    useEffect(() => {
        if (trackingValues && journalParam && selectedTracking) {
            assignChartData(trackingValues);
            assignLinkingWords(journalParam, selectedTracking);
        }
    }, [selectedTracking]);


    useEffect(() => {
        if (selectedTimeline === "Daily") {
            SetupDailyGraphValues(journalParam, moodJournalParam);
        }
        if (selectedTimeline === "Weekly") {
            SetupWeeklyGraphValues();
        }
        if (selectedTimeline === "Monthly") {
            SetupMonthlyGraphValues();
        }
    }, [selectedTimeline])

    useEffect(() => {
        if (journalParam.id !== -1 && moodJournalParam.id !== -1) {
            SetupDailyGraphValues(journalParam, moodJournalParam);
        }
        else {
            setSelectedTimeline("Weekly")
            setNoDailyEntries(true);
        }
    }, [journalParam, moodJournalParam])

    const [showCustomScorePrompt, setShowCustomScorePrompt] = useState(false);

    const handleCustomPromptVisibility = () => {
        setShowCustomScorePrompt(!showCustomScorePrompt)
    }

    const handleWordSettings = () => {
        setShowCustomScorePrompt(true)
        console.log("word settings pressed")
    }


    return (
        <>
            <View style={styles.moodFeedbackContainer}>
                <Text style={[defaultStyles.titleHeader, styles.header]}>{selectedTimeline} Analysis</Text>
                {/* Timeline Navigation - (Daily, weekly, monthly) */}
                {!noDailyEntries && (
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
                )}
                {noDailyEntries && (
                    <View style={styles.timelineNav}>
                        {['Weekly', 'Monthly'].map(option => (
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
                )}


                <View style={styles.chartContainer} onLayout={((e) => { handleLayout(e) })}>
                    {/* Bar Chart */}
                    {chartData && barWidth && (
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
                                barPercentage: barWidth,
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

            {trackingValues !== undefined && selectedTimeline === "Daily" && (
                <>
                    <View style={styles.trackingNav}>
                        {trackingValues.map((value, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    selectedTracking?.name === value.name ? styles.selectedBubble : null
                                ]}
                                onPress={() => handleTrackingPress(value)}
                            >
                                <Text style={styles.buttonText}>{value.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.textIconRow}>
                        <Text style={[defaultStyles.subTitleHeader]}>Journal Word Analysis</Text>
                        <Animated.View  >
                            <TouchableOpacity onPress={() => handleWordSettings()}>
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
            )}
            {showCustomScorePrompt && (
                <CustomScorePrompt onVisibilityChanged={handleCustomPromptVisibility} />
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