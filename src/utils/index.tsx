// src/utils/index.ts
import { Board, Direction, Position, TileValue } from '../types';

export const createEmptyBoard = (): Board => {
  return Array(4).fill(null).map(() => Array(4).fill(null));
};

export const getRandomTileValue = (): TileValue => {
  return Math.random() < 0.9 ? 2 : 4;
};

export const getRandomEmptyCell = (board: Board): Position | null => {
  const emptyCells = [];
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === null) {
        emptyCells.push({ x, y });
      }
    }
  }
  
  if (emptyCells.length === 0) return null;
  
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

export const isGameOver = (board: Board): boolean => {
  // Check for empty cells
  if (board.some(row => row.some(cell => cell === null))) return false;
  
  // Check for possible merges
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const current = board[y][x];
      // Check right
      if (x < 3 && current === board[y][x + 1]) return false;
      // Check down
      if (y < 3 && current === board[y + 1][x]) return false;
    }
  }
  
  return true;
};

export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};