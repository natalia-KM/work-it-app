ALTER TABLE `Exercise` ADD `instructions` text;--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `isOptional` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `sortOrder` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `targetSets` integer;--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `targetReps` integer;--> statement-breakpoint
ALTER TABLE `Workout_Exercise` ADD `targetWeight` real;--> statement-breakpoint
ALTER TABLE `WorkoutLog` ADD `source` text;