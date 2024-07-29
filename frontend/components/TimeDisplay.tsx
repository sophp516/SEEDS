import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

const TimeDisplay = ({ isMenu, timestamp, textStyle }) => {
  const [uploadTime, setUploadTime] = useState('');

  // Time stored as nano seconds in Firestore
  useEffect(() => {
    const currTime = new Date();
    const timeDifference = currTime.getTime() - timestamp.toDate().getTime();
    const minutes = Math.floor(timeDifference / 60000);
    const hours = Math.floor(timeDifference / 3600000);
    const days = Math.floor(timeDifference / 86400000);
    const weeks = Math.floor(timeDifference / (86400000 * 7));

    if (minutes < 60) {
      setUploadTime(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`);
    } else if (hours < 24) {
      setUploadTime(`${hours} hour${hours !== 1 ? 's' : ''} ago`);
    } else if (days < 7) {
      setUploadTime(`${days} day${days !== 1 ? 's' : ''} ago`);
    } else if (weeks < 4) {
      setUploadTime(`${weeks} week${weeks !== 1 ? 's' : ''} ago`);
    } else {
      setUploadTime(timestamp.toDate().toString());
    }
  }, [timestamp]);

  return (
    <View>
      {isMenu ? (
        <Text style={textStyle}>last updated {uploadTime}</Text>
      ) : (
        <Text style={textStyle}>{uploadTime}</Text>
      )}
    </View>
  );
};

export default TimeDisplay;

const styles = StyleSheet.create({});
