import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import JournalThemesComponent from '@/components/helpers/statsHelpers/themesComponent';
import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import Colors from '@/constants/Colors'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { databaseService } from '@/model/databaseService';
import { decryptString, loadSettingFromStorage, semanticAnalyiseEncryptedJournal, semanticAnalyiseJournal, semanticAnalysis } from './reusable/journalHelper';
import moment from 'moment';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { JournalsContext } from '@/components/contexts/journalProvider';
import MultipleJournalThemesComponent from './statsHelpers/multipleThemesComponent';
import CryptoJS from "react-native-crypto-js";
import * as SecureStore from 'expo-secure-store';
import ProgressBarWithColor from '../progressBarWithColor';
import ProgressBar from '../progressBar';

interface UserElement {
    id: string;
    type: 'journal' | 'mood' | 'goal';
    date: string;
    body?: string;
    trackingName1?: string,
    trackingValue1?: number,
};

interface ClusterJournalEntry {
    id: number;
    type: string;
    clusterCoords: number[];
}

interface ClusterPromptProps {
    onVisibilityChanged: (visible: boolean) => void;
    data: ClusterJournalEntry[]; // Add this line
}

interface Coordinate {
    latitude: number,
    longitude: number
}

interface State {
    userJournals: UserElement[];
    userMoodJournals: UserElement[];
    generalPlaceName: string;
    overallScore: number;
    isLoading: boolean;
    isDataLoaded: boolean;
}

