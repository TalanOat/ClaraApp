import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { adminDatabaseService } from '@/model/adminDatabaseService'
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

const settings = () => {
    const [dropText, setDropText] = useState('');
    const [selectText, setSelectText] = useState('');

    const handleInput1Change = (input: string) => {
        setDropText(input);
    }
    const handleDropSubmit = () => {
        createTwoButtonAlert();
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