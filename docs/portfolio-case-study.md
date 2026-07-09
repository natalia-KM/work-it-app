# Work It App Case Study

## Summary

Work It is a local-first mobile workout tracker for creating workout templates, logging completed sets, and reviewing recent progress. The goal is a focused portfolio mobile project that shows practical React Native architecture without adding accounts, cloud sync, or social features.

## Product Scope

Included:

- Workout creation and exercise selection.
- Seeded exercise library with muscle tags.
- Custom exercises with persisted local images.
- In-progress workout session state.
- Completed workout and exercise logs.
- Recent workout and exercise summaries.

Deliberately excluded:

- Authentication.
- Cloud sync.
- Social sharing.
- Paid app-store release workflow.

## Local-First Architecture

The app keeps user data on-device in SQLite. This keeps the demo simple to run and avoids external service setup. Drizzle ORM provides typed schema definitions and migration generation while `expo-sqlite` provides the device database runtime.

React Query is used around local database reads and writes so screens can use consistent loading, error, cache, and invalidation behavior. Query keys include entity ids where needed to avoid stale workout or exercise data.

## SQLite And Drizzle Model

The schema separates reusable setup data from completed log data:

- `Workout` stores workout templates.
- `Workout_Exercise` stores exercises assigned to a workout plus summary fields.
- `WorkoutLog` stores each completed workout.
- `WorkoutLog_Exercise` stores completed exercise details for that workout log.

Completed workout saves update both the immutable log rows and the summary fields used by the workout screens, such as `lastWorkout`, `lastCompleted`, and `bestAchieved`.

## Workout Session State

Zustand owns the active workout session:

- Selected workout id and title.
- Session start time.
- Exercise set rows with reps, weight, and completion state.
- Current exercise editing state.

The session can be finished, cancelled, or reset after persistence. Edits made on an exercise screen are saved back into the session before returning to the workout screen.

## Image Storage

Custom exercise images are copied into the app document directory before the database stores their URI. This avoids storing temporary picker URIs that may become invalid after restart. Replacing or deleting a custom exercise image removes the previous app-managed file.

## Quality Gates

The repo includes:

- ESLint via Expo.
- TypeScript type checking.
- Vitest unit tests for validation schemas, session store behavior, and log mapping.

Run:

```bash
npm run lint
npm run typecheck
npm test
```
