import { View, Text, Touchable, TouchableOpacity, KeyboardAvoidingView, Keyboard } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Tabs, useNavigation } from 'expo-router'
import Colors from '@/constants/Colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native';

import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  SlideInDown,
  SlideInUp,
} from 'react-native-reanimated';

type NavigationProps = {
  navigate: (value: string) => void;
}

const Layout = () => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  function handleAddNavigation(path: string) {
    setShowAddMenu(false) //close the add menu before navigating
    navigate(path)
  }

  const { navigate } = useNavigation<NavigationProps>()

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // behavior={keyboardVisible ? 'padding' : undefined}
      // key={forceRerender ? 'key1' : 'key2'} //when the key is detected as changed the component re-renders
    >
      <View style={{ flex: 1 }}>
        <Tabs screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.white,
          tabBarLabelStyle: {
            fontFamily: 'mon-sb',
          },
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            display: 'flex',
            height: 200,
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingBottom: 10,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
          },
          headerShown: false,
        }}>
          <Tabs.Screen name="index" options={{
            tabBarLabel: "Home",
            tabBarItemStyle: tabStyles.otherTabs,
            tabBarIcon: ({ color, size }) =>
              <MaterialCommunityIcons name='home'
                color={color}
                size={35}>
              </MaterialCommunityIcons>
          }}>
          </Tabs.Screen>

          <Tabs.Screen name="goals" options={{
            tabBarLabel: "Goals",
            tabBarItemStyle: tabStyles.otherTabs,
            tabBarIcon: ({ color, size }) =>
              <MaterialCommunityIcons name='bullseye-arrow'
                color={color}
                size={35}></MaterialCommunityIcons>
          }}>
          </Tabs.Screen>


          <Tabs.Screen name="add" options={{
            tabBarItemStyle: tabStyles.addButton,
            tabBarLabel: () => null,
            tabBarIcon: ({ color, size }) =>
              <TouchableOpacity onPress={() => {
                setShowAddMenu(true);
              }}>
                <MaterialCommunityIcons name='plus-circle'
                  color={color}
                  size={60}>
                </MaterialCommunityIcons>
              </TouchableOpacity>
          }}>
          </Tabs.Screen>

          <Tabs.Screen name="map" options={{
            tabBarItemStyle: tabStyles.otherTabs,
            tabBarLabel: "Map",
            tabBarIcon: ({ color, size }) =>
              <MaterialCommunityIcons name='map'
                color={color}
                size={35}></MaterialCommunityIcons>
          }}>
          </Tabs.Screen>

          <Tabs.Screen name="vault" options={{
            tabBarItemStyle: tabStyles.otherTabs,
            tabBarLabel: "Vault",
            tabBarIcon: ({ color }) =>
              <MaterialCommunityIcons name='safe-square-outline'
                color={color}
                size={35}></MaterialCommunityIcons>
          }}>
          </Tabs.Screen>

        </Tabs>

        {showAddMenu && (
          <Animated.View style={popupStyles.popup} entering={SlideInDown.delay(50)}>
            <View style={popupStyles.topRow}>
              <TouchableOpacity style={popupStyles.topRowItem} onPress={() => handleAddNavigation("element/journal/createJournal")}>
                <MaterialCommunityIcons name="lead-pencil" size={40} color="white" style={popupStyles.topRowItemIcon} />
                <Text style={popupStyles.topRowItemLabel}>Text Journal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={popupStyles.topRowItem} onPress={() => handleAddNavigation("element/moodJournal/createMoodJournal")}>
                <MaterialCommunityIcons name="emoticon-happy" size={40} color="white" style={popupStyles.topRowItemIcon} />
                <Text style={popupStyles.topRowItemLabel} >Mood Journal</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowAddMenu(false)} style={popupStyles.closeButton}>
              <MaterialCommunityIcons name="minus-circle" size={60} color={Colors.pink} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const tabStyles = StyleSheet.create({
  addButton: {
    bottom: 0,
    height: 70,
    width: 70,
    position: 'relative',
  },
  otherTabs: {
    bottom: 0,
    height: 70,
    width: 70,
  },

});

const popupStyles = StyleSheet.create({
  popup: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    padding: 15,
    //elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },
  topRowItemIcon: {
    paddingBottom: 10
  },
  topRowItem: {
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: 30

  },
  closeButton: {
    alignItems: "center"
  },
  topRowItemLabel: {
    color: Colors.white
  }

});



export default Layout