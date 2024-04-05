import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';

const FirstScreen = () => {

    return (
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" keyboardVerticalOffset={40}>
            <LinearGradient
                style={styles.container}
                colors={["#20115B", "#C876FF"]}>
                <View style={styles.introContainer}>
                    <View style={styles.headerRow}>
                        <View style={styles.mainHeaderContainer}>
                            <Text style={styles.titleHeader}>Hi, there!</Text>
                            <MaterialCommunityIcons name="hand-wave" size={30} color="white" />
                        </View>
                    </View>
                    <View style={styles.subHeaderRow}>
                        <Text style={styles.subHeaderText1}>Thanks for downloading this app!</Text>
                        <Text style={styles.subHeaderText}>You will need to set up a few things first. All the following settings can be updated later in the settings menu.</Text>
                    </View>
                    <View style={styles.headerRow}>
                        <Link href="/element/introScreens/secondScreen" asChild>
                            <TouchableOpacity style={styles.saveButton}>
                                <Text style={styles.buttonText}>Get Started</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
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
    introContainer: {
        flex: 1,
        //marginTop: 50,
        justifyContent: "center",

        alignItems: "center",
        gap: 20
    },
    mainHeaderContainer: {
        marginTop: 0,
        flexDirection: "row",
        gap: 20

    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        //marginBottom: 20
    },
    titleHeader: {
        color: "white",
        fontSize: 22,
        fontFamily: "mon-b",
        //marginBottom: 20
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

    subHeaderRow: {

    },
    subHeaderText: {
        color: "white",
        fontFamily: "mon",
        fontSize: 16,
        textAlign: "center"
    },
    subHeaderText1: {
        color: "white",
        fontFamily: "mon",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 10
    }
})

export default FirstScreen;