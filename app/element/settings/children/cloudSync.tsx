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
} from 'react-native-reanimated';


const CloudSync = () => {
    //by default should be true
    const [mapIsEnabled, setMapIsEnabled] = useState(true);
    const [weatherIsEnabled, setWeatherIsEnabled] = useState(true);

    const toggleSwitch1 = () => {
        setMapIsEnabled(!mapIsEnabled);
    }

    const handleSave = async () => {
        try {
            //await SecureStore.setItemAsync('mapsEnabled', mapIsEnabled.toString());
            //await SecureStore.setItemAsync('weatherEnabled', weatherIsEnabled.toString());
            console.log('settings saved successfully');
        } catch (error) {
            console.error('error saving privacy settings:', error);
        }
    }

    useEffect(() => {
        const loadName = async () => {
            try {
                const storedMaps = await SecureStore.getItemAsync('mapsEnabled');
                const storedWeather = await SecureStore.getItemAsync('weatherEnabled');

                if (storedMaps) {
                    const storedMapsAsBoolean = (storedMaps.toLowerCase() === "true");
                    setMapIsEnabled(storedMapsAsBoolean);
                }
                if (storedWeather) {
                    const storedWeatherAsBoolean = (storedWeather.toLowerCase() === "true");
                    setWeatherIsEnabled(storedWeatherAsBoolean);
                }
            } catch (error) {
                console.error('Error loading name:', error);
            }
        };
        //loadName();
    }, []);

    return (
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={["#20115B", "#C876FF"]}>
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
                        <Text style={styles.sectionHeader}>Cloud Save</Text>
                        <TouchableOpacity style={styles.row}>
                            <MaterialCommunityIcons color="#fff" name='cloud-check' size={25} style={styles.rowIcon} />
                            <Text style={styles.rowLabel}>Sync using Google Firebase</Text>
                            <MaterialCommunityIcons name="chevron-right" size={25} color="gray" style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                        <View style={styles.row}>
                            <Text style={styles.rowLabel}>Autosave</Text>
                            <Switch
                                trackColor={{ false: Colors.transparentWhite, true: Colors.primary }}
                                thumbColor={mapIsEnabled ? Colors.pink : Colors.primary}
                                ios_backgroundColor={Colors.transparentWhite}
                                onValueChange={toggleSwitch1}
                                value={mapIsEnabled}
                            />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>This app does not directly collect any personal information from you.
                                However, this app utilizes third-party map services to provide functionality.
                                These third-party services may collect location data or other information as outlined in their own privacy policies.
                                We recommend reviewing the privacy policies of any third-party services used within the app for more information.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
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


export default CloudSync;