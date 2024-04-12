import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';


import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,
    ZoomIn,
    ZoomOut,
  } from 'react-native-reanimated';

const FourthScreen = () => {
    const [pinInput, setPinInput] = useState('');
    const [confirmPinInput, setConfirmPinInput] = useState('');
    const [flashNotification, setFlashNotification] = useState(false);

    const onTextChanged1 = (pinValue: string) => {
        setPinInput(pinValue)
    }

    const onTextChanged2 = (pinValue: string) => {
        setConfirmPinInput(pinValue)
    }

    const handleSave = async () => {
        try {
            await SecureStore.setItemAsync('userPin', pinInput);
            console.log('settings saved successfully: ', pinInput);
        } catch (error) {
            console.error('error saving privacy settings:', error);
        }
        finally {
            router.push('/element/introScreens/finalScreen')
        }
    }

    const handleLeft = async () => {
        router.back()
    }

    const handleRight = async () => {
        if(pinInput === confirmPinInput){
            handleSave();
        }
        else{
            setFlashNotification(true);
            setTimeout(() => {
              setFlashNotification(false);
            }, 1000);
        }

    }

    return (

        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={40}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Journal Pin</Text>
                    </View>

                </View>
                <View style={styles.subHeaderRow}>
                    <Text style={styles.subHeaderText}>All your journal entries are encrypted using this pin, so please keep it safe and remember it as without it your data will not be recoverable.</Text>
                </View>


                <ScrollView keyboardShouldPersistTaps={'always'}>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Pin</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                secureTextEntry={true}
                                onChangeText={onTextChanged1}
                                keyboardType='number-pad'
                                value={pinInput}
                            />
                        </View>

                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Confirm Pin</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                secureTextEntry={true}
                                onChangeText={onTextChanged2}
                                keyboardType='number-pad'
                                value={confirmPinInput}
                            />
                        </View>

                    </View>
                    <View style={styles.navigationButtons}>
                        <TouchableOpacity style={styles.navButton} onPress={(() => { handleLeft() })}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navButton} onPress={(() => { handleRight() })}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                {flashNotification && (
                    <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
                        <Text style={flashMessage.innerText}>Pins do not match try again</Text>
                    </Animated.View>
                )}
            </LinearGradient>
        </KeyboardAvoidingView >



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
        marginVertical: 10
        //marginBottom: 20
    },
    infoRow: { paddingTop: 30 },
    infoText: { color: Colors.offWhite, fontFamily: "mon" },
    section: {
        //paddingHorizontal: 20,
    },
    sectionHeader: {
        paddingVertical: 10,
        color: Colors.offWhite,
        fontSize: 16,
        fontFamily: "mon-sb",
    },

    navButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
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
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.transparentWhite,
        //padding: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        flex: 1,
        width: "100%"
    },
    rowLabel: {
        color: "white",
        fontFamily: "mon-sb",
        fontSize: 15
    },
    subHeaderRow: {

    },
    subHeaderText: {
        color: "white",
        fontFamily: "mon",
        fontSize: 16,
        //textAlign: "center"
    },

    navigationButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 20,
        marginTop: 30
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

export default FourthScreen;