CREATE TABLE licenses
(
  id              TEXT PRIMARY KEY NOT NULL,
  name            TEXT             NOT NULL,
  text            TEXT             NOT NULL,
  comments        TEXT,
  external_id     TEXT             NOT NULL,
  is_osi_approved TINYINT          NOT NULL,
  is_fsf_libre    TINYINT          NOT NULL
);

CREATE TABLE license_groups
(
  id   TEXT PRIMARY KEY NOT NULL,
  name TEXT             NOT NULL,
  risk INTEGER          NOT NULL
);

CREATE TABLE license_license_groups
(
  license_group_id TEXT NOT NULL,
  license_id       TEXT NOT NULL,

  PRIMARY KEY (license_group_id, license_id),

  FOREIGN KEY (license_group_id) REFERENCES license_groups (id) ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY (license_id) REFERENCES licenses (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE TABLE repository
(
  id          TEXT    NOT NULL,
  url         TEXT    NOT NULL,
  name        TEXT    NOT NULL,
  is_archived TINYINT NOT NULL
);

CREATE TABLE dependency
(
  id                   TEXT NOT NULL,
  name                 TEXT NOT NULL,
  version              TEXT NOT NULL,
  supplier             TEXT NOT NULL,
  license_declared_id  TEXT,
  license_concluded_id TEXT,

  PRIMARY KEY (name, version),

  FOREIGN KEY (license_declared_id) REFERENCES licenses (id) ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY (license_concluded_id) REFERENCES licenses (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE TABLE repository_dependency
(
  repository_id TEXT NOT NULL,
  dependency_id TEXT NOT NULL,

  PRIMARY KEY (repository_id, dependency_id)
);