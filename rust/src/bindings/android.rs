use crate::game::Direction;
use crate::game::Game;

#[cfg(feature = "android")]
use jni::JNIEnv;
#[cfg(feature = "android")]
use jni::objects::{JClass, JString};
#[cfg(feature = "android")]
use jni::sys::{jlong, jboolean, jobjectArray};

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
    mut env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
    direction: JString,
) -> jboolean {
    let game = unsafe { &mut *(game_ptr as *mut Game) };
    
    let direction: String = env
        .get_string(&direction)
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
    mut env: JNIEnv,
    _class: JClass,
    game_ptr: jlong,
) -> jobjectArray {
    let game = unsafe { &*(game_ptr as *mut Game) };
    let board = game.get_board();

    // 创建一个 4x4 的二维数组
    let array_class = env.find_class("[[I")
        .expect("Failed to find array class");
    let result = env.new_object_array(4, array_class, env.new_int_array(4).unwrap())
        .expect("Failed to create object array");

    for i in 0..4 {
        let row = env.new_int_array(4)
            .expect("Failed to create int array");
        let row_elements = board[i].iter().map(|&x| x as i32).collect::<Vec<i32>>();
        
        // 使用引用避免移动
        env.set_int_array_region(&row, 0, &row_elements)
            .expect("Failed to set array region");
        env.set_object_array_element(&result, i as i32, &row)
            .expect("Failed to set array element");
    }

    // 将最终结果转换为 jobjectArray
    result.into_raw()
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