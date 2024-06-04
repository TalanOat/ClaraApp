import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import JournalThemesComponent from '@/components/helpers/statsHelpers/themesComponent';
import React, { useContext, useEffect, useRef, useState } from 'react'
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

const ClusterPrompt = ({ onVisibilityChanged, data }: ClusterPromptProps) => {
    const [userJournals, setUserJournals] = useState<UserElement[]>([]);
    const [userMoodJournals, setUserMoodJournals] = useState<UserElement[]>([]);
    const [generalPlaceName, setGeneralPlaceName] = useState("");
    const [overallScore, setOverallScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 
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
        setIsLoading(true);
        try {
            const entries = await databaseService.getJournalEntriesByID(journalIds);
            let userPin = await loadPinSettings();
            let journalEntries: UserElement[] = [];
            for (let entry of entries) {
                if (entry && entry.body !== undefined && userPin) {
                    //console.log("----------------entry.body: ", entry.body)

                    const decryptedBody = await decryptString(entry.body, userPin);
                    //console.log(decryptedBody);

                    if (decryptedBody && isValidUTF8(decryptedBody)) {
                        const formattedDate = moment(entry.createdAt).format('DD/MM/YY');

                        const returnElement: UserElement = ({
                            id: entry.id,
                            type: 'journal',
                            body: decryptedBody,
                            date: formattedDate
                        });
                        journalEntries.push(returnElement);
                    } else {
                        console.error('Invalid UTF-8 string:', decryptedBody);
                    }
                }
            }
            return journalEntries;
        } catch (error) {
            console.error(error);
            return [];
        }
        finally {
            setIsLoading(false);
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
        setIsLoading(true);
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
        finally {
            setIsLoading(false);
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
        setIsLoading(true);
        setIsDataLoaded(false);
        if (data.length !== 0) {
            const point: Coordinate = {
                latitude: (data[0].clusterCoords)[1],
                longitude: (data[0].clusterCoords)[0]
            };
            try {
                const placeName = await getNearestPOI(point);
                const shortenedName = placeName.split(',').slice(0, 1).join(',');
                setGeneralPlaceName(shortenedName);
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

        const fetchedJournals = await fetchEntries('journal', fetchAllJournalEntries)
        const fetchedMoodJournals = await fetchEntries('mood', fetchAllMoodJournalEntries)

        const semanticArrayJournals = await calculateSemanticScoreForJournals(fetchedJournals);
        const semanticArrayMoodJournals = await calculateSemanticScoreForMoodJournals(fetchedMoodJournals);

        const joinedScores = semanticArrayJournals.concat(semanticArrayMoodJournals);
        const sum = joinedScores.reduce((a, b) => a + b, 0);
        const average = Math.round(sum / joinedScores.length);

        //setOverallScore(average)

        setOverallScore(average)
        setUserJournals(fetchedJournals);
        setUserMoodJournals(fetchedMoodJournals);
        setIsLoading(false);
        setIsDataLoaded(true);  
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

    const [validJournalBodies, setValidJournalBodies] = useState<string[]>([]);
    useEffect(() => {
        const validJournalBodies = userJournals
            .map(journal => journal.body)
            .filter((body): body is string => body !== undefined);
        setValidJournalBodies(validJournalBodies);

    }, [userJournals])



    return (
        <>
            <LinearGradient style={styles.clusterPromptContainer} colors={[Colors.primary, Colors.pink]} >
                <View style={styles.navigationRow}>
                    <Text style={styles.placeNameHeader}>{generalPlaceName}</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={(() => handleCloseNotification())}>
                        <MaterialCommunityIcons name="close" size={30} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.contentRow}>
                    <Text style={styles.subHeader}>Journal Entries</Text>
                    <ScrollView style={styles.journalsContainer}>
                        {userJournals.map((journal, index) => (
                            <Link href={`/element/journal/${journal.id}`} asChild key={journal.id}>
                                <TouchableOpacity key={index} style={styles.journalRow}>
                                    <Text style={styles.journalIndex}>{(index + 1)}.</Text>
                                    <Text style={styles.journalTitle}>{journal.date}</Text>
                                    <MaterialCommunityIcons name="pencil" size={24} color="white" />
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </ScrollView>
                    <Text style={styles.subHeader}>Mood Journal Entries</Text>
                    <ScrollView style={styles.journalsContainer}>
                        {userMoodJournals.map((moodJournal, index) => (
                            <Link href={`/element/moodJournal/${moodJournal.id}`} asChild key={moodJournal.id}>
                                <TouchableOpacity key={index} style={styles.journalRow}>
                                    <Text style={styles.journalIndex}>{(index + 1)}.</Text>
                                    <Text style={styles.journalTitle}>{moodJournal.date}</Text>
                                    <MaterialCommunityIcons name="emoticon-happy" size={24} color="white" />
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </ScrollView>
                    {isDataLoaded && (
                        <ScrollView style={styles.infoContainer}>
                            <View style={styles.infoColumn}>
                                <ProgressBarWithColor step={overallScore} height={25} isAnimating={true} textLabel="Overall Score" />
                                <Text style={styles.subHeader}>{overallScore}</Text>
                            </View>

                            <MultipleJournalThemesComponent journalBodies={validJournalBodies} />
                        </ScrollView>
                    )}


                </View>
            </LinearGradient>
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
    }
})

export default ClusterPrompt