import {validSBOMPackage} from "@/lib/data-loaders/spdx-data-loader"
import {describe, expect, it} from "@jest/globals"

describe("lib/data-loaders/spdx-data-loader", () => {
  describe("validSBOMPackage", () => {
    it("handles github actions", () => {
      expect(
        validSBOMPackage.safeParse({
          name: "actions/download-artifact",
          SPDXID: "SPDXRef-githubactions-actions-download-artifact-1..-75c946",
          versionInfo: "1.*.*",
          downloadLocation: "NOASSERTION",
          filesAnalyzed: false,
          externalRefs: [
            {
              referenceCategory: "PACKAGE-MANAGER",
              referenceType: "purl",
              referenceLocator:
                "pkg:githubactions/actions/download-artifact@1.%2A.%2A",
            },
          ],
        }),
      ).toStrictEqual({
        success: true,
        data: {
          name: "actions/download-artifact",
          versionInfo: "1.*.*",
          SPDXID: "SPDXRef-githubactions-actions-download-artifact-1..-75c946",
          externalRefs: [
            {
              referenceCategory: "PACKAGE-MANAGER",
              referenceType: "purl",
              referenceLocator:
                "pkg:githubactions/actions/download-artifact@1.%2A.%2A",
            },
          ],
        },
      })
    })

    it("handles git repos", () => {
      expect(
        validSBOMPackage.safeParse({
          name: "com.github.mnahkies/ephemeral-postgres",
          SPDXID: "SPDXRef-github-mnahkies-ephemeral-postgres-main-3ad9e0",
          versionInfo: "main",
          downloadLocation:
            "git+https://github.com/mnahkies/ephemeral-postgres",
          filesAnalyzed: false,
          licenseDeclared: "MIT",
          externalRefs: [
            {
              referenceCategory: "PACKAGE-MANAGER",
              referenceType: "purl",
              referenceLocator: "pkg:github/mnahkies/ephemeral-postgres@main",
            },
          ],
        }),
      ).toStrictEqual({
        success: true,
        data: {
          SPDXID: "SPDXRef-github-mnahkies-ephemeral-postgres-main-3ad9e0",
          name: "com.github.mnahkies/ephemeral-postgres",
          versionInfo: "main",
          licenseDeclared: "MIT",
          externalRefs: [
            {
              referenceCategory: "PACKAGE-MANAGER",
              referenceType: "purl",
              referenceLocator: "pkg:github/mnahkies/ephemeral-postgres@main",
            },
          ],
        },
      })
    })

    it("handles pypi", () => {
      expect(
        validSBOMPackage.safeParse({
          name: "scipy",
          SPDXID: "SPDXRef-pypi-scipy-75c946",
          downloadLocation: "NOASSERTION",
          filesAnalyzed: false,
          externalRefs: [
            {
              referenceCategory: "PACKAGE-MANAGER",
              referenceType: "purl",
              referenceLocator: "pkg:pypi/scipy",
            },
          ],
        }),
      ).toStrictEqual({
        success: true,
        data: {
          SPDXID: "SPDXRef-pypi-scipy-75c946",
          name: "scipy",
          externalRefs: [
            {
              referenceCategory: "PACKAGE-MANAGER",
              referenceType: "purl",
              referenceLocator: "pkg:pypi/scipy",
            },
          ],
        },
      })
    })
  })
})
