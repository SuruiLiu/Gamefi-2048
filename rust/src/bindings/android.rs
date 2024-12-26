// bindings/android.rs
use crate::{Game, Direction, GameError, Result};
use jni::JNIEnv;
use jni::objects::{JClass, JString};
use jni::sys::{jlong, jboolean, jobjectArray, jstring};

#[no_mangle]
pub extern "system" fn Java_com_game2048_GameModule_initGame(
    _env: JNIEnv,
    _class: JClass,
) -> jlong {
    let game = Box::new(Game::new());
    Box::into_raw(game) as jlong
}

#[no_mangle]
pub extern "system" fn Java_com_game2048_GameModule_makeMove(
    env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
    direction: JString,
) -> jboolean {
    let game = unsafe { &mut *(game_ptr as *mut Game) };
    
    let direction: String = env
        .get_string(direction)
        .expect("Invalid direction string")
        .into();
        
    let direction = match direction.to_uppercase().as_str() {
        "UP" => Direction::Up,
        "DOWN" => Direction::Down,
        "LEFT" => Direction::Left,
        "RIGHT" => Direction::Right,
        _ => return false.into(),
    };

    game.make_move(direction).into()
}

#[no_mangle]
pub extern "system" fn Java_com_game2048_GameModule_getBoard(
    env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
) -> jobjectArray {
    let game = unsafe { &*(game_ptr as *mut Game) };
    let board = game.get_board();

    // 创建一个 4x4 的二维数组
    let array_class = env.find_class("[[I").expect("Failed to find array class");
    let result = env.new_object_array(4, array_class, env.new_int_array(4).unwrap()).unwrap();

    for i in 0..4 {
        let row = env.new_int_array(4).unwrap();
        let row_elements = board[i].iter().map(|&x| x as i32).collect::<Vec<i32>>();
        env.set_int_array_region(row, 0, &row_elements).unwrap();
        env.set_object_array_element(result, i as i32, row).unwrap();
    }

    result
}

#[no_mangle]
pub extern "system" fn Java_com_game2048_GameModule_getScore(
    _env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
) -> jlong {
    let game = unsafe { &*(game_ptr as *mut Game) };
    game.get_score() as jlong
}

#[no_mangle]
pub extern "system" fn Java_com_game2048_GameModule_isGameOver(
    _env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
) -> jboolean {
    let game = unsafe { &*(game_ptr as *mut Game) };
    game.is_game_over().into()
}

#[no_mangle]
pub extern "system" fn Java_com_game2048_GameModule_destroyGame(
    _env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
) {
    if game_ptr != 0 {
        unsafe {
            let _ = Box::from_raw(game_ptr as *mut Game);
        }
    }
}