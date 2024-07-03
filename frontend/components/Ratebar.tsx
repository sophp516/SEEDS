// import React, { useState, FunctionComponent } from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import { Slider, Icon } from '@rneui/themed';

// type SlidersComponentProps = {
//   minimumValue?: number;
//   maximumValue?: number;
//   initialValue?: number;
//   step?: number;
//   allowTouchTrack?: boolean;
//   trackStyle?: object;
//   thumbStyle?: object;
// };

// const Sliders: FunctionComponent<SlidersComponentProps> = ({
//   minimumValue = 0,
//   maximumValue = 5,
//   initialValue = 5,
//   step = 1,
//   onch
//   allowTouchTrack = true,
//   trackStyle = { height: 5, backgroundColor: 'transparent' },
//   thumbStyle = { height: 20, width: 20, backgroundColor: 'transparent' }
// }) => {
//   const [value, setValue] = useState(initialValue);

//   const interpolate = (start: number, end: number) => {
//     let k = (value - minimumValue) / (maximumValue - minimumValue);
//     return Math.ceil((1 - k) * start + k * end) % 256;
//   };

//   const color = () => {
//     let r = interpolate(255, 0);
//     let g = interpolate(0, 255);
//     let b = interpolate(0, 0);
//     return `rgb(${r},${g},${b})`;
//   };

//   return (
//     <View style={[styles.contentView]}>
//       <Slider
//         value={value}
//         onValueChange={setValue}
//         maximumValue={maximumValue}
//         minimumValue={minimumValue}
//         step={step}
//         allowTouchTrack={allowTouchTrack}
//         trackStyle={trackStyle}
//         thumbStyle={thumbStyle}
//         thumbProps={{
//           children: (
//             <View style={styles.thumbContainer}>
//             <Icon
//               name="circle"
//               type="font-awesome"
//               size={20}
//               reverse
//               color="#FFF"
//               // containerStyle={{ bottom: 20, right: 20 }}
//               // color={color()}
//             />
//             <Text style={styles.thumbValue}>{value}</Text>
//             </View>
//           ),
//         }}
//       />
//       <Text style={{ paddingTop: 20 }}>Value: {value}</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   contentView: {
//     padding: 20,
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'stretch',
//   },
//   verticalContent: {
//     padding: 20,
//     flex: 1,
//     flexDirection: 'row',
//     height: 500,
//     justifyContent: 'center',
//     alignItems: 'stretch',
//   },
//   subHeader: {
//     backgroundColor: "#2089dc",
//     color: "white",
//     textAlign: "center",
//     paddingVertical: 5,
//     marginBottom: 10
//   },
//   thumbContainer: {
//     position: 'absolute',
//     width: 20,
//     height: 20,
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   thumbValue: {
//     position: 'absolute',
//     top: -7, // Adjust based on the font size and thumb size
//     color: 'black',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default Sliders;