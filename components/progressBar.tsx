import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
//import DayView from '@/components/dayView';
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors';

import Animated, {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ProgressBarProps {
  step: number;
  steps: number;
  height?: number;
  textLabel?: string;
  isAnimating?: boolean;
}

const ProgressBar: React.FunctionComponent<ProgressBarProps> = ({ 
  step, steps, height, textLabel, isAnimating 
}) => {
  const [barWidth, setBarWidth] = useState(0);
  const progressPercentage = (step / steps) * 100;
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    if (isAnimating) {
      animatedWidth.value = 0;
      animatedWidth.value = withTiming((progressPercentage * barWidth) / 100, {
        duration: 400,
        easing: Easing.inOut(Easing.quad)
      });
    }
  }, [isAnimating]);

  return (
    <View>
      <Text style={[defaultStyles.defaultFontGrey, styles.progressText]}>
        {textLabel}
      </Text>
      <View
        onLayout={e => {
          setBarWidth(e.nativeEvent.layout.width);
        }}
        style={{
          height: height,
          backgroundColor: Colors.offWhite,
          borderRadius: height,
          overflow: "hidden"
        }}
      >
        <Animated.View
          style={[
            {
              height: height,
              width: animatedWidth,
              borderRadius: height,
              backgroundColor: Colors.primary,
              position: "absolute",
              left: 0,
              top: 0,
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  progressText: { marginBottom: 5, marginLeft: 10 },
})

export default ProgressBar;