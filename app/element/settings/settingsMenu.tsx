import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native'
import React, { useContext, useState } from 'react'
import { adminDatabaseService } from '@/model/adminDatabaseService'
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { databaseService } from '@/model/databaseService';
import { DetectionContext } from '@/components/contexts/detectionContext';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    SlideInDown,
    SlideInUp,
    FadeInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Link, useNavigation } from 'expo-router';

const settings = () => {
    return (
        <LinearGradient
            style={styles.container}
            colors={["#20115B", "#C876FF"]}>

            <View style={styles.mainHeaderContainer}>
                <Text style={styles.titleHeader}>Settings</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>      
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Preferences</Text>
                    <Link href={'/element/settings/children/userDetails'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='human-greeting' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>User Details</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/element/settings/children/trackingValues'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>
                            <MaterialCommunityIcons color="#fff" name='emoticon-happy' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Mood Log Values</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/element/settings/children/trackingValues'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>
                            <MaterialCommunityIcons color="#fff" name='page-previous' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Journal Templates</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/element/settings/children/notificationSettings'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>
                            <MaterialCommunityIcons color="#fff" name='notification-clear-all' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Notifications</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Privacy</Text>
                    <Link href={'/element/settings/children/thirdParty'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='map-check' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Third Party Settings</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                </View>    
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Backup Data</Text>
                    <Link href={'/element/settings/children/cloudSync'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='cloud-check' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Sync Data to the cloud</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                </View>    
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Apperance</Text>
                    <Link href={'/element/settings/children/userDetails'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='cog' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Theme</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                </View>   
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Accesibility</Text>
                    <Link href={'/element/settings/children/userDetails'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='cog' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Theme</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                </View>   
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Help & Feedback</Text>
                    <Link href={'/element/settings/children/userDetails'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='cog' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Guides</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                    <Link href={'/element/settings/children/userDetails'} style={styles.sectionLink} asChild>
                        <TouchableOpacity style={styles.row}>

                            <MaterialCommunityIcons color="#fff" name='cog' size={25} style={styles.rowIcon} />

                            <Text style={styles.rowLabel}>Feedback Hub</Text>

                            <MaterialCommunityIcons name="chevron-right" size={25} color={Colors.offWhite} style={styles.rowNavigationIcon} />
                        </TouchableOpacity>
                    </Link>
                </View>   
            </ScrollView>
        </LinearGradient>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
        //padding: 20,
        paddingHorizontal: 20,

    },
    mainHeaderContainer: {
        //marginTop: 20
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
        color: Colors.offWhite,
        fontSize: 16,
        fontFamily: "mon-sb",
    },
    rowIcon: {
        marginRight: 10
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.transparentWhite,
        //padding: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        flex: 1,
        width: "100%"
        //height: 45
    },
    rowLabel: {
        color: "white",
        fontFamily: "mon-sb",
        fontSize: 15
    },
    rowNavigationIcon: {
        flex: 1,
        textAlign: "right"
    },
    sectionLink: {
        marginBottom: 10
    }


})


export default settings