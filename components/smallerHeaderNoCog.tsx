import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import { Link, useNavigation } from 'expo-router'
import Colors from '@/constants/Colors'

const SmallerHeaderNoCog = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.headerContainer}>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" color="white" size={35} />
                </TouchableOpacity>

            </View>

        </View>
    )
}


const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: Colors.primary,
        justifyContent: "center",
        height: 80
    },
    actionRow: {
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: "center",
        justifyContent: "flex-start",
        
    },
    settingsButton: {

    },
    backButton: {}
})


export default SmallerHeaderNoCog
