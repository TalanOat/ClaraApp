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



const createJournal = () => {
    const [flashNotification, setFlashNotification] = useState(false);
    const [sliderValue, setSliderValue] = useState<number>(0);


    const handleSubmit = () => {
        setFlashNotification(true);

        setTimeout(() => {
            setFlashNotification(false);
        }, 1000);
    }

    useEffect(() => {
        console.log(sliderValue)
    }, [sliderValue])



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
                    <View style={styles.sliderRow}>
                        <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>Happiness</Text>
                        <Slider style={{ width: 200, height: 40 }}
                            value={sliderValue}
                            onValueChange={(value) => {setSliderValue(value)}}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor={Colors.pink}
                            maximumTrackTintColor={Colors.primary} />
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

const styles = StyleSheet.create({
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