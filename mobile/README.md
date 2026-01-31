# SafeLink Africa — Mobile App

Expo (React Native) app with Home, SOS, and Profile screens. Uses the SafeLink Africa design system (Safe Teal, SOS Red, sky, ink).

## Run

```bash
cd mobile
npm install
npx expo start
```

Then:

- **Expo Go:** Scan the QR code with Expo Go (Android/iOS).
- **Android emulator:** Press `a` in the terminal.
- **iOS simulator:** Press `i` in the terminal (Mac only).

## SOS and the Emergency service

The SOS tab sends a one-tap alert to the Emergency service at `http://localhost:4002`. For a **physical device**, change `EMERGENCY_API` in `src/screens/SOSScreen.tsx` to your computer’s IP (e.g. `http://192.168.1.10:4002`) and ensure the device and computer are on the same network. Run the Emergency service with `npm run dev` from `services/emergency`.

## Structure

- `App.tsx` — Tab navigator (Home, SOS, Profile)
- `src/theme/colors.ts` — Design tokens
- `src/screens/HomeScreen.tsx` — Welcome and quick actions
- `src/screens/SOSScreen.tsx` — One-tap SOS (calls Emergency API)
- `src/screens/ProfileScreen.tsx` — Profile placeholder
