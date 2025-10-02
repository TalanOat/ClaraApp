import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigation } from 'expo-router'
import Colors from '@/constants/Colors'
import moment from 'moment'
import { DateContext } from './contexts/dateProvider'

const SmallerHeader = () => {
    const navigation = useNavigation();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { headerDate, setHeaderDate } = useContext(DateContext);
  
    const [date, setDate] = useState(headerDate.date);
  
    useEffect(() => {
      // update the state if headerDate changes
      setDate(headerDate.date);
    }, [headerDate]);

    const formatDate = (date: Date) => moment(date).format("dddd, Do MMM");


    //const currentDate = moment(new Date())
    return (
        <View style={styles.headerContainer}>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" color="white" size={35} />
                </TouchableOpacity>
                <View style={styles.dateRow}>
                    <Text style={styles.day}>{formatDate(date).split(',')[0]}</Text>
                    <Text style={styles.date}>{formatDate(date).split(',')[1]}</Text>
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
        color: Colors.offWhite,
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
