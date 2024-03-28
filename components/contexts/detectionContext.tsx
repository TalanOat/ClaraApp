import { Dispatch, ReactNode, SetStateAction, createContext, useEffect, useRef, useState } from "react";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";
import NotificationPrompt from "../helpers/notificationPrompt";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

interface DetectionContextInterface {
    sendNotificationNow: (title: string, body: string) => Promise<void>;
}

const defaultState: DetectionContextInterface = {
    sendNotificationNow: async () => { },
};

export const DetectionContext = createContext<DetectionContextInterface>(defaultState);

type DetectionProviderProps = {
    children: ReactNode;
};


export const DetectionProvider = ({ children }: DetectionProviderProps) => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const responseListener = useRef<Notifications.Subscription>();

    const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);

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

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                console.log("token: ", token);
                setExpoPushToken(token)
            }
        }).catch(error => console.log(error))

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
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
            console.log(token);
        } else {
            alert('Must use physical device for Push Notifications');
        }

        return token;
    }

    const contextValue = {
        sendNotificationNow
    };

    return (
        <DetectionContext.Provider value={contextValue}>
            {children}
            {showNotificationPrompt && (
                <NotificationPrompt onVisibilityChanged={onPromptVisibilityChanged}/>
            )}
        </DetectionContext.Provider>
    );
};