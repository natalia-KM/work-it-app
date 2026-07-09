CREATE TABLE `WorkoutLog_Exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workoutLogId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`details` text,
	`notes` text,
	`restTime` integer NOT NULL,
	`bestAchieved` integer,
	FOREIGN KEY (`workoutLogId`) REFERENCES `WorkoutLog`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `WorkoutLog` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workoutId` integer NOT NULL,
	`date` integer,
	`duration` integer,
	FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `bestAchieved` integer;--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `lastCompleted` integer;