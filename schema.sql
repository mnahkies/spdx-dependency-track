CREATE TABLE licenses
(
  id              TEXT PRIMARY KEY                   NOT NULL,
  name            TEXT                               NOT NULL,
  text            TEXT                               NOT NULL,
  comments        TEXT,
  external_id     TEXT                               NOT NULL,
  is_osi_approved TINYINT                            NOT NULL,
  is_fsf_libre    TINYINT                            NOT NULL,

  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE license_groups
(
  id         TEXT PRIMARY KEY                   NOT NULL,
  name       TEXT                               NOT NULL,
  risk       INTEGER                            NOT NULL,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE license_license_groups
(
  license_group_id TEXT                               NOT NULL,
  license_id       TEXT                               NOT NULL,

  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  PRIMARY KEY (license_group_id, license_id),

  FOREIGN KEY (license_group_id) REFERENCES license_groups (id) ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY (license_id) REFERENCES licenses (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE TABLE repository
(
  id          TEXT PRIMARY KEY                   NOT NULL,
  url         TEXT                               NOT NULL,
  name        TEXT                               NOT NULL UNIQUE,
  is_archived TINYINT                            NOT NULL,

  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE repository_scan
(
  id            TEXT PRIMARY KEY                   NOT NULL,
  scanned_at    TEXT                               NOT NULL,
  repository_id TEXT                               NOT NULL,

  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  FOREIGN KEY (repository_id) REFERENCES repository (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX idx_repository_scan_repository_id ON repository_scan (repository_id);


CREATE TABLE dependency
(
  id                   TEXT                               NOT NULL,
  name                 TEXT                               NOT NULL,
  version              TEXT,
  supplier             TEXT,
  license_declared_id  TEXT,
  license_concluded_id TEXT,

  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  PRIMARY KEY (name, version),

  FOREIGN KEY (license_declared_id) REFERENCES licenses (id) ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY (license_concluded_id) REFERENCES licenses (id) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX idx_dependency_license_declared_id ON dependency (license_declared_id);
CREATE INDEX idx_dependency_license_concluded_id ON dependency (license_concluded_id);

CREATE TABLE repository_dependency
(
  repository_scan_id TEXT                               NOT NULL,
  dependency_name    TEXT                               NOT NULL,
  dependency_version TEXT,

  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,

  PRIMARY KEY (repository_scan_id, dependency_name, dependency_version),

  FOREIGN KEY (repository_scan_id) REFERENCES repository_scan (id) ON UPDATE RESTRICT ON DELETE CASCADE,
  FOREIGN KEY (dependency_name, dependency_version) REFERENCES dependency (name, version) ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE INDEX idx_repository_dependency_repository_scan_id ON repository_dependency (repository_scan_id);
CREATE INDEX idx_repository_dependency_dependency_name_version ON repository_dependency (dependency_name, dependency_version);
