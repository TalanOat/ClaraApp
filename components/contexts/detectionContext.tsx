import { Dispatch, ReactNode, SetStateAction, createContext, useEffect, useRef, useState } from "react";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from "react-native";
import NotificationPrompt from "../helpers/notificationPrompt";
import moment from 'moment';
import { databaseService } from "@/model/databaseService";

import * as SecureStore from 'expo-secure-store';

enum usageTypes {
    JOURNAL_LOG = "journal_add",
    MOOD_LOG = "mood_add",
    MAP_USE = "map_use"
}

interface UsageLogEntry {
    id?: number;
    createdAt?: string;
    start?: string;
    end?: string;
    type?: usageTypes;
}


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

interface DetectionContextInterface {
    sendNotificationNow: (title: string, body: string) => Promise<void>;
    logWindowStart: (usageType: usageTypes) => void;
    logWindowEnd: (usageType: usageTypes) => void;
}

const defaultState: DetectionContextInterface = {
    sendNotificationNow: async () => { },
    logWindowStart: () => { },
    logWindowEnd: () => { },
};

export const DetectionContext = createContext<DetectionContextInterface>(defaultState);

type DetectionProviderProps = {
    children: ReactNode;
};


export const DetectionProvider = ({ children }: DetectionProviderProps) => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const responseListener = useRef<Notifications.Subscription>();

    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false)

    const onPromptVisibilityChanged = (visible: boolean) => {
        setShowNotificationPrompt(visible);
    }



    const sendNotificationNow = async (title: string, body: string) => {
        const message = {
            to: expoPushToken,
            sound: "default",
            title: title,
            body: body
        }
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                host: "exp.host",
                accept: "application/json",
                "accept-encoding": "gzip, deflate",
                "content-type": "application/json",
            },
            body: JSON.stringify(message)
        })
    };



    let singleLog: UsageLogEntry | null;

    const logWindowStart = (usageType: usageTypes) => {
        const currentTime = moment();

        const formattedTime = currentTime.format('YYYY-MM-DD HH:mm');
        singleLog = { start: formattedTime, type: usageType }

    }

    const logWindowEnd = () => {
        const currentTime = moment();
        const formattedTime = currentTime.format('YYYY-MM-DD HH:mm');
        const dateID = currentTime.format('YYYY-MM-DD')

        singleLog = { ...singleLog, end: formattedTime, createdAt: dateID };

        saveUsageLog(singleLog);
        singleLog = null;
    }


    const saveUsageLog = async (logObject: UsageLogEntry) => {
        try {
            console.log("logObject: ", logObject)
            if (logObject.createdAt && logObject.type && logObject.start && logObject.end) {
                await databaseService.createUsageLog(logObject.createdAt, logObject.type, logObject.start, logObject.end)
            }
        }
        catch (error) {
            console.error('Error saving usage log:', error);
        }
    }

    const loadUsageLogs = async () => {
        try {
            const logs = await databaseService.getAllUsageLogs();
            if (logs) {
                return logs
            }
            else {
                console.log("no usage logs available ")
                return false;
            }
        }
        catch (error) {
            console.error('Error loading usage log:', error);
            return false;
        }
    }

    const [hourWindows, setHourWindows] = useState<timeWindow []>();

    interface timeWindow {
        start: number,
        end: number,
        type?: usageTypes
    }

    const calculateAverageWindows = (inputLogs: UsageLogEntry[]) => {
        if (inputLogs.length === 0) {
            return null;
        }

        const hourWindows: timeWindow[] = [];

        inputLogs.forEach(log => {
            const blockStart = moment(log.start).hour();
            const blockEnd = moment(log.end).startOf('hour').add(1, 'hour').hour();

            const isDuplicate = hourWindows.some(window => 
                window.start === blockStart && window.end === blockEnd
            );

            if (!isDuplicate) {
                hourWindows.push({
                    start: blockStart,
                    end: blockEnd,
                    type: log.type
                });
            }
        })

        return(hourWindows);
    }

    const loadSetting = async () => {
        try {
            const storedSetting = await SecureStore.getItemAsync('notificationsEnabled');

            if (storedSetting) {
                const storedSettingAsBoolean = (storedSetting.toLowerCase() === "true"); 
                setNotificationsEnabled(storedSettingAsBoolean);
            }
        } catch (error) {
            console.error('Error loading name:', error);
        }
    };

    const checkInWindow = (window: timeWindow) => {
        const currentHour = new Date().getHours();
    
        if (currentHour === window.start ) 
        {
            return(true)
        } 
        else
        {
            return(false)
        }
    };

    

    useEffect(() => {
        //scheduleNotificationFor();
        if(expoPushToken && hourWindows && notificationsEnabled){
            //for now just get the first hourWindow:

            hourWindows.forEach(element => {
                const inWindow = checkInWindow(element)
                if(inWindow){
                    if (element.type === usageTypes.JOURNAL_LOG && notificationsEnabled){
                        console.log("element in widnow: ", element)
                       sendNotificationNow("Hi, would you like to journal?", "You normally add a journal around this time.");
                    }
                }
            });

        }   
    },[expoPushToken, hourWindows, notificationsEnabled])

    useEffect(() => {
        const initialize = async () => {
            try {
                loadSetting();
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    setExpoPushToken(token);
                    
                }
                const returnedLogs = await loadUsageLogs();
                if (returnedLogs) {
                    const hourWindows = calculateAverageWindows(returnedLogs);
                    if (hourWindows){
                        setHourWindows(hourWindows)
                    }

                    //console.log("hourWindows: ", hourWindows)
                }

            }
            catch (error) {
                console.error('Initialization error:', error);
            }
        };

        initialize();
        //wipeSecureStore();

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            setShowNotificationPrompt(true);
        });

        return () => {
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    async function registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync({ projectId: 'afdc9a23-7d36-4201-bd22-7c13dfa5a810' })).data;
            //console.log(token);
        } else {
            alert('Must use physical device for Push Notifications');
        }

        return token;
    }

    const contextValue = {
        sendNotificationNow,
        logWindowStart,
        logWindowEnd
    };

    return (
        <DetectionContext.Provider value={contextValue}>
            {children}
            {showNotificationPrompt && (
                <NotificationPrompt onVisibilityChanged={onPromptVisibilityChanged} />
            )}
        </DetectionContext.Provider>
    );
};