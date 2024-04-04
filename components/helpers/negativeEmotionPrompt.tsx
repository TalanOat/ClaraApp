import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Colors from '@/constants/Colors'
import { defaultStyles } from '@/constants/Styles'
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { OPEN_WEATHER_API_KEY } from '@/environments';
import * as Location from 'expo-location';
import Animated, {
    useSharedValue,
    withTiming,
    Easing,
    SlideInDown,
    SlideInUp,
    FadeInDown,
    FadeInUp,
    SlideInLeft,
    SlideInRight,
    useAnimatedStyle,
    ZoomIn,
} from 'react-native-reanimated';

import { Image } from 'expo-image';

import * as SecureStore from 'expo-secure-store';


interface NotificationPromptProps {
    onVisibilityChanged: (visible: boolean) => void;
}

interface Location {
    latitude: number;
    longitude: number;
}

interface WeatherValues {
    iconURL: string
    weatherDesc: string
    temp: number
    poorWeather: boolean
}

const NegativeEmotionPrompt = ({ onVisibilityChanged }: NotificationPromptProps) => {
    //const [isNotificationVisible, setIsNotificationVisible] = useState(true);

    const handleCloseNotification = () => {
        onVisibilityChanged(false);
    };

    const [weatherData, setWeatherData] = useState<WeatherValues>();
    const [loading, setLoading] = useState<boolean>(false);
    const [thirdPartyEnabled, setThirdPartyEnabled] = useState<boolean>(true);

    let location = {
        lat: 20,
        lon: 40
    }
    async function getUserLocation() {
        setLoading(true)
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Location permissions denied');
            return null;
        }

        let location = await Location.getCurrentPositionAsync({});

        setLoading(false)
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        };

    }

    const fetchWeatherData = async (inputLocation: Location) => {
        setLoading(true)
        const lat = inputLocation.latitude;
        const lon = inputLocation.longitude;


        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}&units=metric`);

            if (!response.ok) {
                console.error(response)
            }
            const data = await response.json();

            if (data) {
                const iconCode = data.weather[0].icon
                let isWeatherPoor = false;

                if (data.weather[0].description === "shower rain" || data.weather[0].description === "rain"
                    || data.weather[0].description === "thunderstorm" || data.weather[0].description === "snow"
                    || data.weather[0].description === "mist") {

                    isWeatherPoor = true;
                }

                const weatherObject: WeatherValues = {
                    iconURL: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
                    weatherDesc: data.weather[0].description,
                    temp: data.main.temp,
                    poorWeather: isWeatherPoor
                }
                setWeatherData(weatherObject);
            }


        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Handle the error appropriately (e.g., display an error message)
        }
        finally {
            setLoading(false)
        }
    };

    const loadWeatherSettings = async () => {
        try {
            const storedWeather = await SecureStore.getItemAsync('weatherEnabled');
            if (storedWeather) {
                const storedWeatherAsBoolean = (storedWeather.toLowerCase() === "true");
                return [true, storedWeatherAsBoolean];
            }
            else{
                console.log("no value stored in settings")
            }
        } catch (error) {
            console.error('Error loading name:', error);
        }
    };


    useEffect(() => {
        const getLocationAndPass = async () => {
            const weatherAPIEnabled = await loadWeatherSettings();

            if (weatherAPIEnabled && weatherAPIEnabled[1] === true) {
                console.log("weatherAPIEnabled: ", weatherAPIEnabled[1])
                setThirdPartyEnabled(weatherAPIEnabled[1]);

                const locationCoords = await getUserLocation();
                if (locationCoords) {
                    fetchWeatherData(locationCoords)
                }
            }
            if (weatherAPIEnabled && weatherAPIEnabled[1] === false) {
                console.log("weatherAPIEnabled: ", weatherAPIEnabled[1])
                setThirdPartyEnabled(weatherAPIEnabled[1]);
            }
        }

        getLocationAndPass();

    }, [])

    return (

        <BlurView style={styles.notificationContainer} intensity={40} tint="light" >
            <BlurView style={styles.formContainer} intensity={100} tint="light">
                <View style={styles.closeContainerNav}>
                    <TouchableOpacity style={styles.closeButton} onPress={(() => handleCloseNotification())}>
                        <MaterialCommunityIcons name="close" size={30} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.formContent}>

                    <View style={styles.startingFormContent}>
                        <Text style={styles.titleHeader}>Sorry to hear you are not feeling good</Text>
                    </View>
                    {!loading && weatherData && !weatherData.poorWeather && (
                        <View style={styles.suggestionElement}>
                            <Text style={styles.header1}>A walk might help?</Text>
                            <View style={styles.weatherRow}>
                                <Text style={styles.weatherText}>Current Weather: {weatherData.weatherDesc}</Text>
                                <Image
                                    style={styles.weatherIcon}
                                    source={weatherData.iconURL}
                                    transition={1000}
                                />
                                <Text style={styles.weatherText}>Temp: {weatherData.temp} (C)</Text>
                            </View>
                            <Link href={"/(tabs)/map"} asChild>
                                <TouchableOpacity style={styles.walkButton}>
                                    <View style={styles.button}>
                                        <Text style={styles.buttonText}>Go For a Walk</Text>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    )}
                    {!loading && !thirdPartyEnabled && (
                        <View style={styles.suggestionElement}>
                            <Text style={styles.header1}>A walk might help? Due to your settings, this app can't check the weather</Text>
                            <Link href={"/(tabs)/map"} asChild>
                                <TouchableOpacity style={styles.walkButton}>
                                    <View style={styles.button}>
                                        <Text style={styles.buttonText}>Go For a Walk</Text>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    )}
                    {!loading && weatherData && weatherData.poorWeather && (
                        <View style={styles.suggestionElement}>
                            <Text style={styles.header1}>As the weather is poor, writing a journal might help</Text>
                            <View style={styles.weatherRow}>
                                <Text style={styles.weatherText}>Current Weather: {weatherData.weatherDesc}</Text>
                                <Image
                                    style={styles.weatherIcon}
                                    source={weatherData.iconURL}
                                    transition={1000}
                                />
                                <Text style={styles.weatherText}>Temp: {weatherData.temp} (C)</Text>
                            </View>
                            <Link href={"/(tabs)/map"} asChild>
                                <TouchableOpacity style={styles.walkButton}>
                                    <View style={styles.button}>
                                        <Text style={styles.buttonText}>Add a journal</Text>
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    )}


                </View>
            </BlurView>
            {loading && (
                <Animated.View style={styles.loadingPopup} entering={ZoomIn.delay(200)} exiting={SlideInUp.delay(100)}>
                    <ActivityIndicator size="large" color={Colors.pink} />
                </Animated.View>
            )}
        </BlurView>

    )
}

const styles = StyleSheet.create({
    notificationContainer: {
        width: "100%",
        height: "100%",
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 90,
        paddingBottom: 90,
        flex: 1,
        alignItems: "center",
        //borderRadius: 20,
        overflow: 'hidden'
        //backgroundColor: Colors.primary,

    },
    formContainer: {
        flex: 1,
        width: "90%",
        height: "100%",
        backgroundColor: Colors.primary,
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "flex-start",
        padding: 20,
        borderRadius: 20,
        overflow: 'hidden'

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
        textAlign: "center",
        marginBottom: 20
    },

    button: {
        marginHorizontal: "30%",
        backgroundColor: Colors.pink,
        padding: 12,
        borderRadius: 10,
        //elevation: 10,
    },
    buttonText: {
        color: "white",
        fontFamily: "mon-b",
        alignSelf: "center",
        fontSize: 12
    },
    closeButton: {

    },
    closeContainerNav: {
        alignItems: "flex-end",
        //backgroundColor: "pink",
        width: "100%",
        //flex: 1
    },
    startingFormContent: {
        //flex: 1,
        //height: "100%",
        //width: "100%",
        justifyContent: "space-evenly",
        alignItems: "center"
    },
    formContent: {
        flex: 1,
        height: "100%",
        width: "100%",
        justifyContent: "space-evenly",
        //backgroundColor:"pink"
    },
    suggestionElement: {},
    weatherRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center"
    },
    loadingPopup: {
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center'
    },
    weatherIcon: {
        width: 50,
        height: 50
    },
    weatherText: {
        color: "white",
        fontFamily: "mon",
    },
    walkButton: {
        marginTop: 30
    }

})

export default NegativeEmotionPrompt