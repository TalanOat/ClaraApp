import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Link, useNavigation, Stack } from 'expo-router'
import Colors from '@/constants/Colors'

const ExpandedHeader = () => {

    return (
        <View style={styles.container}>
            <View style={styles.actionRow}>
                <View style={styles.dateRow}>
                    <Text style={styles.day}>Sunday</Text>
                    <Text style={styles.date}>4th Feb</Text>
                </View>
                <Link href={'/element/settings'} asChild style={styles.touchAreaButton}>
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
    container: {
        backgroundColor: Colors.primary,
        height: 120,
        justifyContent: "center"
    },
    actionRow: {
        flexDirection: 'row',
        paddingLeft: 10,
        paddingRight: 10,
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
        paddingRight: 10,
    },
    settingsButton: {

    }
})


export default ExpandedHeader
