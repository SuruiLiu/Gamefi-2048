// src/bridges/GameEngine.ts
import { NativeModules } from 'react-native';
import { Direction, GameState } from '../types';

const { GameEngine: NativeGameEngine } = NativeModules;

class GameEngine {
  private static instance: GameEngine;

  private constructor() {}

  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  async initGame(): Promise<GameState> {
    try {
      return await NativeGameEngine.initGame();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }

  async makeMove(direction: Direction): Promise<GameState> {
    try {
      return await NativeGameEngine.makeMove(direction);
    } catch (error) {
      console.error('Failed to make move:', error);
      throw error;
    }
  }

  async getHighScore(): Promise<number> {
    try {
      return await NativeGameEngine.getHighScore();
    } catch (error) {
      console.error('Failed to get high score:', error);
      throw error;
    }
  }

  async mintGameNFT(score: number): Promise<string> {
    try {
      return await NativeGameEngine.mintGameNFT(score);
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  }
}

export default GameEngine.getInstance();