# Manual Smoke Checklist

Run this checklist on Expo Go or an Android/iOS simulator before recording screenshots or demo video.

## Fresh Install

- [ ] Install dependencies with `npm install`.
- [ ] Start the app with `npm run start`.
- [ ] Open the app in Expo Go or a simulator.
- [ ] Confirm the Home tab opens without starter/template content.
- [ ] Confirm seeded exercises are visible.

## Workout Setup

- [ ] Create a new workout.
- [ ] Add seeded exercises to the workout.
- [ ] Remove an exercise from the workout and confirm the list updates.
- [ ] Re-add the exercise and confirm there is no duplicate.

## Custom Exercise

- [ ] Create a custom exercise.
- [ ] Select up to three muscle tags.
- [ ] Attach an image from the photo library.
- [ ] Save the exercise and confirm it appears in the exercise list.
- [ ] Restart the app and confirm the image still renders.

## Workout Logging

- [ ] Open a workout.
- [ ] Tap Start Workout.
- [ ] Open an exercise.
- [ ] Add a set.
- [ ] Enter reps and weight.
- [ ] Mark the set complete.
- [ ] Return to the workout in progress and confirm the data is preserved.
- [ ] Finish the workout.
- [ ] Confirm the workout details show last workout information.
- [ ] Restart the app and confirm recent log data still appears.

## Cancel Flow

- [ ] Start a workout.
- [ ] Enter at least one set.
- [ ] Tap back or close from the workout screen.
- [ ] Confirm the discard prompt appears.
- [ ] Keep going and confirm data remains.
- [ ] Discard and confirm the session resets.

## Quality Gates

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
