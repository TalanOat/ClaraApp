import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';

import { useEffect, useRef, useState } from 'react';
import { databaseService } from '@/model/databaseService';

const trackingValuesList = [
    { label: "Happiness", value: "Happiness" },
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

const TrackingValuesSettings = () => {

    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    const [input3, setInput3] = useState('');

    const [focusedInput, setFocusedInput] = useState("");

    const onTextChanged1 = (itemValue: string) => {
        setInput1(itemValue)
    }

    const onTextChanged2 = (itemValue: string) => {
        setInput2(itemValue)
    }

    const onTextChanged3 = (itemValue: string) => {
        setInput3(itemValue)
    }

    const fetchTrackingValues = async () => {
        try {
            const returnedValues = await databaseService.getLastThreeTrackingNames();
            if (returnedValues) {
                setInput1(returnedValues[2].name)
                setInput2(returnedValues[1].name)
                setInput3(returnedValues[0].name)
            }
        } catch (error) {
            console.error("error getting values:", error);
        }
    };

    const handleSuggestedPressed = (suggested: string) => {
        switch (focusedInput) {
            case "input1": {
                setInput1(suggested);
                break;
            }
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
        const success = await databaseService.createThreeTrackingNames(input1, input2, input3)
        if(success){
            console.log("successfully added tracking values")
        }
    }

    useEffect(() => {
        fetchTrackingValues();
    },[])

    return (

        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={["#20115B", "#C876FF"]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>Mood Log Values</Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    keyboardShouldPersistTaps={'always'} >

                    <View style={styles.section}>
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
                        <Text style={styles.sectionHeaderLocked}>First Value</Text>
                        <View style={styles.inputRow} pointerEvents='none'>
                            <TextInput
                                style={styles.trackingInputLocked}
                                onChangeText={onTextChanged1}
                                value={input1}
                                
                                onFocus={() => setFocusedInput('input1')}
                                onBlur={() => setFocusedInput('')}
                            />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Second Value</Text>
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
                        <Text style={styles.sectionHeader}>Third Value</Text>
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



})

export default TrackingValuesSettings;