// android/app/src/main/java/com/game2048/GameEngine.java
package com.game2048;

public class GameEngine {
    static {
        System.loadLibrary("game_2048");
    }

    private long gamePtr;

    public native long initGame();
    public native boolean makeMove(int direction);
    public native void destroyGame(long gamePtr);
    
    public GameEngine() {
        gamePtr = initGame();
    }
    
    public boolean move(int direction) {
        return makeMove(direction);
    }
    
    @Override
    protected void finalize() throws Throwable {
        destroyGame(gamePtr);
        super.finalize();
    }
}