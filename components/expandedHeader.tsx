import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigation, Stack } from 'expo-router'
import Colors from '@/constants/Colors'

import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

import Animated, {
    ZoomIn,
} from 'react-native-reanimated';


import { DateContext } from './contexts/dateProvider'




const ExpandedHeader = () => {
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    //Date Context set
    const { headerDate, setHeaderDate } = useContext(DateContext)

    useEffect(() => {
        // if (Platform.OS === "ios") {
             //setShowDatePicker(true);
        // }
    }, []);

    const toggleDatePicker = () => {
        if (Platform.OS !== "ios") {
            setShowDatePicker(!showDatePicker)
        }
    }

    var times = 0;

    const handleDateChange = (event: any, selectedDate: Date | undefined) => {
        const currentDate = selectedDate || date;
        if(currentDate !== headerDate.date) {
            setDate(currentDate);
            setHeaderDate({
                date: currentDate
            })
            //console.log("currentDate : ", currentDate, "headerDate.date: ", headerDate.date)
        }
        toggleDatePicker();


    };

    const formatDate = (date: Date) => moment(date).format("dddd, Do MMM");

    

    return (
        <View style={styles.container}>
            <View style={styles.actionRow}>
                {formatDate && Platform.OS === "ios" && (
                    <View style={styles.dateRow}>
                        <Text style={styles.day}>{formatDate(date).split(',')[0]}</Text>
                        <DateTimePicker
                            value={date}
                            mode="date"
                            onChange={handleDateChange}
                            display={"calendar"}
                            style={styles.iosDatePicker}
                        />

                    </View>
                )}
                {formatDate && Platform.OS === "android" && (
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateRow}>
                        <Text style={styles.day}>{formatDate(date).split(',')[0]}</Text>
                        <Text style={styles.date}>{formatDate(date).split(',')[1]}</Text>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                onChange={handleDateChange}
                                display="calendar"
                            />
                        )}
                    </TouchableOpacity>
                )}
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
    container: {
        backgroundColor: Colors.primary,
        height: 90,
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
        gap: 5,
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

    },
    iosDatePicker: {
        margin: 0
    }
})


export default ExpandedHeader
