import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

const TimeDisplay = ({timestamp, textStyle}) => {
    const [uploadTime, setUploadTime] = useState('');

    useEffect(() => {
        // time are store as nano seconds 
        const currTime = new Date();
        const timeDifference = currTime.getTime() -timestamp.toDate().getTime();
        const minutes = Math.floor(timeDifference / 60000);
        const hours = Math.floor(timeDifference / 3600000);
        const days = Math.floor(timeDifference / 86400000);
        const weeks = Math.floor(timeDifference / (86400000 * 7));
        if (minutes < 60) {
            setUploadTime(`${minutes} minutes ago`);
        } else if (hours < 24) {
            setUploadTime(`${hours} hours ago`);
        } else if (days < 7) {
            setUploadTime(`${days} days ago`);
        } else if (weeks < 4) {
            setUploadTime(`${weeks} weeks ago`);
        }else{ // just show the actual time 
            setUploadTime(timestamp.toDate().toString());
        }
    }, [])
  return (
    <View>
      <Text style={textStyle}>  {uploadTime}</Text>
    </View>
  )
}

export default TimeDisplay

const styles = StyleSheet.create({})