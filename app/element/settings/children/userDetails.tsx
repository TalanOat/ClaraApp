import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useEffect, useState } from 'react';

import * as SecureStore from 'expo-secure-store';


const UserDetailsSettings = () => {

    const [nameInput, setNameInput] = useState('');

    const onNameChanged = (name: string) => {
        setNameInput(name)
    }

    const handleSave = async () => {
        try {
            await SecureStore.setItemAsync('userName', nameInput);
            console.log('Name saved successfully');
        } catch (error) {
            console.error('Error saving name:', error);
        }
    }

    useEffect(() => {
        const loadName = async () => {
            try {
                const storedName = await SecureStore.getItemAsync('userName');
                if (storedName) {
                    setNameInput(storedName);
                }
            } catch (error) {
                console.error('Error loading name:', error);
            }
        };
    
        loadName();
    }, []); 

    return (

        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled keyboardVerticalOffset={100}>
            <LinearGradient
                style={styles.container}
                colors={["#20115B", "#C876FF"]}>
                <View style={styles.headerRow}>
                    <View style={styles.mainHeaderContainer}>
                        <Text style={styles.titleHeader}>User Details </Text>
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView >
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>First Name</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.trackingInput}
                                onChangeText={onNameChanged}
                                value={nameInput}
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



})

export default UserDetailsSettings;