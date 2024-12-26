//src/components/Tile.tsx

import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { CELL_SIZE, GAME_COLORS, TileValue } from '../types';

interface TileProps {
  value: TileValue;
  position: { x: number; y: number };
  isNew?: boolean;
  isMerged?: boolean;
}

const Tile: React.FC<TileProps> = ({ value, position, isNew, isMerged }) => {
  const tileStyle = {
    left: position.x * CELL_SIZE,
    top: position.y * CELL_SIZE,
    backgroundColor: GAME_COLORS.TILES[value],
  };

  const textColor = value <= 4 ? GAME_COLORS.TEXT.DARK : GAME_COLORS.TEXT.LIGHT;
  const scale = React.useRef(new Animated.Value(isNew ? 0 : 1)).current;

  React.useEffect(() => {
    if (isNew || isMerged) {
      scale.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isNew, isMerged]);

  return (
    <Animated.View
      style={[
        styles.tile,
        tileStyle,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Text
        style={[
          styles.value,
          { color: textColor, fontSize: value >= 100 ? 24 : 32 },
        ]}
      >
        {value}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: CELL_SIZE - 10,
    height: CELL_SIZE - 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default Tile;