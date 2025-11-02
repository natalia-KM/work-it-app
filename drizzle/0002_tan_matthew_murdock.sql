CREATE TABLE `Workout_Exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workoutId` integer NOT NULL,
	`exerciseId` integer NOT NULL,
	`isArchived` integer DEFAULT 0 NOT NULL,
	`notes` text,
	FOREIGN KEY (`workoutId`) REFERENCES `Workout`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Workout` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Workout_title_unique` ON `Workout` (`title`);