-- Disable the enforcement of foreign-keys constraints
PRAGMA foreign_keys = off;
-- Create "new_repository_dependency" table
CREATE TABLE `new_repository_dependency` (
  `repository_scan_id` text NOT NULL,
  `dependency_name` text NOT NULL,
  `dependency_version` text NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`repository_scan_id`, `dependency_name`, `dependency_version`),
  CONSTRAINT `0` FOREIGN KEY (`dependency_name`, `dependency_version`) REFERENCES `dependency` (`name`, `version`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`repository_scan_id`) REFERENCES `repository_scan` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "repository_dependency" to new temporary table "new_repository_dependency"
INSERT INTO `new_repository_dependency` (`repository_scan_id`, `dependency_name`, `dependency_version`, `created_at`, `updated_at`) SELECT `repository_scan_id`, `dependency_name`, `dependency_version`, `created_at`, `updated_at` FROM `repository_dependency`;
-- Drop "repository_dependency" table after copying rows
DROP TABLE `repository_dependency`;
-- Rename temporary table "new_repository_dependency" to "repository_dependency"
ALTER TABLE `new_repository_dependency` RENAME TO `repository_dependency`;
-- Create index "idx_repository_dependency_repository_scan_id" to table: "repository_dependency"
CREATE INDEX `idx_repository_dependency_repository_scan_id` ON `repository_dependency` (`repository_scan_id`);
-- Create index "idx_repository_dependency_dependency_name_version" to table: "repository_dependency"
CREATE INDEX `idx_repository_dependency_dependency_name_version` ON `repository_dependency` (`dependency_name`, `dependency_version`);
-- Enable back the enforcement of foreign-keys constraints
PRAGMA foreign_keys = on;
