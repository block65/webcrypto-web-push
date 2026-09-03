CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY,
	`endpoint` text NOT NULL,
	`expirationTime` integer,
	`keys` jsonb NOT NULL
);
