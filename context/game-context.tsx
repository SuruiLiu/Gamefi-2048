import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from "react";
import { isNil, throttle } from "lodash";
import {
  mergeAnimationDuration,
  tileCountPerDimension,
} from "@/constants";
import { Tile } from "@/models/tile";
import gameReducer, { initialState } from "@/reducers/game-reducer";

type MoveDirection = "move_up" | "move_down" | "move_left" | "move_right";

export const GameContext = createContext({
  score: 0,
  status: "ongoing",
  moveTiles: (_: MoveDirection) => {},
  getTiles: () => [] as Tile[],
  startGame: () => {},
  endGame: () => {},
  maxScore: 0,
  gameEndTime: ""
});

export default function GameProvider({ children }: PropsWithChildren) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  const getEmptyCells = () => {
    const results: [number, number][] = [];

    for (let x = 0; x < tileCountPerDimension; x++) {
      for (let y = 0; y < tileCountPerDimension; y++) {
        if (isNil(gameState.board[y][x])) {
          results.push([x, y]);
        }
      }
    }
    return results;
  };

  const appendRandomTile = () => {
    const emptyCells = getEmptyCells();
    if (emptyCells.length > 0) {
      const cellIndex = Math.floor(Math.random() * emptyCells.length);
      const newTile = {
        position: emptyCells[cellIndex],
        value: 2,
      };
      dispatch({ type: "create_tile", tile: newTile });
    }
  };

  const getTiles = () => {
    return gameState.tilesByIds.map((tileId) => gameState.tiles[tileId]);
  };

  const moveTiles = useCallback(
    throttle(
      (type: MoveDirection) => dispatch({ type }),
      mergeAnimationDuration * 1.05,
      { trailing: false },
    ),
    [dispatch],
  );

  const startGame = () => {
    dispatch({ type: "reset_game" });

    const emptyCells = getEmptyCells();
    if (emptyCells.length < 2) return; // 确保至少有两个空位

    // 随机选择两个不同的位置
    const firstIndex = Math.floor(Math.random() * emptyCells.length);
    let secondIndex;
    do {
      secondIndex = Math.floor(Math.random() * emptyCells.length);
    } while (secondIndex === firstIndex);

    // 随机选择两个值，确保至少有一个是2
    const firstValue = Math.random() < 0.5 ? 2 : 4;
    const secondValue = firstValue === 2 ? (Math.random() < 0.5 ? 2 : 4) : 2;

    // 创建两个tile
    dispatch({ type: "create_tile", tile: { position: emptyCells[firstIndex], value: firstValue } });
    dispatch({ type: "create_tile", tile: { position: emptyCells[secondIndex], value: secondValue } });
  };

  const checkGameState = () => {
    const { tiles, board } = gameState;

    const maxIndex = tileCountPerDimension - 1;
    for (let x = 0; x < maxIndex; x += 1) {
      for (let y = 0; y < maxIndex; y += 1) {
        if (
          isNil(gameState.board[x][y]) ||
          isNil(gameState.board[x + 1][y]) ||
          isNil(gameState.board[x][y + 1])
        ) {
          return;
        }

        if (tiles[board[x][y]].value === tiles[board[x + 1][y]].value) {
          return;
        }

        if (tiles[board[x][y]].value === tiles[board[x][y + 1]].value) {
          return;
        }
      }
    }

      dispatch({ type: "update_status", status: "lost", maxScore: gameState.score });
  };

  const endGame = useCallback(() => {
    dispatch({ type: "update_status", status: "ended", maxScore: gameState.score });
  }, [gameState.score]);

  useEffect(() => {
    if (gameState.hasChanged) {
      setTimeout(() => {
        dispatch({ type: "clean_up" });
        appendRandomTile();
      }, mergeAnimationDuration);
    }
  }, [gameState.hasChanged]);

  useEffect(() => {
    if (!gameState.hasChanged) {
      checkGameState();
    }
  }, [gameState.hasChanged]);

  return (
    <GameContext.Provider
      value={{
        score: gameState.score,
        status: gameState.status,
        getTiles,
        moveTiles,
        startGame,
        endGame,
        maxScore: gameState.maxScore,
        gameEndTime: gameState.gameEndTime 
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
