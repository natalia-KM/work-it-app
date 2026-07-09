# Screenshots

Capture screenshots from Expo Go or an Android/iOS simulator.

Recommended files:

- `dashboard.png` - Home dashboard with recent workouts.
- `workout-details.png` - Workout detail screen with exercise summaries.
- `current-workout.png` - Workout in progress.
- `exercise-sets.png` - Set entry screen with reps and weight.
- `custom-exercise.png` - Custom exercise form with image upload.

Expo web was tested during cleanup and is not the recommended capture path. The web build currently fails on the `expo-sqlite` WASM dependency resolution, so screenshots should come from the intended mobile runtime.
