import { View, Text } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import ExpandedHeader from '@/components/expandedHeader'
import DayView from '@/components/dayView';

const Page = () => {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      <DayView />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

export default Page