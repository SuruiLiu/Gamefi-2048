// game.rs
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Game {
    board: [[u32; 4]; 4],
    score: u32,
    game_over: bool,
}

impl Game {
    pub fn new() -> Self {
        let mut game = Game {
            board: [[0; 4]; 4],
            score: 0,
            game_over: false,
        };
        game.add_random_tile();
        game.add_random_tile();
        game
    }

    pub fn make_move(&mut self, direction: Direction) -> bool {
        if self.game_over {
            return false;
        }

        let old_board = self.board;
        match direction {
            Direction::Up => self.move_up(),
            Direction::Down => self.move_down(),
            Direction::Left => self.move_left(),
            Direction::Right => self.move_right(),
        }

        // 如果棋盘有变化，添加新的随机方块
        if old_board != self.board {
            self.add_random_tile();
            // 检查游戏是否结束
            self.check_game_over();
            true
        } else {
            false
        }
    }

    fn move_left(&mut self) {
        for row in 0..4 {
            // 第一步：先移除所有的零
            let mut non_zero = Vec::new();
            for col in 0..4 {
                if self.board[row][col] != 0 {
                    non_zero.push(self.board[row][col]);
                }
            }
    
            // 第二步：合并相邻的相同数字
            let mut merged = Vec::new();
            let mut i = 0;
            while i < non_zero.len() {
                if i + 1 < non_zero.len() && non_zero[i] == non_zero[i + 1] {
                    merged.push(non_zero[i] * 2);
                    self.score += non_zero[i] * 2;
                    i += 2;
                } else {
                    merged.push(non_zero[i]);
                    i += 1;
                }
            }
    
            // 第三步：用零填充剩余的位置
            for col in 0..4 {
                self.board[row][col] = if col < merged.len() {
                    merged[col]
                } else {
                    0
                };
            }
        }
    }

    fn move_right(&mut self) {
        self.reverse_rows();
        self.move_left();
        self.reverse_rows();
    }

    fn move_up(&mut self) {
        self.transpose();
        self.move_left();
        self.transpose();
    }

    fn move_down(&mut self) {
        self.transpose();
        self.move_right();
        self.transpose();
    }

    fn transpose(&mut self) {
        let mut new_board = [[0; 4]; 4];
        for i in 0..4 {
            for j in 0..4 {
                new_board[i][j] = self.board[j][i];
            }
        }
        self.board = new_board;
    }

    fn reverse_rows(&mut self) {
        for row in 0..4 {
            self.board[row].reverse();
        }
    }

    fn add_random_tile(&mut self) {
        let mut empty_cells = Vec::new();
        for i in 0..4 {
            for j in 0..4 {
                if self.board[i][j] == 0 {
                    empty_cells.push((i, j));
                }
            }
        }

        if let Some(&(i, j)) = empty_cells.choose(&mut rand::thread_rng()) {
            // 90% 概率生成 2，10% 概率生成 4
            self.board[i][j] = if rand::random::<f32>() < 0.9 { 2 } else { 4 };
        }
    }

    fn check_game_over(&mut self) {
        // 检查是否还有空格
        for row in 0..4 {
            for col in 0..4 {
                if self.board[row][col] == 0 {
                    return;
                }
            }
        }

        // 检查是否还有可以合并的相邻方块
        for row in 0..4 {
            for col in 0..4 {
                let current = self.board[row][col];
                // 检查右边
                if col < 3 && current == self.board[row][col + 1] {
                    return;
                }
                // 检查下边
                if row < 3 && current == self.board[row + 1][col] {
                    return;
                }
            }
        }

        self.game_over = true;
    }

    pub fn get_board(&self) -> [[u32; 4]; 4] {
        self.board
    }

    pub fn get_score(&self) -> u32 {
        self.score
    }

    pub fn is_game_over(&self) -> bool {
        self.game_over
    }

    #[cfg(test)]
    pub fn new_with_board(board: [[u32; 4]; 4]) -> Self {
        Game {
            board,
            score: 0,
            game_over: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_game() {
        let game = Game::new();
        let board = game.get_board();
        let mut tile_count = 0;
        
        for row in board.iter() {
            for &cell in row.iter() {
                if cell != 0 {
                    tile_count += 1;
                }
            }
        }

        assert_eq!(tile_count, 2);
    }

    #[test]
    fn test_move_left() {
        let mut game = Game::new_with_board([
            [2, 2, 0, 0],
            [2, 0, 2, 0],
            [4, 4, 4, 4],
            [0, 0, 0, 2],
        ]);

        game.move_left(); 
        let expected_board = [
            [4, 0, 0, 0],
            [4, 0, 0, 0],
            [8, 8, 0, 0],
            [2, 0, 0, 0],
        ];

        assert_eq!(game.board, expected_board);
        
        assert_eq!(game.score, 24);
    }

    #[test]
    fn test_move_right() {
        let mut game = Game::new_with_board([
            [2, 2, 0, 0],
            [2, 0, 2, 0],
            [4, 4, 4, 4],
            [0, 0, 0, 2],
        ]);

        game.move_right();

        let expected_board = [
            [0, 0, 0, 4],
            [0, 0, 0, 4],
            [0, 0, 8, 8],
            [0, 0, 0, 2],
        ];

        assert_eq!(game.board, expected_board);
    }
}