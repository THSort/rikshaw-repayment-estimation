# Rickshaw App - Repayment Estimator

A minimal Expo (React Native) app that runs on Web and Android.

## Prerequisites
- Node.js 18+ and npm
- Expo tooling (installed via npm scripts automatically)
- For Android:
  - Android Studio with Android SDK and an emulator, or a physical Android device with USB debugging enabled
  - Ensure `adb` is available in your PATH (Android Studio sets this up)

## Theme and Language
- Dark theme only (forced via `app.json` and styles)
- Language: Urdu is the default with a toggle to English
  - Toggle is in the header: shows `EN` when Urdu is active, and `اردو` when English is active

## 1) Install dependencies
```bash
npm install
```

## 2) Start for Web
Runs the web dev server and opens the app in your browser.
```bash
npm run web
```
- Default dev server URL (Expo CLI UI): `http://localhost:8081` (may vary)
- Web app usually serves at `http://localhost:19006` (Expo web)

## 3) Start for Android
With an emulator running or a device connected via USB:
```bash
npm run android
```
- This will start the Metro server (if not already running) and launch the Android app in an emulator/device.

## Alternative: One server, then open targets
You can also start the dev server and choose targets from the Expo interface:
```bash
npm start
```
- Press `w` to open Web
- Press `a` to open Android

## Useful scripts
Defined in `package.json`:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

## Troubleshooting
- If Android build doesn’t launch:
  - Open Android Studio → start an Android Virtual Device (AVD) first
  - Or connect a physical device and run `adb devices` to confirm it’s detected
  - Ensure only one Metro server is running; if ports are stuck, kill old processes (19000, 19001, 19006)
- If web doesn’t open automatically:
  - Open the Expo Dev Tools page shown in the terminal (e.g., `http://localhost:8081`) and click “Open web”
  - Or manually open the web URL (commonly `http://localhost:19006`)
- If you see dependency/version warnings:
  - Run `rm -rf node_modules && npm install`
  - Clear Expo cache: `npx expo start -c`

## Project info
- Expo SDK: defined in `package.json` (expo `~53.x`)
- Entry points: `index.ts` (registers `App`), `App.tsx`
- TypeScript config: `tsconfig.json` (extends Expo base)
- i18n utility: `i18n.ts`; main UI text is localized in `App.tsx` and `components/RepaymentEstimator.tsx`

## Notes
- iOS is supported via `npm run ios` (requires Xcode on macOS), though this project is primarily targeted at Web and Android per instructions. 