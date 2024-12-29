package com.game2048;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class GameEngineModule extends ReactContextBaseJavaModule {
    static {
        System.loadLibrary("game2048");
    }

    private long gamePtr;

    public GameEngineModule(ReactApplicationContext reactContext) {
        super(reactContext);
        gamePtr = createGame();
    }

    @Override
    public String getName() {
        return "GameEngine";
    }

    private native long createGame();
    private native void destroyGame(long ptr);
    private native int[] getBoard(long ptr);
    private native int getScore(long ptr);
    private native boolean move(long ptr, int direction);
    private native boolean isGameOver(long ptr);

    @ReactMethod
    public void getGameState(Promise promise) {
        try {
            WritableMap state = Arguments.createMap();
            int[] board = getBoard(gamePtr);
            int score = getScore(gamePtr);
            boolean gameOver = isGameOver(gamePtr);

            WritableMap boardMap = Arguments.createMap();
            for (int i = 0; i < board.length; i++) {
                boardMap.putInt(String.valueOf(i), board[i]);
            }

            state.putMap("board", boardMap);
            state.putInt("score", score);
            state.putBoolean("gameOver", gameOver);

            promise.resolve(state);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void moveBoard(int direction, Promise promise) {
        try {
            boolean moved = move(gamePtr, direction);
            promise.resolve(moved);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        destroyGame(gamePtr);
    }
}