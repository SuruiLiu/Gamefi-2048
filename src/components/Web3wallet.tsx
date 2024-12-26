import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Web3State, GAME_COLORS } from '../types';
import { formatAddress } from '../utils';

interface Web3WalletProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onMintNFT: () => Promise<void>;
  web3State: Web3State;
  score: number;
}

const Web3Wallet: React.FC<Web3WalletProps> = ({
  onConnect,
  onDisconnect,
  onMintNFT,
  web3State,
  score,
}) => {
  const { isConnected, address, balance } = web3State;

  const handleConnectPress = async () => {
    try {
      await onConnect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectPress = async () => {
    try {
      await onDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleMintPress = async () => {
    try {
      await onMintNFT();
    } catch (error) {
      console.error('Failed to mint NFT:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isConnected ? (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.addressText}>
              {formatAddress(address || '')}
            </Text>
            {balance && (
              <Text style={styles.balanceText}>
                Balance: {balance} ETH
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.mintButton}
              onPress={handleMintPress}
            >
              <Text style={styles.buttonText}>Mint NFT</Text>
              <Text style={styles.scoreText}>Score: {score}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnectPress}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleConnectPress}
        >
          <Text style={styles.buttonText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: GAME_COLORS.BACKGROUND,
    borderRadius: 8,
    marginVertical: 8,
  },
  infoContainer: {
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressText: {
    fontSize: 16,
    color: GAME_COLORS.TEXT.DARK,
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 14,
    color: GAME_COLORS.TEXT.DARK,
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: '#8f7a66',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#ea4335',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  mintButton: {
    backgroundColor: '#4285f4',
    padding: 12,
    borderRadius: 6,
    flex: 2,
  },
  buttonText: {
    color: GAME_COLORS.TEXT.LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    color: GAME_COLORS.TEXT.LIGHT,
    fontSize: 14,
    marginTop: 4,
  },
});

export default Web3Wallet;