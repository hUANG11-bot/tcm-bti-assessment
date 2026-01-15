CREATE TABLE `invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inviterId` int NOT NULL,
	`inviteeId` int,
	`inviteCode` varchar(32) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `invitations_inviteCode_unique` UNIQUE(`inviteCode`)
);
