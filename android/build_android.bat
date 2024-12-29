@echo off
REM 创建目录
mkdir ..\android\app\src\main\jniLibs\arm64-v8a
mkdir ..\android\app\src\main\jniLibs\armeabi-v7a
mkdir ..\android\app\src\main\jniLibs\x86
mkdir ..\android\app\src\main\jniLibs\x86_64

REM 编译并复制 arm64-v8a
cargo build --target aarch64-linux-android --features android
copy target\aarch64-linux-android\debug\libgame2048_core.so ..\android\app\src\main\jniLibs\arm64-v8a\

REM 编译并复制 armeabi-v7a
cargo build --target armv7-linux-androideabi --features android
copy target\armv7-linux-androideabi\debug\libgame2048_core.so ..\android\app\src\main\jniLibs\armeabi-v7a\

REM 编译并复制 x86
cargo build --target i686-linux-android --features android
copy target\i686-linux-android\debug\libgame2048_core.so ..\android\app\src\main\jniLibs\x86\

REM 编译并复制 x86_64
cargo build --target x86_64-linux-android --features android
copy target\x86_64-linux-android\debug\libgame2048_core.so ..\android\app\src\main\jniLibs\x86_64\

echo 所有目标架构的库文件已编译并复制完成！