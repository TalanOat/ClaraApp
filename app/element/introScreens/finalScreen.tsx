import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';

const FinalScreen = () => {

    const tutorialImage = "./../../../assets/images/plus-tutorial.png"

    const handleFinish = async () => {
        try {
            await SecureStore.setItemAsync('onboardingComplete', "true");
            console.log('settings saved successfully');
        } catch (error) {
            console.error('error saving privacy settings:', error);
        }
        finally{
            router.push('/(tabs)/')
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" keyboardVerticalOffset={40}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.introContainer}>
                    <View style={styles.headerRow}>
                        <View style={styles.mainHeaderContainer}>
                            <Text style={styles.titleHeader}>All Done</Text>
                            <MaterialCommunityIcons name="check-circle" size={30} color="white" />
                        </View>
                    </View>
                    <View style={styles.subHeaderRow}>
                        <Text style={styles.subHeaderText1}>Getting Started</Text>
                        <Text style={styles.subHeaderText}>Press the plus button on the next screen to start journalling.</Text>
                        <View style={styles.imageContainer}>
                            <Image style={styles.tutorialImage}
                                source={require(tutorialImage)}
                                contentFit="cover"
                                transition={1000}
                            />
                        </View>

                    </View>

                    <View style={styles.headerRow}>

                        <TouchableOpacity style={styles.saveButton} onPress={(() => {handleFinish()})}>
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>

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
    },
    tutorialImage: {
        width: 330,
        height: 100,
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20
    }
})

export default FinalScreen;