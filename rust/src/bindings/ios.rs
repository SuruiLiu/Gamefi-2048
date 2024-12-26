// bindings/ios.rs
use std::os::raw::{c_char, c_void};
use std::ffi::{CString, CStr};
use crate::{Game, Direction, GameError};

#[no_mangle]
pub extern "C" fn game_init() -> *mut c_void {
    let game = Box::new(Game::new());
    Box::into_raw(game) as *mut c_void
}

#[no_mangle]
pub extern "C" fn game_make_move(game_ptr: *mut c_void, direction: *const c_char) -> bool {
    if game_ptr.is_null() || direction.is_null() {
        return false;
    }

    let game = unsafe { &mut *(game_ptr as *mut Game) };
    let direction_str = unsafe { CStr::from_ptr(direction) }
        .to_str()
        .unwrap_or("");

    let direction = match direction_str.to_uppercase().as_str() {
        "UP" => Direction::Up,
        "DOWN" => Direction::Down,
        "LEFT" => Direction::Left,
        "RIGHT" => Direction::Right,
        _ => return false,
    };

    game.make_move(direction)
}

#[no_mangle]
pub extern "C" fn game_get_board(game_ptr: *const c_void) -> *mut *mut i32 {
    if game_ptr.is_null() {
        return std::ptr::null_mut();
    }

    let game = unsafe { &*(game_ptr as *const Game) };
    let board = game.get_board();

    // 创建一个堆分配的二维数组
    let mut result = Vec::with_capacity(4);
    for row in board.iter() {
        let mut row_vec = Vec::with_capacity(4);
        for &cell in row.iter() {
            row_vec.push(cell as i32);
        }
        result.push(row_vec.into_boxed_slice());
    }

    // 将结果转换为原始指针
    let mut raw_ptr = Vec::with_capacity(4);
    for row in result.iter() {
        raw_ptr.push(row.as_ptr() as *mut i32);
    }

    // 防止内存泄漏
    std::mem::forget(result);
    let ptr = raw_ptr.as_ptr() as *mut *mut i32;
    std::mem::forget(raw_ptr);
    ptr
}

#[no_mangle]
pub extern "C" fn game_get_score(game_ptr: *const c_void) -> i64 {
    if game_ptr.is_null() {
        return 0;
    }

    let game = unsafe { &*(game_ptr as *const Game) };
    game.get_score() as i64
}

#[no_mangle]
pub extern "C" fn game_is_game_over(game_ptr: *const c_void) -> bool {
    if game_ptr.is_null() {
        return true;
    }

    let game = unsafe { &*(game_ptr as *const Game) };
    game.is_game_over()
}

#[no_mangle]
pub extern "C" fn game_destroy(game_ptr: *mut c_void) {
    if !game_ptr.is_null() {
        unsafe {
            let _ = Box::from_raw(game_ptr as *mut Game);
        }
    }
}

// 用于释放 get_board 返回的内存
#[no_mangle]
pub extern "C" fn game_free_board(board_ptr: *mut *mut i32) {
    if !board_ptr.is_null() {
        unsafe {
            let board = Vec::from_raw_parts(board_ptr, 4, 4);
            for ptr in board {
                let _ = Vec::from_raw_parts(ptr, 4, 4);
            }
        }
    }
}