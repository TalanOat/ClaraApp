import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Pedometer } from 'expo-sensors';
import Colors from '@/constants/Colors'

const StepCounter = () => {
    const [initialStepCount, setInitialStepCount] = useState<number | null>(null);
    const [previousStepCount, setPreviousStepCount] = useState<number | null>(null);
    const [currentStepCount, setCurrentStepCount] = useState<number>(0);

    useEffect(() => {
        const fetchStepCount = async () => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 1);

            const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
            if (pastStepCountResult) {
                setInitialStepCount(pastStepCountResult.steps);
                setPreviousStepCount(pastStepCountResult.steps);
            }
        };

        fetchStepCount();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (initialStepCount !== null && previousStepCount !== null) {
                const currentStepCountResult = await Pedometer.getStepCountAsync(
                    new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                    new Date()
                );
                if (currentStepCountResult) {
                    const newSteps = currentStepCountResult.steps - initialStepCount;
                    const incrementalSteps = currentStepCountResult.steps - previousStepCount;
                    if (newSteps >= 0 && incrementalSteps >= 0) {
                        setCurrentStepCount(prevCount => prevCount + incrementalSteps);
                        setPreviousStepCount(currentStepCountResult.steps);
                    }
                }
            }
        }, 10 * 1000);

        return () => clearInterval(intervalId);
    }, [initialStepCount, previousStepCount]);

    return (
        <View style={styles.stepCountContainer}>
            <Text style={styles.stepCountHeading}>Steps</Text>
            <View style={styles.spacedContainer}>
                <Text style={styles.stepCountText}>(24 hours):</Text>
                <Text style={styles.stepCountText}>{initialStepCount}</Text>
            </View>
            <View style={styles.spacedContainer}>
                <Text style={styles.stepCountText}>(Now):</Text>
                <Text style={styles.stepCountText}>{currentStepCount}</Text>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    stepCountContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.pink,
        padding: 12,
        margin: 20,
        elevation: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',

    },
    stepCountText: {
        fontSize: 14,
        fontFamily: "mon-sb",
        color: "white"
    },
    spacedContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        width: 150
    },
    stepCountHeading: {
        fontSize: 14,
        fontFamily: "mon-b",
        color: "white"
    }
})

export default StepCounter