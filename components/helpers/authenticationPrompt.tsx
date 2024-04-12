import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

interface AuthenticationPromptProps {
    onVisibilityChanged: (visible: boolean) => void;
}

import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';

const AuthenticationPrompt = ({ onVisibilityChanged }: AuthenticationPromptProps) => {

    const [actualPin, setActualPin] = useState('');

    const handleCloseNotification = () => {
        onVisibilityChanged(false);
    }

    const loadPinSettings = async () => {
        try {
            const storedPin = await SecureStore.getItemAsync('userPin');
            if (storedPin) {
                setActualPin(storedPin);
            }
        } catch (error) {
            console.error('Error loading name:', error);
        }
    };

    const [pinInput, setPinInput] = useState('');
    const [flashNotification, setFlashNotification] = useState(false);
    const [flashNotificationMessage, setFlashNotificationMessage] = useState("Error, please try again...");

    const onTextChanged1 = (pinValue: string) => {
        setPinInput(pinValue)
    }

    const handleDone = () => {

        if (pinInput === actualPin) {
            onVisibilityChanged(false);
        }
        else {
            setFlashNotificationMessage("Incorrect pin, please try again")
            setFlashNotification(true);
            setTimeout(() => {
                setFlashNotification(false);
            }, 1000);
        }


    }


    useEffect(() => {
        loadPinSettings();
    }, [])

    return (
        <>
            <BlurView style={styles.notificationContainer} intensity={40} tint="light" experimentalBlurMethod='dimezisBlurView'>
                <BlurView style={styles.formContainer} intensity={100} tint="light" experimentalBlurMethod='dimezisBlurView'>
                    <View style={styles.formContent}>
                        <View style={styles.section}>
                            <Text style={styles.infoText}>Unlock Your Encrypted Content</Text>

                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Pin</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.trackingInput}
                                    secureTextEntry={true}
                                    onChangeText={onTextChanged1}
                                    keyboardType='number-pad'
                                    value={pinInput}
                                    textAlign={'center'}
                                />
                            </View>

                        </View>
                        <View style={styles.section}>
                            <TouchableOpacity style={styles.button} onPress={(() => { handleDone() })}>
                                <Text style={styles.buttonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </BlurView>
            </BlurView>
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

    notificationContainer: {
        width: "100%",
        height: "88%",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        alignItems: "center",
        borderRadius: 20,
        overflow: 'hidden',
        paddingVertical: 20

    },
    formContainer: {
        flex: 1,
        width: "90%",
        height: "90%",
        backgroundColor: Colors.primary,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: 20,
        borderRadius: 20,
        overflow: 'hidden'

    },
    button: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        //elevation: 10,
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-b",
        alignSelf: "center",
        fontSize: 12
    },

    formContent: {
        flex: 1,
        height: "100%",
        width: "100%",
        justifyContent: "center",
        gap: 20
    },

    section: {
        //paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    sectionHeader: {
        paddingVertical: 10,
        color: Colors.offWhite,
        fontSize: 16,
        fontFamily: "mon-sb",
    },
    inputRow: {
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        gap: 10
    },
    trackingInput: {
        flex: 1,
        width: "100%",
        backgroundColor: Colors.transparentWhite,
        padding: 15,
        borderRadius: 10,
        height: 50,
        fontSize: 16,
        color: "white"
    },
    infoText: {
        color: "white",
        fontFamily: "mon-b",
        fontSize: 18,
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

export default AuthenticationPrompt