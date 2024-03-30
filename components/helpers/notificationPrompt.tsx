import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { defaultStyles } from '@/constants/Styles'
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import * as WebBrowser from 'expo-web-browser';
import * as SMS from 'expo-sms';

interface FeebackProps {
    handleCloseNotification: () => void;
}

const HappyFeedback = ({ handleCloseNotification }: FeebackProps) => {
    return (
        <View style={styles.feedbackContainer}>
            <Text style={styles.titleHeader}>That's great!</Text>
            <Text style={styles.header1}>This app will ask at set intervals if you are feeling okay,
                or if you haven't used the app for a while
            </Text>
            <View style={styles.suggestionElement}>
                <TouchableOpacity style={styles.button} onPress={(() => handleCloseNotification())}>
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const NeutralFeedback = ({ handleCloseNotification }: FeebackProps) => {
    return (
        <View style={styles.feedbackContainer}>
            <Text style={styles.titleHeader}>That's okay</Text>
            <View style={styles.suggestionElement}>
                <Text style={styles.header1}>You could try writing about it and it might help to clear your thoughts?</Text>
                <Link href={'/element/journal/createJournal'} asChild>
                    <TouchableOpacity style={styles.button} onPress={(() => handleCloseNotification())}>
                        <Text style={styles.buttonText}>Add Journal</Text>
                    </TouchableOpacity>
                </Link>
            </View>
            <View style={styles.suggestionElement}>
                <Text style={styles.header1}>Perhaps a change of scenery?</Text>
                <Link href={'/(tabs)/map'} asChild>
                    <TouchableOpacity style={styles.button} onPress={(() => handleCloseNotification())}>
                        <Text style={styles.buttonText}>Go for a walk</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    )
}

const SadFeedback = ({ handleCloseNotification }: FeebackProps) => {
    const [extraVisible, setExtraVisible] = useState(false);
    const [smsAvailable, setSmsAvailable] = useState(false);

    const emergencyContact = '07492487488'

    const handleOpenLink = async () => {
        await WebBrowser.openBrowserAsync('https://www.nhs.uk/nhs-services/mental-health-services/');
    };
    const checkSMSAvailability = async () => {
        const isAvailable = await SMS.isAvailableAsync();
        setSmsAvailable(isAvailable);
    }

    const handleSendSMS = async () => {
        if (smsAvailable) {
            const { result } = await SMS.sendSMSAsync(
                [emergencyContact],
                `I'm struggling mentally right now and need your support. Can we talk or can you please come be with me?`
            );
            console.log(result);
        } else {
            console.log('SMS not available on this device');
        }
    };

    useEffect(() => {
        checkSMSAvailability()
    }, [])

    return (
        <View style={styles.feedbackContainer}>
            {!extraVisible && (
                <>
                    <Text style={styles.titleHeader}>Sorry to hear that</Text>
                    <View style={styles.suggestionElement}>
                        <Text style={styles.header1}>Here is a message from the vault:</Text>
                        <ScrollView>
                            <Text style={defaultStyles.paragraph}>Encouraging message is here...</Text>
                        </ScrollView>
                    </View>
                    <View style={styles.suggestionElement}>
                        <Text style={styles.header1}>A walk might help to clear your head</Text>
                        <Link href={'/(tabs)/map'} asChild>
                            <TouchableOpacity style={styles.button} onPress={(() => handleCloseNotification())}>
                                <Text style={styles.buttonText}>Go for a walk</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                    <View style={styles.suggestionElement}>
                        <TouchableOpacity style={styles.button} onPress={(() => setExtraVisible(true))}>
                            <Text style={styles.buttonText}>None of this is helping</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
            {extraVisible && (
                <View style={styles.extraContainer}>
                    <View style={styles.suggestionElement}>
                        <Text style={styles.header1}>Would you like to message your emergency contact?</Text>
                        <TouchableOpacity style={styles.button} onPress={(() => handleSendSMS())}>
                            <Text style={styles.buttonText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.suggestionElement}>
                        <Text style={styles.header1}>Here is a link to some emergency services for your country</Text>
                        <TouchableOpacity style={styles.button} onPress={(() => handleOpenLink())}>
                            <Text style={styles.buttonText}>Open in browser</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}

interface NotificationPromptProps {
    onVisibilityChanged: (visible: boolean) => void;
}

const NotificationPrompt = ({ onVisibilityChanged }: NotificationPromptProps) => {
    const [selectedEmotion, setSelectedEmotion] = useState("");
    //const [isNotificationVisible, setIsNotificationVisible] = useState(true);


    const handleCloseNotification = () => {
        onVisibilityChanged(false);
    };

    return (

            <BlurView style={styles.notificationContainer} intensity={40} tint="light" >
                <BlurView style={styles.formContainer} intensity={100} tint="light">
                    <View style={styles.closeContainerNav}>
                        <TouchableOpacity style={styles.closeButton} onPress={(() => handleCloseNotification())}>
                            <MaterialCommunityIcons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.formContent}>
                        {selectedEmotion === "" && (
                            <View style={styles.startingFormContent}>
                                <Text style={styles.titleHeader}>You haven't interacted with the app in a while</Text>
                                <Text style={styles.header1}>How are you feeling?</Text>
                                <View style={styles.formRow}>
                                    <TouchableOpacity onPress={(() => setSelectedEmotion("happy"))}>
                                        <MaterialCommunityIcons name="emoticon-happy" size={50} color={Colors.pink} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={(() => setSelectedEmotion("neutral"))}>
                                        <MaterialCommunityIcons name="emoticon-neutral" size={50} color={Colors.pink} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={(() => setSelectedEmotion("sad"))}>
                                        <MaterialCommunityIcons name="emoticon-sad" size={50} color={Colors.pink} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {selectedEmotion === "happy" && (
                            <HappyFeedback handleCloseNotification={handleCloseNotification}></HappyFeedback>
                        )}
                        {selectedEmotion === "neutral" && (
                            <NeutralFeedback handleCloseNotification={handleCloseNotification}></NeutralFeedback>
                        )}
                        {selectedEmotion === "sad" && (
                            <SadFeedback handleCloseNotification={handleCloseNotification}></SadFeedback>
                        )}
                    </View>
                </BlurView>
            </BlurView>



    )
}

const styles = StyleSheet.create({
    
    notificationContainer: {
        width: "100%",
        height: "100%",
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 90,
        paddingBottom: 90,
        flex: 1,
        alignItems: "center",
        borderRadius: 20,
        overflow: 'hidden'
        //backgroundColor: Colors.primary,

    },
    formContainer: {
        flex: 1,
        width: "90%",
        height: "100%",
        backgroundColor: Colors.primary,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: 20,
        borderRadius: 20,
        overflow: 'hidden'

    },
    innerText: {
        padding: 20,
        color: "white",
        fontFamily: "mon-b",
        fontSize: 15,
        backgroundColor: Colors.pink,
        borderRadius: 10,
    },
    header1: {
        color: "white",
        fontSize: 16,
        fontFamily: "mon-sb",
        textAlign: "center"
    },
    titleHeader: {
        color: "white",
        fontSize: 22,
        fontFamily: "mon-b",
        textAlign: "center",
        marginBottom: 20
    },
    formRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        width: "100%",
        marginTop: 30
        //flex: 1
    },
    button: {
        backgroundColor: Colors.pink,
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
    closeButton: {

    },
    closeContainerNav: {
        alignItems: "flex-end",
        //backgroundColor: "pink",
        width: "100%",
        //flex: 1
    },
    startingFormContent: {
        flex: 1,
        height: "100%",
        width: "100%",
        justifyContent: "space-evenly",
        alignItems: "center"
    },
    suggestionElement: {
        gap: 10,
        alignItems: "center",
        //
        // backgroundColor: Colors.transparentWhite,
        // padding: 20,
        // borderRadius: 16,
        justifyContent: "center"
    },
    feedbackContainer: {
        flex: 1,
        height: "100%",
        width: "100%",
        justifyContent: "space-evenly",
        //
        gap: 10
    },
    formContent: {
        flex: 1,
        height: "100%",
        width: "100%",
        justifyContent: "space-between"
    },
    extraContainer: {
        flex: 1,
        height: "100%",
        width: "100%",
        justifyContent: "space-evenly",
        //
    }

})

export default NotificationPrompt