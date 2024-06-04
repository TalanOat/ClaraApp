import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

interface CustomScorePromptProps {
    onVisibilityChanged: (visible: boolean) => void;
}

import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { databaseService } from '@/model/databaseService';

const CustomScorePrompt = ({ onVisibilityChanged }: CustomScorePromptProps) => {
    const [flashNotification, setFlashNotification] = useState(false);
    const [flashNotificationMessage, setFlashNotificationMessage] = useState("Error, please try again...");
    const [text, setText] = useState("");

    const handleCloseNotification = () => {
        onVisibilityChanged(false);
    }

    const [sliderValue1, setSliderValue1] = useState(50);


    const onChangeText = (word: string) => {
        setText(word)
    }

    const convertPercentageToScore = (percentage: number) => {
        const normalizedScore = Math.round((percentage - 50) / 10);
        return normalizedScore;
    }

    const handleSubmit = async () => {
        //console.log("word: ", text)
        //console.log("custom score: ", sliderValue1)
        const score = convertPercentageToScore(sliderValue1);
        //console.log("converted score: ", score)
        const success = await databaseService.createCustomWord(text, score)
    }

    return (
        <>
            <View style={styles.wordPromptContainer} >
                <View style={styles.navigationRow}>
                    <Text style={styles.header}>Add a custom score to any word</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={(() => handleCloseNotification())}>
                        <MaterialCommunityIcons name="close" size={35} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Word</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeText}
                        value={text}
                    />
                    <View style={styles.sliderRow}>
                        <Slider style={{ width: "100%", height: 40 }}
                            value={sliderValue1}
                            onValueChange={(value) => { setSliderValue1(value) }}
                            minimumValue={0}
                            maximumValue={100}
                            minimumTrackTintColor={Colors.pink}
                            maximumTrackTintColor={Colors.offWhite} />
                        <View style={styles.slidingLabelContainer}>
                            <Text style={styles.slidingLabel}>Bad</Text>
                            <Text style={styles.slidingLabel}>Neutral</Text>
                            <Text style={styles.slidingLabel}>Good</Text>
                        </View>
                    </View>

                </View>
                <TouchableOpacity style={styles.bottomRow} onPress={() => {handleSubmit()}}>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </View>

                </TouchableOpacity>
            </View>
            {
                flashNotification && (
                    <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
                        <Text style={flashMessage.innerText}>{flashNotificationMessage}</Text>
                    </Animated.View>
                )
            }
        </>



    )
}

const styles = StyleSheet.create({
    wordPromptContainer: {
        position: 'absolute',
        top: 80,
        left: 25,
        right: 25,
        bottom: 25,
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.primary,
        padding: 30,
        zIndex: 9999,
        height: 450
        //gap: 0
    },
    placeNameHeader: {
        color: 'white',
        fontFamily: 'mon-sb',
        fontSize: 16,
        //maxHeight: 25,
        //marginBottom: 5
        textDecorationLine: 'underline',
        marginBottom: 10
    },
    navigationRow: {
        flexDirection: 'row',
        //paddingHorizontal: 5,
        //width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        //paddingHorizontal: 30,
        //backgroundColor: "gray"
    },
    closeButton: {

    },
    formContainer: {
        paddingTop: 30
    },
    input: {
        backgroundColor: Colors.transparentWhite,
        padding: 15,
        borderRadius: 10,
        height: 50,
        fontSize: 16,
        color: "white",
        fontFamily: "mon-sb",

    },
    inputLabel: {
        fontSize: 16,
        color: "white",
        fontFamily: "mon-sb"
    },
    headerRow: {
        flexDirection: 'row',
    },
    header: {
        color: 'white',
        fontFamily: 'mon-sb',
        fontSize: 16,
        //backgroundColor: "pink",
        maxWidth: 200
    },
    sliderRow: {
        marginTop: 20
    },
    sliderInput: {},
    slidingLabelContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',

    },
    slidingLabel: {
        fontSize: 14,
        color: "white",
        fontFamily: "mon",
    },
    bottomRow: { flex: 1, justifyContent: "flex-end", alignItems: "flex-end" },
    button: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-sb",
        fontSize: 16,

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
        //borderRadius: 10,
        overflow: "hidden"
    },
    innerText: {
        padding: 20,
        color: "white",
        fontFamily: "mon-b",
        fontSize: 15,

        backgroundColor: Colors.pink,
        borderRadius: 10,
        //margin: 50
        overflow: "hidden"
    }
})

export default CustomScorePrompt