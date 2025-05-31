-- name: insertLicense
INSERT INTO licenses(id,
                     name,
                     text,
                     comments,
                     external_id,
                     is_osi_approved,
                     is_fsf_libre)
VALUES (:id,
        :name,
        :text,
        :comments,
        :external_id,
        :is_osi_approved,
        :is_fsf_libre)
ON CONFLICT DO NOTHING;

-- name: insertLicenseGroup
INSERT INTO license_groups(id, name, risk)
VALUES (:id,
        :name,
        :risk)
ON CONFLICT DO NOTHING;

-- name: associateLicenseWithGroup
INSERT INTO license_license_groups(license_group_id, license_id)
VALUES (:licenseGroupId, :licenseId)
ON CONFLICT DO NOTHING;

-- name: getLicenses :many
SELECT l.external_id,
       l.name,
       l.id,
       lg.name AS group_name,
       lg.risk
FROM license_license_groups llg
       JOIN licenses l ON llg.license_id = l.id
       JOIN license_groups lg ON llg.license_group_id = lg.id
ORDER BY lg.risk DESC, lg.name
