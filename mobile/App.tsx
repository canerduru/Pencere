import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StartScreen } from './src/screens/StartScreen';
import { MainScreen } from './src/screens/MainScreen';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <View style={styles.root}>
      {hasStarted ? (
        <MainScreen onGoBack={() => setHasStarted(false)} />
      ) : (
        <StartScreen onStart={() => setHasStarted(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d1a14',
  },
});
