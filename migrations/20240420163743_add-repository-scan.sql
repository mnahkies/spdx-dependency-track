-- Disable the enforcement of foreign-keys constraints
PRAGMA foreign_keys = off;
-- Create "new_repository_dependency" table
CREATE TABLE `new_repository_dependency` (
  `repository_scan_id` text NOT NULL,
  `dependency_name` text NOT NULL,
  `dependency_version` text NOT NULL,
  PRIMARY KEY (`repository_scan_id`, `dependency_name`, `dependency_version`),
  CONSTRAINT `0` FOREIGN KEY (`dependency_name`, `dependency_version`) REFERENCES `dependency` (`name`, `version`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`repository_scan_id`) REFERENCES `repository_scan` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "repository_dependency" to new temporary table "new_repository_dependency"
INSERT INTO `new_repository_dependency` (`dependency_name`, `dependency_version`) SELECT `dependency_name`, `dependency_version` FROM `repository_dependency`;
-- Drop "repository_dependency" table after copying rows
DROP TABLE `repository_dependency`;
-- Rename temporary table "new_repository_dependency" to "repository_dependency"
ALTER TABLE `new_repository_dependency` RENAME TO `repository_dependency`;
-- Create "repository_scan" table
CREATE TABLE `repository_scan` (
  `id` text NOT NULL,
  `scanned_at` text NOT NULL,
  `repository_id` text NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`repository_id`) REFERENCES `repository` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Enable back the enforcement of foreign-keys constraints
PRAGMA foreign_keys = on;
