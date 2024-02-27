import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import DayView from '@/components/dayView';
import testData from '@/assets/data/testData.json';


const Page = () => {
  const navigation = useNavigation();
  const [loadAnimation, setLoadAnimation] = useState(false);

  //listens for navigation changes, carries out code when this page is focused
  useEffect(() => {
    const navigationListener = navigation.addListener("focus", () => {
      setLoadAnimation(true);
      setTimeout(() => setLoadAnimation(false), 1000);
    });

    const blurListener = navigation.addListener("blur", () => {
      //console.log("Page unfocused");
      setLoadAnimation(false);
    });

    return () => {
      navigation.removeListener("focus", navigationListener);
      navigation.removeListener("blur", blurListener);
    };
  }, [navigation]);

  // useEffect(() => {

  //   setLoadAnimation(true);
  //   console.log("first load: ", loadAnimation)
  //   setTimeout(() => setLoadAnimation(false), 1000);
  // }, []);

  return (
    <LinearGradient
      style={styles.container}
      colors={["#20115B", "#C876FF"]}>
      <DayView loadAnimation={loadAnimation} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

export default Page