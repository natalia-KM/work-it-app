CREATE TABLE `ActiveWorkoutDraft` (
	`id` integer PRIMARY KEY NOT NULL,
	`workoutId` integer NOT NULL,
	`workoutTitle` text,
	`startedAt` integer NOT NULL,
	`exerciseData` text NOT NULL,
	`currentExerciseId` integer,
	`currentExerciseDetails` text NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON UPDATE no action ON DELETE no action
);
