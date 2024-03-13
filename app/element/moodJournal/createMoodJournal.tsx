import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { defaultStyles } from '@/constants/Styles'
import emotionsData from '@/assets/data/emotionsUpdated.json';

import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,

} from 'react-native-reanimated';

import { databaseService } from '@/model/databaseService'
import Colors from '@/constants/Colors'
import Slider from '@react-native-community/slider'

interface TrackingName {
    id: number;
    name: string;
}

interface SelectedEmotion {
    baseKey: number;
    extendedKey?: string;
}

interface MoodJournal {
    createdAt: string;
    trackingNameId1: number;
    figure1: number;
    trackingNameId2: number;
    figure2: number;
    trackingNameId3: number;
    figure3: number;
}


const createJournal = () => {
    const [loading, setLoading] = useState(false);
    const [flashNotification, setFlashNotification] = useState(false);
    const [userTrackingVals, setUserTrackingVals] = useState<TrackingName[]>([]);

    /* ------------------------- BACKEND FOR THE SLIDERS ------------------------ */
    const [sliderValue1, setSliderValue1] = useState<number>(0);
    const [sliderValue2, setSliderValue2] = useState<number>(0);
    const [sliderValue3, setSliderValue3] = useState<number>(0);


    const fetchTrackingValues = async () => {
        try {
            const tempValues = await databaseService.getLastThreeTrackingNames();
            if (tempValues) {
                setUserTrackingVals(tempValues);
            }
        } catch (error) {
            console.error("error getting values:", error);
        }
    };

    const calculatePercentage = (inputValue: number) => {
        const formula = Math.round(inputValue * 100);
        return (formula);
    }

    //-----------------------------------------------------------------

    //ANCHOR EMOTIONS BACKEND
    const [selectedEmotions, setSelectedEmotions] = useState<SelectedEmotion[]>([]);
    const [extendedOpenKeys, setExtendedOpenKeys] = useState<number[]>([]);

    //Called when an emotion is pressed and updates the setSelectedEmotions() state according to
    //  the users input. Pressing an extended emotion once will add it and then pressing again will remove it
    const handleEmotionPressed = (baseEmotionKey: number, extendedEmotionKey?: string) => {
        //(1) checks to see if the emotion pressed is already in the array
        const emotionSelected = selectedEmotions.some(emotion => {
            emotion.baseKey === baseEmotionKey && emotion.extendedKey === extendedEmotionKey
        });
        setSelectedEmotions(prevEmotions => {
            // Checks to see if the base emotion already exists in the selected array
            const duplicateBaseEmotion = prevEmotions.some(emotion =>
                emotion.baseKey === baseEmotionKey && !extendedEmotionKey
            );

            //console.log("duplicateBaseEmotion: ", duplicateBaseEmotion);

            //if duplicated then return the previous emotions in the array and don't change it
            if (duplicateBaseEmotion) {
                return prevEmotions;
            }
            else {
                //(2a) if it is already in the array it needs to be found and removed as the user has
                //  toggled the button and wants to remove it
                if (emotionSelected) {
                    return prevEmotions.filter(emotion =>
                        !(emotion.baseKey === baseEmotionKey && emotion.extendedKey === extendedEmotionKey)
                    );
                }
                //(2b) otherwise just add the emotion to the array keeping the previous emotions already there
                else {
                    return [
                        ...prevEmotions,
                        { baseKey: baseEmotionKey, extendedKey: extendedEmotionKey || "null" }
                    ];
                }
            }
        });

        //(1) Finally this statement is used to identify if the base Emotion 
        if (extendedEmotionKey === undefined) {

            setExtendedOpenKeys(prevKeys => {
                //(2a) Then check whether the baseEmotion is already in the ExtendedOpenKeys
                //  which would mean that it already open and needs to be closed
                if (prevKeys.includes(baseEmotionKey)) {
                    return prevKeys.filter(key => key !== baseEmotionKey);
                }
                //(2b) Otherwise open the baseEmotionKey extending emotions buttons
                else {
                    return [...prevKeys, baseEmotionKey];
                }
            });
        }
    };

    const handleCancelEmotion = () => {
        setSelectedEmotions([]);
    };

    // useEffect(() => {
    //     console.log(selectedEmotions)
    // }, [selectedEmotions]);

    //-----------------------------------------------------------------------------------------

    //TODO check that this is only run after the create Tracking Data as it needs the trackingID
    const databaseCreateMoodJournal = async (inputMoodJournal:MoodJournal) => {
        //console.log("in tracking set")
        try {
            const returnedMoodJournalID = await databaseService.createMoodJournal(inputMoodJournal);
            if (returnedMoodJournalID) {
                return returnedMoodJournalID
            }
            else {
                // TODO: - handle this
                console.error("error getting returnedMoodJournalID");
                return null;
            }

        } catch (error) {
            console.error("error inserting mood Journal:", error);
        }
    }

    async function databaseCreateAndLinkEmotions(selectedEmotions: SelectedEmotion[], moodJournalID: number) {
        for (const emotion of selectedEmotions) {
            try {

                const emotionId = await databaseService.addEmotion(emotion.baseKey, emotion.extendedKey);
                if(emotionId){
                    console.log("Added emotion with ID: ", emotionId);
                    await databaseService.addMoodJournalEmotion(moodJournalID, emotionId);
                }                

            } catch (error) {
                console.error(`Error adding emotion ${emotion.baseKey} - ${emotion.extendedKey}:`, error);
            }
        }
    }
    const handleSubmit = async () => {
        setFlashNotification(true);
        const currentTime = new Date().toISOString()
        const inputMoodJournal: MoodJournal = ({
            createdAt: currentTime,
            trackingNameId1: userTrackingVals[2].id,
            figure1: calculatePercentage(sliderValue1),
            trackingNameId2: userTrackingVals[1].id,
            figure2: calculatePercentage(sliderValue2),
            trackingNameId3: userTrackingVals[0].id,
            figure3: calculatePercentage(sliderValue3)
        });
        console.log("inputMoodJournal: ", inputMoodJournal)
        
        const moodJournalID = await databaseCreateMoodJournal(inputMoodJournal);
        if (moodJournalID) {
             databaseCreateAndLinkEmotions(selectedEmotions, moodJournalID)
         }
        setTimeout(() => {
            setFlashNotification(false);
        }, 1000);
    }

    useEffect(() => {
        if (userTrackingVals) {
            setLoading(false);
            console.log("userTrackingVals: ", userTrackingVals)

        }
    }, [userTrackingVals]);

    useEffect(() => {
        setLoading(true);
        fetchTrackingValues().then(() => {
            setLoading(false);
        })
    }, []);

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
                                {userTrackingVals[2]?.name}
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
                                {userTrackingVals[1]?.name}
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
                                {userTrackingVals[0]?.name}
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
                    {/* Emotions container */}
                    <View style={emotionsStyles.emotionsContainer}>
                        {/* Base emotions Mapping */}
                        {emotionsData.map((emotion) => (
                            <Animated.View key={emotion.key} entering={FadeInDown.delay(200)}>
                                <TouchableOpacity
                                    style={[
                                        emotionsStyles.button,
                                        { backgroundColor: emotion.backgroundColor },
                                        //if at least one of the selectedEmotions by the user is the same 
                                        //  as the base emotion, and the extendedKey is not selected then add 
                                        //  the selectedButton style
                                        selectedEmotions.some(em =>
                                            em.baseKey === emotion.key && em.extendedKey === "null"
                                        ) ? emotionsStyles.selectedButton : null
                                    ]}
                                    onPress={() => handleEmotionPressed(emotion.key)}>
                                    <Text style={emotionsStyles.buttonText}>{emotion.name}</Text>
                                </TouchableOpacity>
                                {/* Extended emotions Mapping */}
                                {extendedOpenKeys.includes(emotion.key) && (
                                    <View style={emotionsStyles.extendedEmotionsContainer}>
                                        {emotion.extendedEmotions?.map(extEmotion => (
                                            <TouchableOpacity
                                                key={extEmotion.key}
                                                style={[
                                                    emotionsStyles.button,
                                                    { backgroundColor: extEmotion.backgroundColor },
                                                    selectedEmotions.some(ext =>
                                                        ext.baseKey === emotion.key && ext.extendedKey === extEmotion.key
                                                    ) ? emotionsStyles.selectedButton : null,
                                                ]}
                                                onPress={() => handleEmotionPressed(emotion.key, extEmotion.key)}>
                                                <Text style={emotionsStyles.buttonText}>{extEmotion.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </Animated.View>
                        ))}
                        <Animated.View style={emotionsStyles.cancelButtonContainer} entering={FadeInDown.delay(100)}>
                            <TouchableOpacity
                                style={[
                                    emotionsStyles.cancelButton,
                                ]}
                                onPress={() => handleCancelEmotion()}>
                                {/* <Text style={emotionsStyles.buttonText}>Cancel</Text> */}
                                <MaterialCommunityIcons name="window-close" size={25} color="white" />
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

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

const emotionsStyles = StyleSheet.create({
    emotionsContainer: {
        marginTop: 25,
        flexDirection: "row",
        gap: 15,
        flexWrap: "wrap"
    },
    button: {
        //backgroundColor: Colors.pink,
        padding: 15,
        alignSelf: 'flex-start',
        borderRadius: 10,
        elevation: 10,
        opacity: 0.5
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-b",
    },
    selectedButton: {
        //backgroundColor: Colors.primary,
        color: "black",
        opacity: 1
    },
    extendedEmotionsContainer: {
        marginTop: 15,
        flexDirection: "row",
        gap: 15,
        flexWrap: "wrap"
    },
    cancelButtonContainer: {},
    cancelButton: {
        padding: 11,
        alignSelf: 'flex-end',
        borderRadius: 10,
        elevation: 10,
        backgroundColor: Colors.primary
    },
    cancelButtonText: {}

})


const styles = StyleSheet.create({
    submitFormButton: {
        marginTop: 100
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