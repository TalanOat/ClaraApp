import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

import * as SecureStore from 'expo-secure-store';


const NotificationSettings = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const toggleSwitch1 = () => {
        setNotificationsEnabled(!notificationsEnabled);
    }

    const handleSave = async () => {
        try {
            await SecureStore.setItemAsync('notificationsEnabled', notificationsEnabled.toString());
            console.log('settings saved successfully');

        } catch (error) {
            console.error('error saving privacy settings:', error);
        }
    }

    useEffect(() => {
        const loadSetting = async () => {
            try {
                const storedSetting = await SecureStore.getItemAsync('notificationsEnabled');

                if (storedSetting) {
                    const storedSettingAsBoolean = (storedSetting.toLowerCase() === "true"); 
                    setNotificationsEnabled(storedSettingAsBoolean);
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
                colors={["#20115B", "#C876FF"]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Notifications & Journal Reminders </Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView >
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Notifications</Text>
                        <View style={styles.switchRow}>
                            <Text style={styles.rowLabel}>App Notifications</Text>
                            <Switch
                                trackColor={{ false: Colors.transparentWhite, true: Colors.primary }}
                                thumbColor={notificationsEnabled ? Colors.pink : Colors.primary}
                                ios_backgroundColor={Colors.transparentWhite}
                                onValueChange={toggleSwitch1}
                                value={notificationsEnabled}
                            />
                        </View>
                    </View>
                </ScrollView>
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
        //marginBottom: 20
    },
    infoRow: { paddingTop: 30},
    infoText: { color:Colors.offWhite, fontFamily: "mon"},
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
    }



})

export default NotificationSettings;