# Rickshaw App - Repayment Estimator

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