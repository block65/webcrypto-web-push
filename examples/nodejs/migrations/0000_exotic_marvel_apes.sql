CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`expirationTime` integer,
	`keys` jsonb NOT NULL
);
