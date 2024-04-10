import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

import * as Updates from 'expo-updates';
import * as SecureStore from 'expo-secure-store';

import Animated, {
    FadeInDown,
    FadeOutUp,
    SlideInDown,

} from 'react-native-reanimated';


const ThemeSettings = () => {
    const [purpleTheme, setPurpleTheme] = useState<boolean>(true);
    const [orangeTheme, setOrangeTheme] = useState<boolean>(true);
    const [activeTheme, setActiveTheme] = useState('purple');
    const [flashNotification, setFlashNotification] = useState(false);

    const toggleSwitch1 = () => {
        setPurpleTheme(!purpleTheme);
        setActiveTheme('purple');
    }

    const toggleSwitch2 = () => {
        setOrangeTheme(!orangeTheme);
        setActiveTheme('orange');
    }

    async function reloadApp() {
        try {
            await Updates.reloadAsync();
        }
        catch (error) {
            console.error(error)
        }
    }

    const handleThemeChange = async (theme: string) => {
        try {
            await SecureStore.setItemAsync('theme', theme);
            console.log('theme saved successfully');

        } catch (error) {
            console.error('Error saving name:', error);
        }
    }

    const handleSave = () => {
        console.log("activeTheme: ", activeTheme)
        handleThemeChange(activeTheme).then(() => {
            setFlashNotification(true)
            reloadApp();
        })

    }

    const loadTheme = async () => {
        try {
            const storedName = await SecureStore.getItemAsync('theme');
            if (storedName) {
                console.log("storedName: ", storedName)
                setActiveTheme(storedName);
            }
        } catch (error) {
            console.error('Error loading name:', error);
        }
    };

    useEffect(() => {
        loadTheme();
        //handleTestThemeChange();
    }, []);



    return (

        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Theme Settings </Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView >
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Purple Sunrise Theme (default)</Text>
                        <View style={styles.switchRow}>
                            <Text style={styles.rowLabel}>Theme Enabled</Text>
                            <Switch
                                trackColor={{ false: Colors.transparentWhite, true: Colors.primary }}
                                thumbColor={activeTheme === 'purple' ? Colors.pink : Colors.primary}
                                ios_backgroundColor={Colors.transparentWhite}
                                onValueChange={toggleSwitch1}
                                value={activeTheme === 'purple'}
                            />

                        </View>

                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Orange Sunset Theme</Text>
                        <View style={styles.switchRow}>
                            <Text style={styles.rowLabel}>Theme Enabled</Text>
                            <Switch
                                trackColor={{ false: Colors.transparentWhite, true: Colors.primary }}
                                thumbColor={activeTheme === 'orange' ? Colors.pink : Colors.primary}
                                ios_backgroundColor={Colors.transparentWhite}
                                onValueChange={toggleSwitch2}
                                value={activeTheme === 'orange'}
                            />

                        </View>

                    </View>


                </ScrollView>
            </LinearGradient>
            {flashNotification && (
                <Animated.View entering={FadeInDown.delay(50)} exiting={FadeOutUp.delay(50)} style={flashMessage.container}>
                    <Text style={flashMessage.innerText}>App Restarting...</Text>
                </Animated.View>
            )}
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
    rowLabel: {
        color: "white",
        fontFamily: "mon-sb",
        fontSize: 15
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

export default ThemeSettings;