# Requirements

## Java
- Java 17 (JDK 17+)
  - Required for Gradle builds and Android compilation

---

## Android SDK
- Android SDK (latest stable)
  - Must be installed and accessible via ANDROID_HOME

---

## Android Command Line Tools
- Android SDK Command Line Tools (latest)
  - Required for SDK management and Gradle integration

---

## Platform Tools
- Android Platform Tools
  - Includes adb and fastboot

---

## Build Tools
- Android Build Tools 36.0.0 or compatible
  - Required for compiling and packaging the application

---

## Emulator (optional)
- Android Emulator
  - Required only for running virtual devices (AVD)

---

## Android NDK (optional)
- Android NDK 27.1.12297006 or compatible
  - Required only if the project includes native (C/C++) code

---

## Notes
- Environment variables like JAVA_HOME and ANDROID_HOME must be correctly configured.
- SDK components can be installed via sdkmanager.
- Version mismatches may cause build failures.