const ClusterPrompt = ({ onVisibilityChanged, data }: ClusterPromptProps) => {
    const [state, setState] = useState<State>({
        userJournals: [],
        userMoodJournals: [],
        generalPlaceName: "",
        overallScore: 0,
        isLoading: false,
        isDataLoaded: false,
    });
    //const [userPin, setUserPin] = useState('');
    const initialRender = useRef(true);
    const MAPBOX_TOKEN = 'pk.eyJ1IjoidGFsYW5vIiwiYSI6ImNsd3A2M2xobjA5dWsyanFkNGE3aTc1NHYifQ.nKdkgfYCKT_zNUoGhDMhCQ';
    const { journals } = useContext(JournalsContext);

    const handleCloseNotification = () => {
        onVisibilityChanged(false);
    }

    const loadPinSettings = async () => {
        try {
            const storedPin = await SecureStore.getItemAsync('userPin');
            if (storedPin) {
                return (storedPin);
            }
        } catch (error) {
            console.error('Error loading name:', error);
        }
    };

    const decryptString = (encryptedText: string, userPin: string) => {
        const bytes = CryptoJS.AES.decrypt(encryptedText, userPin);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
    }

    const fetchAllJournalEntries = async (journalIds: number[]): Promise<UserElement[]> => {
        try {
            const entries = await databaseService.getJournalEntriesByID(journalIds);
            let userPin = await loadPinSettings();
            let journalEntries: UserElement[] = [];
            for (let entry of entries) {
                if (entry && entry.body !== undefined && userPin) {
                    //console.log("----------------entry.body: ", entry.body)

                    const decryptedBody = await decryptString(entry.body, userPin);
                    //console.log(decryptedBody);

                    if (decryptedBody) {
                        const formattedDate = moment(entry.createdAt).format('DD/MM/YY');

                        const returnElement: UserElement = ({
                            id: entry.id,
                            type: 'journal',
                            body: decryptedBody,
                            date: formattedDate
                        });
                        journalEntries.push(returnElement);
                    } 
                }
            }
            return journalEntries;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    function isValidUTF8(str: string) {
        try {
            decodeURIComponent(escape(str));
            return true;
        } catch (err) {
            return false;
        }
    }

    const fetchAllMoodJournalEntries = async (moodIds: number[]): Promise<UserElement[]> => {
        try {
            const entries = await databaseService.getMoodJournalsByID(moodIds);
            const journalEntries: UserElement[] = [];
            for (const entry of entries) {
                if (entry) {
                    const formattedDate = moment(entry.createdAt).format('DD/MM/YY');
                    const returnElement: UserElement = ({
                        id: entry.id,
                        type: 'mood',
                        date: formattedDate,
                        trackingValue1: entry.tracking_value1
                    });
                    journalEntries.push(returnElement);

                }
            }
            return journalEntries;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    const getNearestPOI = async (point: Coordinate) => {
        const lat = point.latitude;
        const lon = point.longitude;

        // console log the lat and lon
        //console.log(`Lat: ${lat}, Lon: ${lon}`);

        // fetch the reverse geocoded location data
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&types=poi`);
        const data = await response.json();

        // list of keywords to avoid
        const blacklistStrings = ['school', 'hospital', 'prison', 'police', 'fire station'];

        // check if the location type is in the avoid list
        if (data.features[0].place_type) {
            const placeName = data.features[0].place_name.split(',').slice(0, 2).join(',');
            const shouldAvoid = blacklistStrings.some(keyword => placeName.toLowerCase().includes(keyword));

            if (!shouldAvoid) {
                return placeName;
            }
        }

        return null;
    }

    const calculateSemanticScoreForJournals = async (inputJournals: UserElement[]) => {
        let semanticArray = [];
        for (let journal of inputJournals) {

            if (journal.body) {
                let journalSemanticScore = await semanticAnalyiseJournal(journal.body);

                if (journalSemanticScore !== 0) {
                    journalSemanticScore = Math.round(((journalSemanticScore + 5) / 10) * 100);

                    if (journalSemanticScore !== 0) {
                        semanticArray.push(journalSemanticScore);
                    }
                }
            }
        }

        return semanticArray;
    }

    const calculateSemanticScoreForMoodJournals = async (moodJournals: UserElement[]) => {
        let semanticArray = [];
        //console.log("moodJournals: ", moodJournals)
        for (let moodJournal of moodJournals) {
            semanticArray.push(moodJournal.trackingValue1);
        }

        return semanticArray;
    }


    const fetchData = async () => {
        setState(prevState => ({ ...prevState, isLoading: true }));
        if (data.length !== 0) {
            const point: Coordinate = {
                latitude: (data[0].clusterCoords)[1],
                longitude: (data[0].clusterCoords)[0]
            };
            try {
                const placeName = await getNearestPOI(point);
                const shortenedName = placeName.split(',').slice(0, 1).join(',');
                setState(prevState => ({ ...prevState, generalPlaceName: shortenedName }));
            } catch (error) {
                console.error("error getting nearest POI: ", error);
            }
        }

        const fetchEntries = async (type: string, fetchFunction: Function) => {
            const ids = data.filter(item => item.type === type).map(item => item.id);
            try {
                const fetchedEntries = await fetchFunction(ids);
                return fetchedEntries;
            } catch (error) {
                console.error(`error fetching  entries: `, error);
            }
            return [];
        }

        const fetchedJournals = await fetchEntries('journal', fetchAllJournalEntries);
        const fetchedMoodJournals = await fetchEntries('mood', fetchAllMoodJournalEntries);

        const semanticArrayJournals = await calculateSemanticScoreForJournals(fetchedJournals);
        const semanticArrayMoodJournals = await calculateSemanticScoreForMoodJournals(fetchedMoodJournals);

        const joinedScores = semanticArrayJournals.concat(semanticArrayMoodJournals);
        const sum = joinedScores.reduce((a, b) => a + b, 0);
        const average = Math.round(sum / joinedScores.length);

        setState(prevState => ({
            ...prevState,
            userJournals: fetchedJournals,
            userMoodJournals: fetchedMoodJournals,
            overallScore: average,
            isLoading: false,
            isDataLoaded: true,
        }));
    }

    useEffect(() => {
        fetchData();
    }, [])


    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }
        fetchData();
    }, [journals]);

    const validJournalBodies = state.userJournals
        .map(journal => journal.body)
        .filter((body): body is string => body !== undefined);


    return (
        <>
            {state.isLoading === false && (
                <LinearGradient style={styles.clusterPromptContainer} colors={[Colors.primary, Colors.pink]} >
                    <View style={styles.navigationRow}>
                        <Text style={styles.placeNameHeader}>{state.generalPlaceName}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={(() => handleCloseNotification())}>
                            <MaterialCommunityIcons name="close" size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contentRow}>
                        <Text style={styles.subHeader}>Journal Entries</Text>
                        <ScrollView style={styles.journalsContainer}>
                            {state.userJournals.map((journal, index) => (
                                <Link href={`/element/journal/${journal.id}`} asChild key={journal.id}>
                                    <TouchableOpacity key={index} style={styles.journalRow}>
                                        <Text style={styles.journalIndex}>{(index + 1)}.</Text>
                                        <Text style={styles.journalTitle}>{journal.date}</Text>
                                        <MaterialCommunityIcons name="pencil" size={24} color="white" />
                                    </TouchableOpacity>
                                </Link>
                            ))}
                        </ScrollView>

                        {state.userMoodJournals.length > 0 && (
                            <ScrollView style={styles.journalsContainer}>
                                <Text style={styles.subHeader}>Mood Journal Entries</Text>
                                {state.userMoodJournals.map((moodJournal, index) => (
                                    <Link href={`/element/moodJournal/${moodJournal.id}`} asChild key={moodJournal.id}>
                                        <TouchableOpacity key={index} style={styles.journalRow}>
                                            <Text style={styles.journalIndex}>{(index + 1)}.</Text>
                                            <Text style={styles.journalTitle}>{moodJournal.date}</Text>
                                            <MaterialCommunityIcons name="emoticon-happy" size={24} color="white" />
                                        </TouchableOpacity>
                                    </Link>
                                ))}
                            </ScrollView>
                        )}
                        {!state.isLoading && (  // Render the progress bar and themes component only after data is loaded
                            <ScrollView style={styles.infoContainer}>
                                <View style={styles.infoColumn}>
                                    <Text style={styles.subHeader}>Overall Happiness Score</Text>
                                    <ProgressBarWithColor step={state.overallScore} height={25} isAnimating={true} />
                                </View>
                                <MultipleJournalThemesComponent journalBodies={validJournalBodies} />
                            </ScrollView>
                        )}
                    </View>
                </LinearGradient>
            )}
            {state.isLoading === true && (
                <View style={styles.loadingPopup}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                </View>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    clusterPromptContainer: {
        position: 'absolute',
        top: 25,
        left: 25,
        right: 25,
        bottom: 25,
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.primary,
        padding: 30,
        //gap: 0
    },
    navigationRow: {
        flexDirection: 'row',
        //paddingHorizontal: 5,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    contentRow: {
        gap: 10
    },
    journalsContainer: {
        flexDirection: 'column',
        gap: 20,
        maxHeight: 90
    },
    infoContainer: {
        flexDirection: 'column',
        gap: 20,
        maxHeight: 200
    },
    journalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        padding: 8,
        marginBottom: 5,
        justifyContent: 'space-between'
    },
    infoColumn: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },

    journalTitle: {
        color: 'white',
        fontFamily: 'mon-sb',
        fontSize: 14,
        flex: 1
    },
    closeButton: {},
    subHeader: {
        color: 'white',
        fontFamily: 'mon-sb',
        fontSize: 16,
        //marginBottom: 5
    },
    otherHeader: {},
    placeNameHeader: {
        color: 'white',
        fontFamily: 'mon-sb',
        fontSize: 16,
        //maxHeight: 25,
        //marginBottom: 5
        textDecorationLine: 'underline',
        marginBottom: 10
    },
    journalIndex: {
        width: 20,
        color: 'white',
        fontFamily: 'mon-sb',
        fontSize: 16
    },
    loadingPopup: {
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center'
      },
})

export default memo(ClusterPrompt);