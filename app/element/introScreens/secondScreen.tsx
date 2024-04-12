import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';

import { useEffect, useRef, useState } from 'react';
import { databaseService } from '@/model/databaseService';

const trackingValuesList = [
    { label: "Energy", value: "Energy" },
    { label: "Stress", value: "Stress" },
    { label: "Anxiety", value: "Anxiety" },
    { label: "Social Life", value: "Social Life" },
    { label: "Productivity", value: "Productivity" },
    { label: "Health", value: "Health" },
    { label: "Weight", value: "Weight" },
    { label: "Competency", value: "Competency" },
    { label: "Exercise", value: "Exercise" },
    { label: "Work Balance", value: "Work Balance" },
    { label: "Creativity", value: "Creativity" },
    { label: "Depression", value: "Depression" },
    { label: "Body Image", value: "Body Image" },
];



const SecondScreen = () => {
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');

    const [focusedInput, setFocusedInput] = useState("");


    const onTextChanged2 = (itemValue: string) => {
        setInput2(itemValue)
    }

    const onTextChanged3 = (itemValue: string) => {
        setInput3(itemValue)
    }

    const fetchTrackingValues = async () => {

        setInput2(trackingValuesList[1].value)
        setInput3(trackingValuesList[4].value)

    };

    const handleSuggestedPressed = (suggested: string) => {
        switch (focusedInput) {
            case "input2": {
                setInput2(suggested);
                break;
            }
            case "input3": {
                setInput3(suggested);
                break;
            }
            default: {
                //do nothing
                break;
            }
        }
    }

    const handleSave = async () => {
        const success = await databaseService.createThreeTrackingNames("Happiness", input2, input3)
        if(success){
           console.log("successfully added tracking values")
        }
        router.push("/element/introScreens/thirdScreen")
    }

    useEffect(() => {
        fetchTrackingValues();
    }, [])

    return (

        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" keyboardVerticalOffset={40}>
            <LinearGradient
                style={styles.container}
                colors={[Colors.primary, Colors.pink]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Mood Log Values</Text>
                    </View>

                </View>
                <View style={styles.subHeaderRow}>
                    <Text style={styles.subHeaderText}>Which values would you like to track in your mood journal?</Text>
                </View>

                <ScrollView
                    keyboardShouldPersistTaps={'always'}>

                    <View style={styles.suggestionRow}>
                        <Text style={styles.sectionHeader}>Suggested Values:</Text>
                        <View style={styles.suggestedContainer}>
                            {trackingValuesList.map((value, index) => (
                                <TouchableOpacity key={index}
                                    style={styles.suggestedItem}
                                    onPress={(event) => {
                                        event.preventDefault();
                                        handleSuggestedPressed(value.value)
                                    }}
                                >
                                    <Text style={styles.suggestedItemText}>{value.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>First Value</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                onChangeText={onTextChanged2}
                                value={input2}
                                onFocus={() => setFocusedInput('input2')}
                                onBlur={() => setFocusedInput('')}
                            />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Second Value</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                onChangeText={onTextChanged3}
                                value={input3}
                                onFocus={() => setFocusedInput('input3')}
                                onBlur={() => setFocusedInput('')}
                            />
                        </View>
                    </View>
                    <View style={styles.navigationButtons}>
                        <TouchableOpacity style={styles.saveButtonLocked} onPress={(() => { handleSave() })}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>

            </LinearGradient>
        </KeyboardAvoidingView>



    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //width: "100%",
        //height: "100%",
        padding: 20,
        paddingHorizontal: 20,

    },
    suggestionRow: {
        marginTop: 20,
        marginBottom: 20,
    },
    mainHeaderContainer: {
        marginTop: 0,

    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },
    titleHeader: {
        color: "white",
        fontSize: 24,
        fontFamily: "mon-b",
        marginVertical: 10
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
    sectionHeaderLocked: {
        paddingVertical: 10,
        color: "gray",
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
    trackingInputLocked: {
        flex: 1,
        width: "100%",
        backgroundColor: Colors.transparentWhite,
        padding: 15,
        borderRadius: 10,
        height: 50,
        fontSize: 16,
        color: "gray"
    },
    saveButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
    },
    saveButtonLocked: {
        backgroundColor: Colors.transparentWhite,
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

export default SecondScreen;