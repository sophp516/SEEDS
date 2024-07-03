import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const CustomSlider = ({ minimumValue, maximumValue, step, value,  onValueChange, sliderColor, trackColor }) => {
  const [sliderValue, setSliderValue] = useState(minimumValue);
  const [thumbPosition, setThumbPosition] = useState(value);

  const updateThumbPosition = (value) => {
    // Calculate thumb position based on slider value
    const totalRange = maximumValue - minimumValue;
    const percentage = (value - minimumValue) / totalRange;
    setThumbPosition(percentage);
  };

  useEffect(() => {
    updateThumbPosition(sliderValue);
    onValueChange(sliderValue);
  }, [sliderValue]);

  return (
    <View style={styles.container}>
      <View style={[styles.customTrack, {backgroundColor: trackColor}]}>
        <View style={[styles.customFilledTrack, { width: `${thumbPosition * 100}%`, backgroundColor: sliderColor }]} />
      </View>

      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={sliderValue}
        onValueChange={(value) => {
          setSliderValue(value);
          updateThumbPosition(value);
        }}
        minimumTrackTintColor="transparent"
        maximumTrackTintColor="transparent"
        thumbTintColor={sliderColor}
      />

      <View style={[styles.thumbLabel, { left: `${(thumbPosition + 0.03) * 100}%` ,paddingTop: 50}]}>
        <Text style={styles.labelText}>{sliderValue}</Text>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    marginBottom: 10,
    position: 'relative',
  },
  slider: {
    width: '110%',
    height: 40,  // Only affects the touch area, not the track thickness
    position: 'absolute',
    zIndex: 1,
  },
  customTrack: {
    height: 10,  // Actual visual thickness of the track
    borderRadius: 5,
    width: '110%',
    position: 'absolute',
    zIndex: 0,
  },
  customFilledTrack: {
    height: 10,
    // backgroundColor: '#F9A05F',
    borderRadius: 5,
  },
  thumbLabel: {
    position: 'absolute',

    zIndex: 2,
  },
  labelText: {
    color: '#706F6F',
    textAlign: 'center',
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.1,
  }
});

export default CustomSlider;