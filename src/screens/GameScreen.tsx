import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameBoard from '../components/GameBoard';
import Web3Wallet from '../components/Web3wallet';
import { GAME_COLORS, Web3State } from '../types';
import { formatScore } from '../utils';

const GameScreen: React.FC = () => {
  const [score, setScore] = useState(0);
  const [web3State, setWeb3State] = useState<Web3State>({
    isConnected: false,
    address: null,
    balance: null,
  });

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
  };

  const handleGameOver = () => {
    Alert.alert(
      'Game Over!',
      `Final Score: ${score}\nConnect wallet to mint your score as NFT!`,
      [{ text: 'OK' }]
    );
  };

  const handleConnectWallet = async () => {
    try {
      // 实现钱包连接逻辑
      setWeb3State({
        isConnected: true,
        address: '0x1234...5678', // 示例地址
        balance: '1.5', // 示例余额
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      Alert.alert('Error', 'Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      // 实现钱包断开连接逻辑
      setWeb3State({
        isConnected: false,
        address: null,
        balance: null,
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      Alert.alert('Error', 'Failed to disconnect wallet');
    }
  };

  const handleMintNFT = async () => {
    try {
      // 实现 NFT 铸造逻辑
      Alert.alert('Success', 'NFT minted successfully!');
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      Alert.alert('Error', 'Failed to mint NFT');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>2048</Text>
      <Text style={styles.score}>Score: {formatScore(score)}</Text>
      
      <View style={styles.boardContainer}>
        <GameBoard
          onScoreChange={handleScoreChange}
          onGameOver={handleGameOver}
        />
      </View>

      <Web3Wallet
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        onMintNFT={handleMintNFT}
        web3State={web3State}
        score={score}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GAME_COLORS.BACKGROUND,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: GAME_COLORS.TEXT.DARK,
    marginBottom: 8,
  },
  score: {
    fontSize: 24,
    color: GAME_COLORS.TEXT.DARK,
    marginBottom: 20,
  },
  boardContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
});

export default GameScreen;