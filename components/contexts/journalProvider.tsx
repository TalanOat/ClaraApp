import { createContext, useState, ReactNode, Dispatch, SetStateAction, useContext, useEffect } from 'react';
import { databaseService } from '@/model/databaseService';
import moment from 'moment';

import { DateContext } from './dateProvider';
import CryptoJS from "react-native-crypto-js";
import * as SecureStore from 'expo-secure-store';


interface JournalElement {
    id: string;
    type: 'journal' | 'mood' | 'goal';
    title: string;
    time: string;
    body?: string;
    trackingName1?: string;
    trackingValue1?: number;
    trackingName2?: string;
    trackingValue2?: number;
    trackingName3?: string;
    trackingValue3?: number;
    goalName?: string;
    goalTarget?: number;
    goalValue?: number;
}

interface JournalsContextInterface {
    journals: JournalElement[];
    setJournals: Dispatch<SetStateAction<JournalElement[]>>;
    fetchData: () => Promise<void>;
}

const defaultState = {
    journals: [],
    setJournals: () => { },
    fetchData: () => Promise.resolve(),
} as JournalsContextInterface;

export const JournalsContext = createContext(defaultState);

type JournalsProviderProps = {
    children: ReactNode;
};

export const JournalsProvider = ({ children }: JournalsProviderProps) => {
    const [journals, setJournals] = useState<JournalElement[]>([]);

    const { headerDate } = useContext(DateContext);

    const loadPinSettings = async () => {
        try {
          const storedPin = await SecureStore.getItemAsync('userPin');
          if (storedPin) {
            return(storedPin);
          }
        } catch (error) {
          console.error('Error loading name:', error);
        }
      };
    
      const decryptString = (encryptedText: string, decryptionPin: string) => {
        const bytes = CryptoJS.AES.decrypt(encryptedText, decryptionPin);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText;
      }
    

    const fetchJournalEntries = async (userPin: string) => {
        try {
            const inputDate = moment(headerDate.date).format('YYYY-MM-DD');
            const databaseResult = await databaseService.getAllJournalsForDate(inputDate);

            const entries: JournalElement[] = databaseResult.map((journal) => ({
                id: "journal_" + journal.id,
                type: 'journal',
                title: journal.title,
                time: moment(journal.createdAt).format('HH:mm'),
                body: decryptString(journal.body, userPin)
            }));

            setJournals(entries);
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const fetchMoodJournalEntries = async () => {
        try {
            const inputDate = moment(headerDate.date).format('YYYY-MM-DD');
            const tempMoodJournals = await databaseService.getAllMoodJournalsForDate(inputDate);

            if (tempMoodJournals) {
                const entries: JournalElement[] = tempMoodJournals.map((moodJournal: any) => ({
                    id: "mood_" + moodJournal.id,
                    type: 'mood',
                    title: 'Mood Journal',
                    time: moment(moodJournal.created_at).format('HH:mm'),
                    trackingName1: moodJournal.tracking_name1,
                    trackingValue1: moodJournal.tracking_value1,
                    trackingName2: moodJournal.tracking_name2,
                    trackingValue2: moodJournal.tracking_value2,
                    trackingName3: moodJournal.tracking_name3,
                    trackingValue3: moodJournal.tracking_value3
                }));
                setJournals(prevJournals => [...prevJournals, ...entries]);
            }

        } catch (error) {
            console.error("error getting mood Journals:", error);
        }
    };

    const fetchData = async () => { 
        const userPin = await loadPinSettings();
        if(userPin){
            await Promise.all([fetchJournalEntries(userPin), fetchMoodJournalEntries()]);
        }   
    };
    
    useEffect(() => {
        fetchData();

    }, [headerDate]);

    return (
        <JournalsContext.Provider value={{ journals, setJournals, fetchData }}>
            {children}
        </JournalsContext.Provider>
    );
};

//export const dateContext = createContext({})




