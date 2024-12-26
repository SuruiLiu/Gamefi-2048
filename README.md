# Gamefi-2048

Rust Version. I hope to make an APP across mobile platforms.

## Project Structure

```
Game2048/
├── .cargo/
│   └── config.toml          # Rust build configuration
├── rust/                    # Rust core logic
│   ├── Cargo.toml          # Rust project configuration
│   └── src/
│       ├── lib.rs          # Library entry point
│       ├── game.rs         # Game logic
│       ├── web3.rs         # Web3 integration
│       └── bindings/       # FFI bindings
│           ├── mod.rs      # Binding module
│           ├── android.rs  # Android bindings
│           └── ios.rs      # iOS bindings
├── android/
│   └── app/
│       ├── build.gradle    # Android build configuration
│       └── src/main/
│           ├── java/       # Java native code
│           └── jniLibs/    # Native libraries
├── ios/
│   └── RustBindings/       # iOS native bindings
└── src/                    # React Native code
    ├── components/         # UI components
    ├── bridges/            # JavaScript bridges for native modules
    ├── screens/            # Screens
    ├── types/              # TypeScript types
    └── utils/              # Utility functions
```

## Features

- **Rust-powered backend**: Efficient and secure implementation of the game logic and Web3 integrations.
- **Cross-platform support**: Native bindings for both Android and iOS.
- **React Native frontend**: Modern and interactive user interface.
- **Web3 support**: Integration with wallets and NFT functionalities.

## Getting Started

### Prerequisites

1. Rust (Nightly toolchain is required):
   ```bash
   rustup install nightly
   rustup default nightly
   ```
2. Node.js (16 or later) and npm:
   ```bash
   node -v
   npm -v
   ```
3. React Native CLI:
   ```bash
   npm install -g react-native-cli
   ```
4. Android Studio and Xcode for native development.

### Setup Instructions

1. Clone the repository:

   ```bash
   git clone git@github.com:SuruiLiu/Gamefi-2048.git
   cd Gamefi-2048
   ```

2. Build Rust libraries for Android and iOS:

   ```bash
   # Android
   cd rust
   cargo build --target aarch64-linux-android --features android

   # iOS
   cargo build --target aarch64-apple-ios --features ios
   ```

3. Install React Native dependencies:

   ```bash
   cd ..
   npm install
   ```

4. Run the application:

   ```bash
   # Android
   react-native run-android

   # iOS
   react-native run-ios
   ```

## Native Integration

### Android Module

The Android module bridges Rust game logic with React Native:

- **Path**: `android/app/src/main/java/com/game2048/GameModule.java`
- Sample implementation:
  ```java
  public class GameModule extends ReactContextBaseJavaModule {
      static {
          System.loadLibrary("game2048_core");
      }

      @ReactMethod
      public void makeMove(String direction, Promise promise) {
          // Call Rust FFI methods here
      }
  }
  ```

### iOS Module

The iOS module enables communication between React Native and Rust:

- **Path**: `ios/RustBindings/GameModule.swift`
- Sample implementation:
  ```swift
  @objc(GameModule)
  class GameModule: NSObject {
      @objc
      func makeMove(_ direction: String, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
          // Call Rust FFI methods here
      }
  }
  ```

## Testing

### Rust Integration Tests

Add integration tests in `rust/tests/integration_tests.rs`:

```rust
#[test]
fn test_game_move() {
    let result = make_move("up");
    assert!(result.is_ok());
}
```

### React Native Unit Tests

Add JavaScript/TypeScript tests in `src/__tests__/GameEngine.test.ts`:

```typescript
describe("GameEngine", () => {
    it("should handle moves correctly", () => {
        const result = GameEngine.makeMove("up");
        expect(result).toBeTruthy();
    });
});
```