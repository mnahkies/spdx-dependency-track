-- Create "licenses" table
CREATE TABLE `licenses` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `text` text NOT NULL,
  `comments` text NULL,
  `external_id` text NOT NULL,
  `is_osi_approved` tinyint NOT NULL,
  `is_fsf_libre` tinyint NOT NULL,
  PRIMARY KEY (`id`)
);
-- Create "license_groups" table
CREATE TABLE `license_groups` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `risk` integer NOT NULL,
  PRIMARY KEY (`id`)
);
-- Create "license_license_groups" table
CREATE TABLE `license_license_groups` (
  `license_group_id` text NOT NULL,
  `license_id` text NOT NULL,
  PRIMARY KEY (`license_group_id`, `license_id`),
  CONSTRAINT `0` FOREIGN KEY (`license_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`license_group_id`) REFERENCES `license_groups` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Create "repository" table
CREATE TABLE `repository` (
  `id` text NOT NULL,
  `url` text NOT NULL,
  `name` text NOT NULL,
  `is_archived` tinyint NOT NULL
);
-- Create "dependency" table
CREATE TABLE `dependency` (
  `id` text NOT NULL,
  `name` text NOT NULL,
  `version` text NOT NULL,
  `supplier` text NOT NULL,
  `license_declared_id` text NULL,
  `license_concluded_id` text NULL,
  PRIMARY KEY (`name`, `version`),
  CONSTRAINT `0` FOREIGN KEY (`license_concluded_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`license_declared_id`) REFERENCES `licenses` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
);
-- Create "repository_dependency" table
CREATE TABLE `repository_dependency` (
  `repository_id` text NOT NULL,
  `dependency_id` text NOT NULL,
  PRIMARY KEY (`repository_id`, `dependency_id`)
);
