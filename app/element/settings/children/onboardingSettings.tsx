import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    SlideInDown,
    SlideInUp,
    FadeInDown,
    ZoomIn,
    ZoomOut,
    FadeOutUp,
} from 'react-native-reanimated';
import * as Updates from 'expo-updates';



const OnBoardingSettings = () => {
    //by default should be true
    const [onboardingComplete, setOnboardingComplete] = useState(true);
    const [flashNotification, setFlashNotification] = useState(false);


    const toggleSwitch1 = () => {
        setOnboardingComplete(!onboardingComplete);
    }

    async function reloadApp() {
        try {
            await Updates.reloadAsync();
        }
        catch (error) {
            console.error(error)
        }
    }

    const handleSave = async () => {
        try {
            await SecureStore.setItemAsync('onboardingComplete', onboardingComplete.toString());
            console.log('settings saved successfully');
        } catch (error) {
            console.error('error saving privacy settings:', error);
        } finally {
            setFlashNotification(true)
            reloadApp();
        }
        
    }

    useEffect(() => {
        const loadSetting = async () => {
            try {
                const storedSetting = await SecureStore.getItemAsync('onboardingComplete');
                if (storedSetting) {
                    const storedSettingAsBoolean = (storedSetting.toLowerCase() === "true");
                    console.log("storedSettingAsBoolean: ", storedSettingAsBoolean)
                    setOnboardingComplete(storedSettingAsBoolean);
                }
            } catch (error) {
                console.error('Error loading name:', error);
            }
        };
        loadSetting();
    }, []);

    return (
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Cloud Sync Settings</Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView >
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Onboarding Process</Text>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Onboarding Complete</Text>
                            <Switch
                                trackColor={{ false: Colors.transparentWhite, true: Colors.primary }}
                                thumbColor={onboardingComplete ? Colors.pink : Colors.primary}
                                ios_backgroundColor={Colors.transparentWhite}
                                onValueChange={toggleSwitch1}
                                value={onboardingComplete}
                            />
                        </View>
                    </View>
                </ScrollView>
                {flashNotification && (
                    <Animated.View entering={FadeInDown.delay(50)} exiting={FadeOutUp.delay(50)} style={flashMessage.container}>
                        <Text style={flashMessage.innerText}>App Restarting...</Text>
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
    },
    infoRow: { paddingTop: 30 },
    infoText: { color: Colors.offWhite, fontFamily: "mon" },
    section: {
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.transparentWhite,
        //padding: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        flex: 1,
        width: "100%",
        marginBottom: 10
    },

    rowLabel: {
        color: "white",
        fontFamily: "mon-sb",
        fontSize: 15
    },
    rowIcon: {
        marginRight: 10
    },
    rowNavigationIcon: {
        flex: 1,
        textAlign: "right"
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
        overflow: "hidden"
    },
    innerText: {
        padding: 20,
        color: "white",
        fontFamily: "mon-b",
        fontSize: 15,

        backgroundColor: Colors.pink,
        borderRadius: 10,
        overflow: "hidden"
    }
})


export default OnBoardingSettings;