-- Create index "idx_dependency_license_declared_id" to table: "dependency"
CREATE INDEX `idx_dependency_license_declared_id` ON `dependency` (`license_declared_id`);
-- Create index "idx_dependency_license_concluded_id" to table: "dependency"
CREATE INDEX `idx_dependency_license_concluded_id` ON `dependency` (`license_concluded_id`);
-- Create index "idx_repository_dependency_repository_scan_id" to table: "repository_dependency"
CREATE INDEX `idx_repository_dependency_repository_scan_id` ON `repository_dependency` (`repository_scan_id`);
-- Create index "idx_repository_dependency_dependency_name_version" to table: "repository_dependency"
CREATE INDEX `idx_repository_dependency_dependency_name_version` ON `repository_dependency` (`dependency_name`, `dependency_version`);
-- Create index "idx_repository_scan_repository_id" to table: "repository_scan"
CREATE INDEX `idx_repository_scan_repository_id` ON `repository_scan` (`repository_id`);
