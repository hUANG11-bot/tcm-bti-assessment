CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`age` int NOT NULL,
	`gender` varchar(10) NOT NULL,
	`habits` text NOT NULL,
	`answers` text NOT NULL,
	`primaryType` varchar(50) NOT NULL,
	`secondaryType` varchar(50),
	`scores` text NOT NULL,
	`fullReport` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
