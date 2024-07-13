import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar.jsx';
import AllFilter from '../components/AllFilter.tsx';
import colors from '../styles.js'; 

const Discover = () => {

  return (
    <View style={styles.outerContainer}>
      <View style={styles.containerTop}>
        <AllFilter></AllFilter>

      </View>
      <Text style={styles.text}>Discover</Text>
      <Navbar />

    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
  },
  containerTop: {
    padding: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    marginTop: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 100,
  },
});

export default Discover;
