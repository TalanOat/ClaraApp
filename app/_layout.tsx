import { useFonts } from 'expo-font';
import { Stack, router, useNavigation } from 'expo-router';
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

import DateProvider from '@/components/contexts/dateProvider';
import { JournalsProvider } from '@/components/contexts/journalProvider';
import { DetectionProvider } from '@/components/contexts/detectionContext';
import SmallerHeaderNoCog from '@/components/smallerHeaderNoCog';
import * as SecureStore from 'expo-secure-store';


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

  const checkOnboarding = async () => {
    try {
      const onboardingCompleted = await SecureStore.getItemAsync("onboardingComplete")
      //console.log("onboardingCompleted: ", onboardingCompleted)
      if (onboardingCompleted === "false") {
        router.push("/element/introScreens/firstScreen")
      }
    }
    catch (error) {
      return null;
    }
  }

  useEffect(() => {
    checkOnboarding();
  }, [])

  return (
    <Fragment>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
        <CustomStatusBar />
        <DateProvider>
          <JournalsProvider>
            <DetectionProvider>
              <Stack>
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    header: () => <ExpandedHeader />,
                  }} />
                <Stack.Screen name="element/introScreens/firstScreen" options={{ headerShown: false }} />
                <Stack.Screen name="element/introScreens/secondScreen" options={{ headerShown: false }} />
                <Stack.Screen name="element/introScreens/thirdScreen" options={{ headerShown: false }} />
                <Stack.Screen name="element/introScreens/fouthScreen" options={{ headerShown: false }} />
                <Stack.Screen name="element/introScreens/finalScreen" options={{ headerShown: false }} />
                
                <Stack.Screen name="element/journal/[id]" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/journal/createJournal" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/moodJournal/createMoodJournal" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/moodJournal/[id]" options={{ header: SmallerHeader, headerBackButtonMenuEnabled: true }} />

                <Stack.Screen name="element/settings/settingsMenu" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/trackingValues" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/userDetails" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/thirdParty" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/cloudSync" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/notificationSettings" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/themeSettings" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/onboardingSettings" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
                <Stack.Screen name="element/settings/children/securitySettings" options={{ header: SmallerHeaderNoCog, headerBackButtonMenuEnabled: true }} />
              </Stack>
            </DetectionProvider>
          </JournalsProvider>
        </DateProvider>



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
}

