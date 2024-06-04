import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { defaultStyles } from '@/constants/Styles'
import Colors from '@/constants/Colors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

interface ProgressBarProps {
  step: number;
  height?: number;
  textLabel?: string;
  isAnimating?: boolean;
}

const ProgressBarWithColor: React.FunctionComponent<ProgressBarProps> = ({ 
  step, height = 20, textLabel, isAnimating = false 
}) => {
  const [barWidth, setBarWidth] = useState(0);
  const animatedWidth = useSharedValue(0);
  const [progressColor, setProgressColor] = useState(Colors.primary);

  function calculateColorFromScore(score: number) {
    let r, g, b = 0;
    if (score < 50) {
      // for scores below 50, color between muted red and muted yellow
      r = 200;
      g = Math.round(150 * (score / 50));
    } else {
      // for scores 50 and above, color between muted yellow and muted green
      r = Math.round(150 * ((100 - score) / 50));
      g = 200;
    }
    let hexColor = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');

    return hexColor;
  }

  const animateProgressBar = () => {
    animatedWidth.value = 0;
    animatedWidth.value = withTiming((step * barWidth) / 100, {
      duration: 400,
      easing: Easing.inOut(Easing.quad)
    });
  }

  useEffect(() => {
    if (isAnimating) {
      // get color from sentiment score
      setProgressColor(calculateColorFromScore(step));
      animateProgressBar();
    }
  }, [isAnimating, step, barWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: animatedWidth.value
    };
  });

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
              borderRadius: height,
              backgroundColor: progressColor,
              position: "absolute",
              left: 0,
              top: 0,
            },
            animatedStyle
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  progressText: { marginBottom: 5, marginLeft: 10 },
})

export default ProgressBarWithColor;