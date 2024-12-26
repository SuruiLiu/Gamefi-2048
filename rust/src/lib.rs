// lib.rs
pub mod game;
pub mod bindings;

pub use game::Game;
pub use game::Direction;

#[derive(Debug, thiserror::Error)]
pub enum GameError {
    #[error("Invalid move")]
    InvalidMove,
    #[error("Game over")]
    GameOver,
}

pub type Result<T> = std::result::Result<T, GameError>;

pub struct GameManager {
    game: Game,
}

impl GameManager {
    pub fn new() -> Self {
        Self {
            game: Game::new(),
        }
    }

    pub fn make_move(&mut self, direction: game::Direction) -> Result<bool> {
        if self.game.is_game_over() {
            return Err(GameError::GameOver);
        }

        Ok(self.game.make_move(direction))
    }

    pub fn get_board(&self) -> [[u32; 4]; 4] {
        self.game.get_board()
    }

    pub fn get_score(&self) -> u32 {
        self.game.get_score()
    }

    pub fn is_game_over(&self) -> bool {
        self.game.is_game_over()
    }

    // pub async fn mint_score_nft(&mut self) -> Result<String> {
    //     if !self.game.is_game_over() {
    //         return Err(GameError::InvalidMove);
    //     }

    //     let score = self.game.get_score();
    //     self.web3.mint_score_nft(score).await
    //         .map_err(|e| GameError::Web3Error(e.to_string()))
    // }

    // pub async fn connect_wallet(&mut self, address: String) -> Result<()> {
    //     self.web3.connect_wallet(address).await
    //         .map_err(|e| GameError::Web3Error(e.to_string()))
    // }

    // pub fn get_wallet_address(&self) -> Option<String> {
    //     self.web3.get_connected_address()
    // }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_game_manager() {
        let mut manager = GameManager::new();
        assert!(!manager.is_game_over());
        assert_eq!(manager.get_score(), 0);
    }

    #[test]
    fn test_invalid_operations() {
        let mut manager = GameManager::new();
        
        // 设置游戏结束状态
        while !manager.is_game_over() {
            let _ = manager.make_move(game::Direction::Left);
            let _ = manager.make_move(game::Direction::Right);
            let _ = manager.make_move(game::Direction::Up);
            let _ = manager.make_move(game::Direction::Down);
        }

        // 游戏结束后尝试移动
        assert!(matches!(
            manager.make_move(game::Direction::Left),
            Err(GameError::GameOver)
        ));
    }
}