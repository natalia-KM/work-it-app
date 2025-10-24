CREATE TABLE `Exercise` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`photo` text,
	`isCustom` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Exercise_title_unique` ON `Exercise` (`title`);--> statement-breakpoint
CREATE TABLE `Exercise_Tabs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exerciseId` integer NOT NULL,
	`tabId` integer NOT NULL,
	FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tabId`) REFERENCES `Tabs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Tabs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
