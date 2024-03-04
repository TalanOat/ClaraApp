import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { adminDatabaseService } from '@/model/adminDatabaseService'
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { databaseService } from '@/model/databaseService';

const settings = () => {
    const [dropText, setDropText] = useState('');
    const [selectText, setSelectText] = useState('');
    const [tracking1, setTracking1] = useState('');
    const [tracking2, setTracking2] = useState('');
    const [tracking3, setTracking3] = useState('');

    const handleInput1Change = (input: string) => {
        setDropText(input);
    }
    const handleDropSubmit = () => {
        createTwoButtonAlert();
    } 

    const handleDropAllSubmit = () => {
        createDropAllAlert();
    } 

    const handleTrackingSubmit = () => {
        //console.log('values:', tracking1, tracking2, tracking3);
        databaseService.createThreeTrackingValues(tracking1, tracking2, tracking3);
    }
    
    const createTwoButtonAlert = () => {
        Alert.alert('Warning', `Are you sure you want to drop this table: ${dropText}`, [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'OK', onPress: () => {
                    adminDatabaseService.dropTable(dropText)
                }
            },
        ]);
    }
    const createDropAllAlert = () => {
        Alert.alert('Warning', `Are you sure you want to drop all tables`, [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'OK', onPress: () => {
                    adminDatabaseService.dropAllTables();
                }
            },
        ]);
    }


    const handleInput2Change = (input: string) => {
        setSelectText(input);
    }

    const handleSelectSubmit = () => {
        adminDatabaseService.selectAllFromTable(selectText)
    }

    return (
        <View style={styles.settingsContainer}>
            <View style={styles.firstForm}>
                <Text style={styles.header1}>Drop A Table</Text>
                <TextInput
                    onChangeText={handleInput1Change}
                    value={dropText}
                    style={styles.basicInput}>
                </TextInput>
                <TouchableOpacity style={styles.button} onPress={() => { handleDropSubmit() }}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.firstForm}>
                <Text style={styles.header1}>Drop Every Table</Text>
                <TouchableOpacity style={styles.button} onPress={() => { handleDropAllSubmit() }}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.firstForm}>
                <Text style={styles.header1}>SELECT * FROM ...</Text>
                <TextInput
                    onChangeText={handleInput2Change}
                    value={selectText}
                    style={styles.basicInput}>
                </TextInput>
                <TouchableOpacity style={styles.button} onPress={() => { handleSelectSubmit() }}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.firstForm}>
                <Text style={styles.header1}>Change tracking values</Text>
                <TextInput
                    onChangeText={(text) => setTracking1(text)}
                    value={tracking1}
                    style={styles.basicInput}
                    placeholder="Value 1"
                />
                <TextInput
                    onChangeText={(text) => setTracking2(text)}
                    value={tracking2}
                    style={styles.basicInput}
                    placeholder="Value 2"
                />
                <TextInput
                    onChangeText={(text) => setTracking3(text)}
                    value={tracking3}
                    style={styles.basicInput}
                    placeholder="Value 3"
                />
                <TouchableOpacity style={styles.button} onPress={() => handleTrackingSubmit()}>
                    <Text>Confirm</Text>
                </TouchableOpacity>
            </View>

        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1

    },
    basicInput: {
        backgroundColor: "grey",
        width: 200
    },
    firstForm: {
        padding: 10,
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    settingsContainer: {
        backgroundColor: Colors.pink,
        flex: 1
    },
    header1: {
        fontSize: 20
    },
    button: {
        backgroundColor: Colors.offWhite,
        padding: 10
    }


})


export default settings