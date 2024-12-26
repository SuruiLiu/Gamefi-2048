import React from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { BOARD_SIZE, CELL_SIZE, Direction, GAME_COLORS, GameState } from '../types';
import Tile from './Tile';
import GameEngine from '../bridges/GameEngine';

interface GameBoardProps {
  onScoreChange: (score: number) => void;
  onGameOver: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onScoreChange, onGameOver }) => {
  const [gameState, setGameState] = React.useState<GameState>({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    score: 0,
    isGameOver: false,
  });

  React.useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    try {
      const initialState = await GameEngine.initGame();
      setGameState(initialState);
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (e: GestureResponderEvent, gs: PanResponderGestureState) => {
        const { dx, dy } = gs;
        const direction = getDirection(dx, dy);
        if (direction) makeMove(direction);
      },
    })
  ).current;

  const getDirection = (dx: number, dy: number): Direction | null => {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const minDistance = 50;

    if (Math.max(absDx, absDy) < minDistance) return null;

    if (absDx > absDy) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      return dy > 0 ? 'DOWN' : 'UP';
    }
  };

  const makeMove = async (direction: Direction) => {
    try {
      const newState = await GameEngine.makeMove(direction);
      setGameState(newState);
      onScoreChange(newState.score);
      
      if (newState.isGameOver) {
        onGameOver();
      }
    } catch (error) {
      console.error('Failed to make move:', error);
    }
  };

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        cells.push(
          <View
            key={`cell-${i}-${j}`}
            style={[
              styles.cell,
              {
                left: j * CELL_SIZE,
                top: i * CELL_SIZE,
              },
            ]}
          />
        );
      }
    }
    return cells;
  };

  const renderTiles = () => {
    const tiles: React.JSX.Element[] = [];
    gameState.board.forEach((row, i) => {
      row.forEach((value, j) => {
        if (value) {
          tiles.push(
            <Tile
              key={`tile-${i}-${j}`}
              value={value}
              position={{ x: j, y: i }}
            />
          );
        }
      });
    });
    return tiles;
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.grid}>{renderGrid()}</View>
      <View style={styles.tiles}>{renderTiles()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: BOARD_SIZE * CELL_SIZE,
    height: BOARD_SIZE * CELL_SIZE,
    backgroundColor: GAME_COLORS.GRID,
    borderRadius: 6,
    padding: 5,
  },
  grid: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE - 10,
    height: CELL_SIZE - 10,
    backgroundColor: GAME_COLORS.EMPTY_CELL,
    borderRadius: 6,
  },
  tiles: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});

export default GameBoard;