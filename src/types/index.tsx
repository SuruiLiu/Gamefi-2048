// src/types/index.ts

// Game Types
export type TileValue = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048;
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Board = (TileValue | null)[][];

export interface GameState {
  board: Board;
  score: number;
  isGameOver: boolean;
}

export interface Tile {
  value: TileValue;
  position: Position;
  isNew?: boolean;
  isMerged?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

// Web3 Types
export interface Web3State {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
}

// Constants
export const BOARD_SIZE = 4;
export const CELL_SIZE = 80;
export const CELL_GAP = 10;

export const GAME_COLORS = {
  BACKGROUND: '#faf8ef',
  GRID: '#bbada0',
  EMPTY_CELL: '#ccc0b3',
  TEXT: {
    LIGHT: '#f9f6f2',
    DARK: '#776e65',
  },
  TILES: {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e',
  },
} as const;

export const ANIMATION_DURATION = 150; // ms

// Contract Constants
export const CONTRACT_ADDRESS = '0x...'; // Your contract address
export const CHAIN_ID = 1; // Ethereum Mainnet
export const TOKEN_DECIMALS = 18;