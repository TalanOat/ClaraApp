import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';

import { useState } from 'react';

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

    const [trackingValue1, setTrackingValue1] = useState('');
    const [trackingValue2, setTrackingValue2] = useState('');
    const [trackingValue3, setTrackingValue3] = useState('');

    const onTextChanged1 = (itemValue: string) => {
        setTrackingValue1(itemValue)
    }

    const onTextChanged2 = (itemValue: string) => {
        setTrackingValue2(itemValue)
    }

    const onTextChanged3 = (itemValue: string) => {
        setTrackingValue3(itemValue)
    }

    return (
        <LinearGradient
            style={styles.container}
            colors={["#20115B", "#C876FF"]}>
            <View style={styles.mainHeaderContainer}>
                <Text style={styles.titleHeader}>Tracking Values</Text>
            </View>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>First Tracking Value</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.trackingInput}
                            onChangeText={onTextChanged1}
                            value={trackingValue1}
                        />
                        <TouchableOpacity style={styles.saveButton}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>First Tracking Value</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.trackingInput}
                            onChangeText={onTextChanged2}
                            value={trackingValue2}
                        />
                        <TouchableOpacity style={styles.saveButton}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>First Tracking Value</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.trackingInput}
                            onChangeText={onTextChanged3}
                            value={trackingValue3}
                        />
                        <TouchableOpacity style={styles.saveButton}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        padding: 20,
        paddingHorizontal: 20,

    },
    mainHeaderContainer: {
        marginTop: 20
    },
    header1: {
        color: "white",
        fontSize: 16,
        fontFamily: "mon-sb",
        textAlign: "center"
    },
    titleHeader: {
        color: "white",
        fontSize: 22,
        fontFamily: "mon-b",
        marginBottom: 20
    },
    section: {
        //paddingHorizontal: 20,
    },
    sectionHeader: {
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
    saveButton: {
        backgroundColor: Colors.pink,
        padding: 15,
        borderRadius: 10,
        height: 50,
        alignContent: "center",
        justifyContent: "center"
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-b",
        fontSize: 12
    },


})

export default TrackingValuesSettings;