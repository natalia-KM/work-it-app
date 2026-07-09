# Work It App

Work It is a local-first mobile workout tracker built with Expo and React Native. It lets you manage workouts, add library or custom exercises, attach exercise images, log sets during a workout, and review recent performance without an account or cloud backend.

## Core Features

- Create workouts with titles, notes, and colors.
- Add exercises from a seeded library or create custom exercises.
- Attach custom exercise images that are copied into app document storage.
- Import messy `.txt` workout notes through a local Node API powered by OpenAI structured outputs.
- Review imported workouts, exercises, setup cues, targets, and historical logs before saving.
- Start a workout session, enter sets, reps, and weight, and mark sets complete.
- Use a checklist-style workout flow with required, optional, completed, and skipped exercises.
- Finish or cancel an in-progress workout explicitly.
- Persist completed workout logs and per-exercise log rows in SQLite.
- Show last workout, last completed exercise date, best achieved set summary, and aggregate stats.
- Keep all data local on-device.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- Expo Router
- TypeScript
- SQLite via `expo-sqlite`
- Drizzle ORM
- React Query
- React Hook Form and Zod
- Zustand
- React Native Paper
- Tiny Node/Express import API
- OpenAI Responses API with structured outputs
- Vitest

## Screenshots

Screenshots should be captured from Expo Go or an Android/iOS simulator because the app uses `expo-sqlite` for local data. Expo web is intentionally not the demo target for this project.

Capture notes and target filenames are in [docs/screenshots/README.md](docs/screenshots/README.md).

## Run Locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm run start
```

Open Expo Go and scan the QR code, or launch an Android/iOS simulator from the Expo CLI.

### AI Notes Import API

The mobile app does not call OpenAI directly. Run the local import API separately and keep the OpenAI key in the Node process environment:

```bash
$env:OPENAI_API_KEY="your-api-key"
$env:OPENAI_MODEL="gpt-5.6-terra"
npm run import-api
```

If Expo is running on a physical device, set the app endpoint to a LAN-reachable URL before starting Expo:

```bash
$env:EXPO_PUBLIC_IMPORT_API_URL="http://YOUR-LAN-IP:8787"
npm run start
```

For an emulator on the same machine, `http://localhost:8787` may be enough depending on the platform.

## Quality Gates

Run the same checks used for this cleanup:

```bash
npm run lint
npm run typecheck
npm test
```

## Database And Migrations

The app stores data locally in SQLite and maps tables with Drizzle ORM.

Core tables:

- `Exercise`
- `MuscleTags`
- `Exercise_MuscleTags`
- `Workout`
- `Workout_Exercise`
- `WorkoutLog`
- `WorkoutLog_Exercise`

When changing `database/schema.ts`, generate a new migration:

```bash
npm run drizzle:generate
```

The seed routine creates default exercises and muscle tags, then resolves exercise/tag relationships by title and name so it does not depend on fixed inserted ids.

## Portfolio Notes

The project is framed as a local-first mobile fitness tracker. See [docs/portfolio-case-study.md](docs/portfolio-case-study.md) for the case study outline and architecture notes.

## Manual Smoke Test

Use [docs/manual-smoke-checklist.md](docs/manual-smoke-checklist.md) before recording screenshots or demo video.

## Known Limitations

- No authentication or cloud sync by design.
- Workout duration is tracked automatically from session start to finish.
- Removing exercises from workouts currently removes the relationship from active workout setup; historical logs are preserved separately.
- Expo web is not a supported demo path because the app depends on SQLite-backed mobile storage.
