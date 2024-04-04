import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import { Link, useNavigation } from 'expo-router'
import Colors from '@/constants/Colors'
import moment from 'moment'

const SmallerHeader = () => {
    const navigation = useNavigation();

    //const currentDate = moment(new Date())
    return (
        <View style={styles.headerContainer}>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" color="white" size={35} />
                </TouchableOpacity>
                <View style={styles.dateRow}>
                    <Text style={styles.day}>{moment().format('dddd')}</Text>
                    <Text style={styles.date}>{moment().format('Do MMM')}</Text>
                </View>
                <Link href={'/element/settings/settingsMenu'} asChild style={styles.touchAreaButton}>
                    <TouchableOpacity >
                        <MaterialCommunityIcons name='cog'
                            color={"white"}
                            size={35}
                            style={styles.settingsButton}>
                        </MaterialCommunityIcons>
                    </TouchableOpacity>
                </Link>
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
        justifyContent: "space-evenly",
        
    },
    dateRow: {
        backgroundColor: Colors.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1,
        gap: 10,
        padding: 15,

    },
    day: {
        fontSize: 24,
        color: "white",
        fontFamily: 'mon-b',
    },
    date: {
        fontSize: 20,
        color: "grey",
        fontFamily: 'mon-b',
    },
    touchAreaButton: {
        alignItems: "center",
        justifyContent: "center",
        
    },
    settingsButton: {

    },
    backButton: {}
})


export default SmallerHeader
