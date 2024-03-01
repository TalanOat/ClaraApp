import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Fragment, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors'
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Platform, KeyboardAvoidingView, Keyboard } from 'react-native'
import * as NavigationBar from 'expo-navigation-bar';
import ExpandedHeader from '@/components/expandedHeader'
import SmallerHeader from '@/components/smallerHeader';
import { databaseService } from '@/model/databaseService';


export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'mon': require('../assets/fonts/Montserrat-Regular.ttf'),
    'mon-sb': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    'mon-b': require('../assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    databaseService.initDB();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const insets = useSafeAreaInsets();

  if (Platform.OS === 'android') {
    NavigationBar.setBackgroundColorAsync(Colors.pink);
  }

  function CustomStatusBar() {
    return <StatusBar style="light" backgroundColor={Colors.primary} />;
  }
  //implemented as the keyboardAvoidingView was getting stuck sometimes
  //BUG: this only partially solved the issue, sometimes on fully letting the keyboard,
  //  load in pressing the navigation to go back means the normal view without the keyobard
  //  is padded 
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [forceRerender, setForceRerender] = useState(false);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      console.log("keyboard show")
      setKeyboardVisible(true)
    });

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      console.log("keyboard hide")
      setKeyboardVisible(false);
      setForceRerender(true);
      setTimeout(() => setForceRerender(false), 100);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <Fragment>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>

        <CustomStatusBar />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ header: ExpandedHeader }} />
          <Stack.Screen name="element/journal/[id]" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
          <Stack.Screen name="element/journal/createJournal" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
          <Stack.Screen name="element/moodJournal/createMoodJournal" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
          <Stack.Screen name="element/settings" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
        </Stack>

      </SafeAreaView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: Colors.pink,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: Colors.primary,
        }}
      />
    </Fragment>

  );
  // return (
  //   <Fragment>
  //     <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
  //     <KeyboardAvoidingView
  //         style={{ flex: 1 }}
  //         behavior={keyboardVisible ? 'padding' : undefined}
  //         key={forceRerender ? 'key1' : 'key2'} //when the key is detected as changed the component re-renders
  //       >
  //         <CustomStatusBar />
  //         <Stack>
  //           <Stack.Screen name="(tabs)" options={{ header: ExpandedHeader }} />
  //           <Stack.Screen name="element/journal/[id]" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
  //           <Stack.Screen name="element/journal/createJournal" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
  //           <Stack.Screen name="element/moodJournal/createMoodJournal" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
  //           <Stack.Screen name="element/settings" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
  //         </Stack>
  //       </KeyboardAvoidingView>
  //     </SafeAreaView>

  //     <View
  //       style={{
  //         position: 'absolute',
  //         bottom: 0,
  //         left: 0,
  //         right: 0,
  //         height: insets.bottom,
  //         backgroundColor: Colors.pink,
  //       }}
  //     />
  //     <View
  //       style={{
  //         position: 'absolute',
  //         top: 0,
  //         left: 0,
  //         right: 0,
  //         height: insets.top,
  //         backgroundColor: Colors.primary,
  //       }}
  //     />
  //   </Fragment>

  // );
}

