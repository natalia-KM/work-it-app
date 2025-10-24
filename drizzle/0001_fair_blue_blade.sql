ALTER TABLE `Exercise_Tabs` RENAME TO `Exercise_MuscleTags`;--> statement-breakpoint
ALTER TABLE `Tabs` RENAME TO `MuscleTags`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Exercise_MuscleTags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exerciseId` integer NOT NULL,
	`tabId` integer NOT NULL,
	FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tabId`) REFERENCES `MuscleTags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_Exercise_MuscleTags`("id", "exerciseId", "tabId") SELECT "id", "exerciseId", "tabId" FROM `Exercise_MuscleTags`;--> statement-breakpoint
DROP TABLE `Exercise_MuscleTags`;--> statement-breakpoint
ALTER TABLE `__new_Exercise_MuscleTags` RENAME TO `Exercise_MuscleTags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `MuscleTags` ADD `muscleGroup` text NOT NULL;