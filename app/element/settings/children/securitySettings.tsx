import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

import * as SecureStore from 'expo-secure-store';

import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';

const SecuritySettings = () => {
    const [actualPin, setActualPin] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [flashNotification, setFlashNotification] = useState(false);
    const [flashNotificationMessage, setFlashNotificationMessage] = useState("Error, please try again...");

    const onCurrentPinChanged = (pin: string) => {
        setCurrentPin(pin)
    }

    const onNewPinChanged = (pin: string) => {
        setNewPin(pin)
    }

    const onConfirmPinChanged = (pin: string) => {
        setConfirmPin(pin)
    }

    const saveSettings = async (newPin: string) => {
        try {
            await SecureStore.setItemAsync('userPin', newPin);
            console.log('Pin saved successfully');
        } catch (error) {
            console.error('Error saving pin:', error);
        }
        finally {
            setFlashNotification(true);
            setFlashNotificationMessage("Settings saved successfully")
            setTimeout(() => {
                setFlashNotification(false);
            }, 1000);
        }
    }

    const handleSave = () => {
        //saveSettings();
        //check first that the current pin is correct:
        if(currentPin === actualPin){
            if(newPin === confirmPin){
                saveSettings(newPin);
            }
            else{
                setFlashNotification(true);
                setFlashNotificationMessage("New pin and confirm pins are not matching")
                setTimeout(() => {
                    setFlashNotification(false);
                }, 1000);
            }
        }
        else{
            setFlashNotification(true);
            setFlashNotificationMessage("The current pin you entered is incorrect")
            setTimeout(() => {
                setFlashNotification(false);
            }, 1000);
        }

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

    useEffect(() => {


        loadPinSettings();
    }, []);

    return (

        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Journal Pin Settings </Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView >
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Current Pin</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                onChangeText={onCurrentPinChanged}
                                keyboardType='number-pad'
                                secureTextEntry={true}
                                value={currentPin}
                            />

                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>New Pin</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                onChangeText={onNewPinChanged}
                                keyboardType='number-pad'
                                secureTextEntry={true}
                                value={newPin}
                            />

                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Confirm Pin</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                onChangeText={onConfirmPinChanged}
                                keyboardType='number-pad'
                                secureTextEntry={true}
                                value={confirmPin}
                            />

                        </View>
                    </View>


                </ScrollView>
                {flashNotification && (
                    <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
                        <Text style={flashMessage.innerText}>{flashNotificationMessage}</Text>
                    </Animated.View>
                )}
            </LinearGradient>
        </KeyboardAvoidingView>



    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingHorizontal: 20,

    },
    mainHeaderContainer: {
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },
    titleHeader: {
        color: "white",
        fontSize: 22,
        fontFamily: "mon-b",
        //marginBottom: 20
    },
    section: {
        //paddingHorizontal: 20,
    },
    sectionHeader: {
        paddingVertical: 10,
        color: Colors.offWhite,
        fontSize: 16,
        fontFamily: "mon-sb",
    },

    saveButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,

        //alignContent: "center",
        //justifyContent: "center",
        //alignSelf: "flex-end",
        //width: 60
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-b",
        fontSize: 12
    },
    suggestedContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10
    },
    suggestedItem: {
        backgroundColor: Colors.transparentWhite,
        padding: 10,
        borderRadius: 10,
        //color: "white"
    },
    suggestedItemText: {
        color: Colors.offWhite,
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

export default SecuritySettings;