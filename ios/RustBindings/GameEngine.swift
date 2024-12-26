// ios/RustBindings/GameEngine.swift
import Foundation

class GameEngine {
    private var gamePtr: OpaquePointer?
    
    init() {
        gamePtr = game_init()
    }
    
    func makeMove(_ direction: Int32) -> Bool {
        return game_make_move(gamePtr, direction)
    }
    
    deinit {
        game_destroy(gamePtr)
    }
}

private extension GameEngine {
    @_cdecl("game_init")
    static func game_init() -> OpaquePointer?
    
    @_cdecl("game_make_move")
    static func game_make_move(_ ptr: OpaquePointer?, _ direction: Int32) -> Bool
    
    @_cdecl("game_destroy")
    static func game_destroy(_ ptr: OpaquePointer?)
}