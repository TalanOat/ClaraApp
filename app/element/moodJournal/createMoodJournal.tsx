import { View, Text, TextInput, StyleSheet, Touchable, TouchableOpacity, Easing, PanResponder, } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { defaultStyles } from '@/constants/Styles'

import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import { databaseService } from '@/model/databaseService'
import Colors from '@/constants/Colors'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Slider from '@react-native-community/slider'

interface TrackingValues {
    id: number;
    value1: string;
    value2: string;
    value3: string;
}

const createJournal = () => {
    const [loading, setLoading] = useState(false);
    const [flashNotification, setFlashNotification] = useState(false);
    const [userTrackingVals, setUserTrackingVals] = useState<TrackingValues>();

    //three states for the sliders
    const [sliderValue1, setSliderValue1] = useState<number>(0);
    const [sliderValue2, setSliderValue2] = useState<number>(0);
    const [sliderValue3, setSliderValue3] = useState<number>(0);

    const handleSubmit = () => {
        setFlashNotification(true);

        setTimeout(() => {
            setFlashNotification(false);
        }, 1000);
    }

    useEffect(() => {
        //console.log(sliderValue1)
    }, [sliderValue1])

    const fetchTrackingValues = async () => {
        try {
            const tempValues = await databaseService.getAllTrackingValues();
            setUserTrackingVals(tempValues);
        } catch (error) {
            console.error("error getting values:", error);
        }
    };

    useEffect(() => {
        //if to prevent for recursively calling when there is no value.
        if (userTrackingVals) {
            console.log("second get : ", userTrackingVals.value1);
            console.log("second get : ", userTrackingVals.value2);
            console.log("second get : ", userTrackingVals.value3);
            setLoading(false);
        }
    }, [userTrackingVals]);

    useEffect(() => {
        setLoading(true);
        fetchTrackingValues()
    }, []);

    //TODO: move to another component
    const getData = async () => {
        console.log("in dummy")
        try {
            if (userTrackingVals) {
                const tempValues = await databaseService.getAllTrackingAndData(userTrackingVals.id);
                console.log(tempValues)
                //setUserTrackingVals(tempValues);
            }
        } catch (error) {
            console.error("error inserting values:", error);
        }
    }

    
    const addDataForTrackingValues = async (figure1: number, figure2: number, figure3: number) => {
        //console.log("in tracking set")
        try {
            if (userTrackingVals) {
                await databaseService.createTrackingDataAndLink (
                    figure1, figure2, figure3, userTrackingVals.id);
            }
        } catch (error) {
            console.error("error inserting values:", error);
        }
    }

    const calculatePercentage = ( inputValue:number ) => {
        const formula = Math.round(inputValue * 100);
        return(formula);
    }

    const handleTestSubmit = () => {
        //addDataDummyTest();
        //getData();
        const figure1 = calculatePercentage(sliderValue1);
        const figure2 = calculatePercentage(sliderValue2);
        const figure3 = calculatePercentage(sliderValue3);
        console.log(
         "figure 1: ", figure1,
         "figure 2: ", figure2,
         "figure 3: ", figure3)
        addDataForTrackingValues(figure1, figure2, figure3);
    }

    //TODO: calculate the percentage value of each slider in a function to be a number between 1-10, or 1-100
    // Then set it using the function, then try to print it using the other funciton to test it working



    return (
        <LinearGradient
            style={styles.container}
            colors={["#20115B", "#C876FF"]}
        >
            <Animated.ScrollView style={styles.journalContainer} entering={SlideInDown.delay(50)}>
                <View style={styles.topRow}>
                    <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={styles.elementIcon} />
                    <Text style={styles.elementTitle}>Check In</Text>
                    <TouchableOpacity onPress={() => { handleSubmit(); }} >
                        <MaterialCommunityIcons name="check" size={40} color="white" />
                    </TouchableOpacity>

                </View>
                <View style={styles.contentRow}>
                    <Text style={[defaultStyles.titleHeader, styles.moodHeader]}>Morning John</Text>
                    {/* first slider row : user interaction affects the sliderValue using a range from 0-1*/}
                    {!loading && (
                        <View style={styles.sliderRow}>
                            <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                                {userTrackingVals?.value1}
                            </Text>
                            <Slider style={{ width: 200, height: 40 }}
                                value={sliderValue1}
                                onValueChange={(value) => { setSliderValue1(value) }}
                                minimumValue={0}
                                maximumValue={1}
                                minimumTrackTintColor={Colors.pink}
                                maximumTrackTintColor={Colors.primary} />
                        </View>
                    )}
                    {/* second slider row */}
                    {!loading && (
                        <View style={styles.sliderRow}>
                            <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                                {userTrackingVals?.value2}
                            </Text>
                            <Slider style={{ width: 200, height: 40 }}
                                value={sliderValue2}
                                onValueChange={(value) => { setSliderValue2(value) }}
                                minimumValue={0}
                                maximumValue={1}
                                minimumTrackTintColor={Colors.pink}
                                maximumTrackTintColor={Colors.primary} />
                        </View>
                    )}
                    {/* third slider row */}
                    {!loading && (
                        <View style={styles.sliderRow}>
                            <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
                                {userTrackingVals?.value3}
                            </Text>
                            <Slider style={{ width: 200, height: 40 }}
                                value={sliderValue3}
                                onValueChange={(value) => { setSliderValue3(value) }}
                                minimumValue={0}
                                maximumValue={1}
                                minimumTrackTintColor={Colors.pink}
                                maximumTrackTintColor={Colors.primary} />
                        </View>
                    )}
                    <TouchableOpacity style={[defaultStyles.button, styles.submitFormButton]} onPress={(e) => {handleTestSubmit()}}>
                        <Text style={defaultStyles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>
            {flashNotification && (
                <Animated.View entering={FadeInDown.delay(50)} exiting={FadeOutUp.delay(50)} style={flashMessage.container}>
                    <Text style={flashMessage.innerText}>Success</Text>
                </Animated.View>
            )}
        </LinearGradient>

    )
}

const styles = StyleSheet.create({
    submitFormButton: {
        marginTop: 10
    },
    container: {
        flex: 1,
    },
    journalContainer: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 12,
        borderRadius: 10,
        marginRight: 15,
        marginLeft: 15,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10
    },
    elementTitle: {
        color: "white",
        fontSize: 15,
        fontFamily: "mon-b",
        flex: 1
    },
    elementIcon: {
        marginRight: 10
    },
    contentRow: {
        padding: 20
    },
    progressText: { marginBottom: 10, },
    sliderRow: {
        paddingTop: 10
    },
    moodHeader: {
        marginBottom: 15
    }
})

const flashMessage = StyleSheet.create({
    container: {
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerText: {
        padding: 20,
        color: "white",
        fontFamily: "mon-b",
        fontSize: 15,

        backgroundColor: Colors.pink,
        borderRadius: 10,
        //margin: 50
    }
})


export default createJournal