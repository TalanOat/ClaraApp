import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, ScrollView } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '@/constants/Colors'
import { databaseService } from '@/model/databaseService'
import moment from 'moment'
import { adminDatabaseService } from '@/model/adminDatabaseService'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInDown,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';


interface Goal {
  id: number,
  name: string,
  createdAt: string,
  step: number,
  steps: number,
  daily: string,
  type?: string
}

const Page = () => {
  const [nameInput, setNameInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [repeat, setRepeat] = useState(true);
  const amountRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([])
  const [flashNotification, setFlashNotification] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState('current');


  const onNameChanged = (itemValue: string) => {
    setNameInput(itemValue)
  }

  const onStepsChanged = (itemValue: string) => {
    setStepsInput(itemValue)
  }

  const toggleRepeat = () => {
    setRepeat(!repeat);
  }

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const returnedGoals = await databaseService.getAllGoals();
      if (returnedGoals) {
        const updatedGoals = returnedGoals.map(goal => ({
          ...goal,
          type: goal.step === goal.steps ? "completed" : "current"
        }));

        setGoals(updatedGoals);
      }
    }
    catch (error) {
      console.error(error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])



  const handleSave = async () => {
    amountRef.current?.blur();
    nameRef.current?.blur();

    try {
      const currentTime = new Date().toISOString()
      const startingStep = 0;
      await databaseService.createGoal(nameInput, currentTime, startingStep, parseInt(stepsInput), repeat.toString())
    }
    catch (error) {
      console.error("error saving goal: ", error)
    }
    finally {
      fetchGoals();
    }
  }

  const handleGoalPlus = async (inputGoal: Goal) => {
    setLoading(true);
    try {
      const newStep = await databaseService.addOneToGoal(inputGoal.id);

      if (newStep === inputGoal.steps) {
        setFlashNotification(true);
        setTimeout(() => {
          setFlashNotification(false);
        }, 1000);
      }
    }
    catch (error) {
      console.error("error adding: ", error)
    }
    finally {
      setLoading(false)
      fetchGoals();
    }
  }
  const handleGoalMinus = async (inputGoal: Goal) => {
    setLoading(true);
    try {
      await databaseService.subtractOneFromGoal(inputGoal.id)
    }
    catch (error) {
      console.error("error subtracking: ", error)
    }
    finally {
      setLoading(false)
      fetchGoals();
    }
  }

  const handleOptionPress = (option: string) => {
    setSelectedGoalType(option);
  }


  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.primary, Colors.pink]}>
      <ScrollView style={styles.goalsContainer} keyboardShouldPersistTaps={'always'} >
        <View style={styles.goalsCreateContainer}>
          <View style={styles.mainHeaderContainer}>
            <Text style={styles.titleHeader}>What Would You Like To Track?</Text>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Goal Name</Text>
            <TextInput
              ref={nameRef}
              style={styles.trackingInput}
              onChangeText={onNameChanged}
              value={nameInput}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Times per Day</Text>
            <TextInput
              ref={amountRef}
              style={styles.trackingInputNumber}
              keyboardType='number-pad'
              onChangeText={onStepsChanged}
              value={stepsInput}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Repeat Daily?</Text>
            <Switch
              trackColor={{ false: Colors.transparentWhite, true: Colors.primary }}
              thumbColor={repeat ? Colors.pink : Colors.primary}
              ios_backgroundColor={Colors.transparentWhite}
              onValueChange={toggleRepeat}
              value={repeat}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={(() => { handleSave() })}>
              <Text style={styles.buttonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.currentGoalsContainer}>
          <View style={styles.typeNav}>
            {['current', 'completed', 'repeated'].map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.button,
                  selectedGoalType === option && styles.saveButton,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={styles.buttonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.currentGoalsList}>
            {selectedGoalType === 'current' &&
              goals.filter(goal => goal.type === "current")
                .map((goal, index) => (
                  <View style={styles.goalRow} key={index}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <View style={styles.goalTimes}>
                      <TouchableOpacity onPress={(() => { !loading && handleGoalMinus(goal) })}
                        disabled={loading}>
                        <MaterialCommunityIcons name="minus-circle" size={24} color="white" />
                      </TouchableOpacity>
                      <Text style={styles.goalStep}>{goal.step}</Text>
                      <Text style={styles.goalStep}>/</Text>
                      <Text style={styles.goalStep}>{goal.steps}</Text>
                      <TouchableOpacity onPress={(() => { !loading && handleGoalPlus(goal) })}
                        disabled={loading}>
                        <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
            }
            {selectedGoalType === 'completed' &&
              goals.filter(goal => goal.type === "completed")
                .map((goal, index) => (
                  <View style={styles.goalRow} key={index}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <View style={styles.goalTimes}>
                      <TouchableOpacity onPress={(() => { !loading && handleGoalMinus(goal) })}
                        disabled={loading}>
                        <MaterialCommunityIcons name="minus-circle" size={24} color="white" />
                      </TouchableOpacity>
                      <Text style={styles.goalStep}>{goal.step}</Text>
                      <Text style={styles.goalStep}>/</Text>
                      <Text style={styles.goalStep}>{goal.steps}</Text>
                      <TouchableOpacity
                        disabled={true}>
                        <MaterialCommunityIcons name="plus-circle" size={24} color={Colors.transparentWhite} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
            }
            {selectedGoalType === 'repeated' &&
              goals.filter(goal => goal.daily === "true")
                .map((goal, index) => (
                  <View style={styles.goalRow} key={index}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <View style={styles.goalTimes}>
                      <TouchableOpacity onPress={(() => { !loading && handleGoalMinus(goal) })}
                        disabled={loading}>
                        <MaterialCommunityIcons name="minus-circle" size={24} color="white" />
                      </TouchableOpacity>
                      <Text style={styles.goalStep}>{goal.step}</Text>
                      <Text style={styles.goalStep}>/</Text>
                      <Text style={styles.goalStep}>{goal.steps}</Text>
                      {goal.step === goal.steps && (
                        <TouchableOpacity
                          disabled={true}>
                          <MaterialCommunityIcons name="plus-circle" size={24} color={Colors.transparentWhite} />
                        </TouchableOpacity>
                      )}
                      {goal.step !== goal.steps && (
                        <TouchableOpacity onPress={(() => { !loading && handleGoalPlus(goal) })}
                          disabled={loading}>
                          <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
                        </TouchableOpacity>
                      )}

                    </View>
                  </View>
                ))
            }
          </View>
        </View>

      </ScrollView>
      {flashNotification && (
        <Animated.View entering={ZoomIn.delay(50)} exiting={ZoomOut.delay(50)} style={flashMessage.container}>
          <Text style={flashMessage.innerText}>Goal Completed</Text>
        </Animated.View>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  goalsContainer: {
    flex: 1,
    paddingBottom: 0,
    marginBottom: 90,
    borderRadius: 10,
    marginHorizontal: 15,
    //gap: 30
  },
  goalsCreateContainer: {
    ///flex: 1,
    marginTop: 10,
    gap: 10,
    marginBottom: 30
  },
  inputRow: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 10,
    minHeight: 50
  },
  trackingInput: {
    flex: 0.8,
    //width: "80%",
    backgroundColor: Colors.transparentWhite,
    padding: 15,
    borderRadius: 10,
    height: 50,
    fontSize: 16,
    color: "white"
  },
  trackingInputNumber: {
    //flex: 1,
    backgroundColor: Colors.transparentWhite,
    padding: 15,
    borderRadius: 10,
    height: 50,
    fontSize: 16,
    color: "white"
  },
  mainHeaderContainer: {
    marginTop: 10,
    alignItems: "center"
  },
  titleHeader: {
    color: "white",
    fontSize: 18,
    fontFamily: "mon-sb",

    marginBottom: 20
  },
  inputLabel: {
    color: "white",
    fontSize: 15,
    fontFamily: "mon",
  },
  button: {
    backgroundColor: Colors.transparentWhite,
    padding: 15,
    borderRadius: 10,
    //alignItems: "flex-end"
  },
  selectedButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    //alignItems: "flex-end"
  },
  saveButton: {
    backgroundColor: Colors.pink,
    padding: 15,
    borderRadius: 10,
    //alignItems: "flex-end"
  },
  buttonText: {
    color: "white",
    fontFamily: "mon-b",
    fontSize: 12
  },
  buttonRow: {
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  currentGoalsContainer: {
    //borderRadius: 10,
    //backgroundColor: Colors.transparentWhite
  },
  goalRow: {
    backgroundColor: Colors.transparentWhite,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalName: {
    color: "white",
    fontSize: 15,
    fontFamily: "mon",
  },
  goalTimes: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    maxWidth: "30%"
  },
  goalStep: {
    color: "white",
    fontSize: 15,
  },
  currentGoalsList: {
    gap: 10
  },
  typeNav: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    //justifyContent: "center"
  }

})

const flashMessage = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    //borderRadius: 10,
    overflow: "hidden"
  },
  innerText: {
    padding: 20,
    color: "white",
    fontFamily: "mon-b",
    fontSize: 15,

    backgroundColor: Colors.pink,
    borderRadius: 10,
    //margin: 50
    overflow: "hidden"
  }
})

export default Page