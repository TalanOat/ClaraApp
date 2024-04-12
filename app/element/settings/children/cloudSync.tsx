import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard, Switch, ActivityIndicator } from 'react-native';
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



import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import * as DocumentPicker from 'expo-document-picker';
import { databaseService } from '@/model/databaseService';
import * as Updates from 'expo-updates';

const CloudSync = () => {
    //by default should be true
    const [loading, setLoading] = useState(false)
    const [flashNotification, setFlashNotification] = useState(false);


    //const [db, setDb] = useState(SQLite.openDatabase('journal.db'));

    const handleExportPressed = async () => {
        await Sharing.shareAsync(FileSystem.documentDirectory + 'SQLite/journal.db');
    }

    const handleImportPressed = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true
        });
        if (!result.canceled && result.assets[0].name === "journal.db") {
            const base64 = await FileSystem.readAsStringAsync(
                result.assets[0].uri,
                {
                    encoding: FileSystem.EncodingType.Base64
                }
            )

            await FileSystem.writeAsStringAsync(FileSystem.documentDirectory +
                'SQLite/journal.db', base64, { encoding: FileSystem.EncodingType.Base64 })

            await databaseService.closeDB();

            setFlashNotification(true)
            reloadApp()

        }
    }

    async function reloadApp() {
        try {
            await Updates.reloadAsync();
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Import/Export Your Data</Text>
                    </View>
                </View>
                <ScrollView >
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Export Data</Text>
                        <TouchableOpacity style={styles.row} onPress={(() => { handleExportPressed() })}>
                            <MaterialCommunityIcons color="#fff" name='cloud-check' size={25} style={styles.rowIcon} />
                            <Text style={styles.rowLabel}>Export Your Data</Text>
                            <MaterialCommunityIcons name="chevron-right" size={25} color="gray" style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Import Data</Text>
                        <TouchableOpacity style={styles.row} onPress={(() => { handleImportPressed() })}>
                            <MaterialCommunityIcons color="#fff" name='cloud-check' size={25} style={styles.rowIcon} />
                            <Text style={styles.rowLabel}>Import Your Data</Text>
                            <MaterialCommunityIcons name="chevron-right" size={25} color="gray" style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
            {loading && (
                <Animated.View style={styles.loadingPopup} entering={ZoomIn.delay(200)} exiting={SlideInUp.delay(100)}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                </Animated.View>
            )}
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

    loadingPopup: {
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center'
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

export default CloudSync;