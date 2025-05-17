-- Disable the enforcement of foreign-keys constraints
PRAGMA foreign_keys = off;
-- Create "new_licenses" table
CREATE TABLE `new_licenses` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `text` text NOT NULL,
  `comments` text NULL,
  `external_id` text NOT NULL,
  `is_osi_approved` tinyint NOT NULL,
  `is_fsf_libre` tinyint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`)
);
-- Copy rows from old table "licenses" to new temporary table "new_licenses"
INSERT INTO `new_licenses` (`id`, `name`, `text`, `comments`, `external_id`, `is_osi_approved`, `is_fsf_libre`) SELECT `id`, `name`, `text`, `comments`, `external_id`, `is_osi_approved`, `is_fsf_libre` FROM `licenses`;
-- Drop "licenses" table after copying rows
DROP TABLE `licenses`;
-- Rename temporary table "new_licenses" to "licenses"
ALTER TABLE `new_licenses` RENAME TO `licenses`;
-- Create "new_license_groups" table
CREATE TABLE `new_license_groups` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `risk` integer NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`)
);
-- Copy rows from old table "license_groups" to new temporary table "new_license_groups"
INSERT INTO `new_license_groups` (`id`, `name`, `risk`) SELECT `id`, `name`, `risk` FROM `license_groups`;
-- Drop "license_groups" table after copying rows
DROP TABLE `license_groups`;
-- Rename temporary table "new_license_groups" to "license_groups"
ALTER TABLE `new_license_groups` RENAME TO `license_groups`;
-- Create "new_license_license_groups" table
CREATE TABLE `new_license_license_groups` (
  `license_group_id` text NOT NULL,
  `license_id` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`license_group_id`, `license_id`),
  CONSTRAINT `0` FOREIGN KEY (`license_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`license_group_id`) REFERENCES `license_groups` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "license_license_groups" to new temporary table "new_license_license_groups"
INSERT INTO `new_license_license_groups` (`license_group_id`, `license_id`) SELECT `license_group_id`, `license_id` FROM `license_license_groups`;
-- Drop "license_license_groups" table after copying rows
DROP TABLE `license_license_groups`;
-- Rename temporary table "new_license_license_groups" to "license_license_groups"
ALTER TABLE `new_license_license_groups` RENAME TO `license_license_groups`;
-- Create "new_repository" table
CREATE TABLE `new_repository` (
  `id` text NOT NULL,
  `url` text NOT NULL,
  `name` text NOT NULL,
  `is_archived` tinyint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`)
);
-- Copy rows from old table "repository" to new temporary table "new_repository"
INSERT INTO `new_repository` (`id`, `url`, `name`, `is_archived`) SELECT `id`, `url`, `name`, `is_archived` FROM `repository`;
-- Drop "repository" table after copying rows
DROP TABLE `repository`;
-- Rename temporary table "new_repository" to "repository"
ALTER TABLE `new_repository` RENAME TO `repository`;
-- Create index "repository_name" to table: "repository"
CREATE UNIQUE INDEX `repository_name` ON `repository` (`name`);
-- Create "new_dependency" table
CREATE TABLE `new_dependency` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `version` text NOT NULL,
  `supplier` text NOT NULL,
  `license_declared_id` text NULL,
  `license_concluded_id` text NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`name`, `version`),
  CONSTRAINT `0` FOREIGN KEY (`license_concluded_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`license_declared_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "dependency" to new temporary table "new_dependency"
INSERT INTO `new_dependency` (`id`, `name`, `version`, `supplier`, `license_declared_id`, `license_concluded_id`) SELECT `id`, `name`, `version`, `supplier`, `license_declared_id`, `license_concluded_id` FROM `dependency`;
-- Drop "dependency" table after copying rows
DROP TABLE `dependency`;
-- Rename temporary table "new_dependency" to "dependency"
ALTER TABLE `new_dependency` RENAME TO `dependency`;
-- Create index "idx_dependency_license_declared_id" to table: "dependency"
CREATE INDEX `idx_dependency_license_declared_id` ON `dependency` (`license_declared_id`);
-- Create index "idx_dependency_license_concluded_id" to table: "dependency"
CREATE INDEX `idx_dependency_license_concluded_id` ON `dependency` (`license_concluded_id`);
-- Create "new_repository_dependency" table
CREATE TABLE `new_repository_dependency` (
  `repository_scan_id` text NOT NULL,
  `dependency_name` text NOT NULL,
  `dependency_version` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`repository_scan_id`, `dependency_name`, `dependency_version`),
  CONSTRAINT `0` FOREIGN KEY (`dependency_name`, `dependency_version`) REFERENCES `dependency` (`name`, `version`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`repository_scan_id`) REFERENCES `repository_scan` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "repository_dependency" to new temporary table "new_repository_dependency"
INSERT INTO `new_repository_dependency` (`repository_scan_id`, `dependency_name`, `dependency_version`) SELECT `repository_scan_id`, `dependency_name`, `dependency_version` FROM `repository_dependency`;
-- Drop "repository_dependency" table after copying rows
DROP TABLE `repository_dependency`;
-- Rename temporary table "new_repository_dependency" to "repository_dependency"
ALTER TABLE `new_repository_dependency` RENAME TO `repository_dependency`;
-- Create index "idx_repository_dependency_repository_scan_id" to table: "repository_dependency"
CREATE INDEX `idx_repository_dependency_repository_scan_id` ON `repository_dependency` (`repository_scan_id`);
-- Create index "idx_repository_dependency_dependency_name_version" to table: "repository_dependency"
CREATE INDEX `idx_repository_dependency_dependency_name_version` ON `repository_dependency` (`dependency_name`, `dependency_version`);
-- Create "new_repository_scan" table
CREATE TABLE `new_repository_scan` (
  `id` text NOT NULL,
  `scanned_at` text NOT NULL,
  `repository_id` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`repository_id`) REFERENCES `repository` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "repository_scan" to new temporary table "new_repository_scan"
INSERT INTO `new_repository_scan` (`id`, `scanned_at`, `repository_id`) SELECT `id`, `scanned_at`, `repository_id` FROM `repository_scan`;
-- Drop "repository_scan" table after copying rows
DROP TABLE `repository_scan`;
-- Rename temporary table "new_repository_scan" to "repository_scan"
ALTER TABLE `new_repository_scan` RENAME TO `repository_scan`;
-- Create index "idx_repository_scan_repository_id" to table: "repository_scan"
CREATE INDEX `idx_repository_scan_repository_id` ON `repository_scan` (`repository_id`);
-- Enable back the enforcement of foreign-keys constraints
PRAGMA foreign_keys = on;
