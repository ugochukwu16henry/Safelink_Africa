# SafeLink Africa — Mobile App

Expo (React Native) app with Home, SOS, and Profile. **Auth:** log in / sign up; token and user are stored; SOS uses your user ID when signed in.

## Run

```bash
cd mobile
npm install
npx expo start
```

Then:

- **Browser (easiest):** Press `w` in the terminal to open the app in your browser. No phone or emulator needed.
- **Expo Go:** Scan the QR code with Expo Go (Android/iOS).
- **Android emulator:** Press `a` (requires Android SDK).
- **iOS simulator:** Press `i` (Mac only).

## Auth and APIs

**Auth:** Log in or sign up; token and user are stored (AsyncStorage). When signed in, SOS sends your user ID. **API URLs** in `src/config/api.ts` (AUTH_API: 4001, EMERGENCY_API: 4002). On a physical device, use your machine IP. For a **physical device**, change `EMERGENCY_API` in `src/screens/SOSScreen.tsx` to your computer’s IP (e.g. `http://192.168.1.10:4002`) and ensure the device and computer are on the same network. Run the Emergency service with `npm run dev` from `services/emergency`.

## Structure

- `App.tsx` — AuthProvider; tabs when signed in, Auth stack (Login/Register) when not
- `src/context/AuthContext.tsx` — Auth state, login, register, logout
- `src/config/api.ts` — AUTH_API, EMERGENCY_API
- `src/screens/LoginScreen.tsx`, `RegisterScreen.tsx` — Auth flow
- `src/screens/SOSScreen.tsx` — One-tap SOS (uses user.id when signed in)
- `src/screens/ProfileScreen.tsx` — User info and Log out
