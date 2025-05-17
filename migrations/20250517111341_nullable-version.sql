-- Disable the enforcement of foreign-keys constraints
PRAGMA foreign_keys = off;
-- Create "new_dependency" table
CREATE TABLE `new_dependency` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `version` text NULL,
  `supplier` text NULL,
  `license_declared_id` text NULL,
  `license_concluded_id` text NULL,
  `created_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`name`, `version`),
  CONSTRAINT `0` FOREIGN KEY (`license_concluded_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`license_declared_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Copy rows from old table "dependency" to new temporary table "new_dependency"
INSERT INTO `new_dependency` (`id`, `name`, `version`, `supplier`, `license_declared_id`, `license_concluded_id`, `created_at`, `updated_at`) SELECT `id`, `name`, `version`, `supplier`, `license_declared_id`, `license_concluded_id`, `created_at`, `updated_at` FROM `dependency`;
-- Drop "dependency" table after copying rows
DROP TABLE `dependency`;
-- Rename temporary table "new_dependency" to "dependency"
ALTER TABLE `new_dependency` RENAME TO `dependency`;
-- Create index "idx_dependency_license_declared_id" to table: "dependency"
CREATE INDEX `idx_dependency_license_declared_id` ON `dependency` (`license_declared_id`);
-- Create index "idx_dependency_license_concluded_id" to table: "dependency"
CREATE INDEX `idx_dependency_license_concluded_id` ON `dependency` (`license_concluded_id`);
-- Enable back the enforcement of foreign-keys constraints
PRAGMA foreign_keys = on;
