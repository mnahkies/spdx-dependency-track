/**
 * @type { import('@jest/types').Config.ProjectConfig }
 */
const config = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: "node",
  resetMocks: true,
  testMatch: ["**/*.spec.ts"],
  // Note: prettier is required for inline snapshot indentation to work correctly
  prettierPath: require.resolve("prettier"),
}

module.exports = config
