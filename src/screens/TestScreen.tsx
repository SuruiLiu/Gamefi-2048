import React from 'react';
import { View, Text, Button, NativeModules } from 'react-native';

const { GameEngine } = NativeModules;

const TestScreen = () => {
  const testGameEngine = async () => {
    try {
      const gameState = await GameEngine.getGameState();
      console.log('Game state:', gameState);
      alert('Game engine initialized successfully!\n' + JSON.stringify(gameState, null, 2));
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        alert('Error: ' + error.message);
      } else {
        alert('An unknown error occurred');
      }
    }
  };

  const testMove = async () => {
    try {
      // 尝试向右移动 (direction = 1)
      const moved = await GameEngine.moveBoard(1);
      console.log('Move result:', moved);
      const gameState = await GameEngine.getGameState();
      console.log('New game state:', gameState);
      alert('Move successful!\n' + JSON.stringify(gameState, null, 2));
    } catch (error) {
      console.error('Move error:', error);
      if (error instanceof Error) {
        alert('Move error: ' + error.message);
      } else {
        alert('An unknown error occurred during the move');
      }
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Game Engine Test</Text>
      <Button title="Test Game Engine" onPress={testGameEngine} />
      <View style={{ height: 20 }} />
      <Button title="Test Move" onPress={testMove} />
    </View>
  );
};

export default TestScreen;

function alert(message: string) {
  // In a real React Native environment, you would use Alert from 'react-native'
  // For example:
  // import { Alert } from 'react-native';
  // Alert.alert('Alert', message);
  console.log(message);
}