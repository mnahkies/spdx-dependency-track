const inspector = require("node:inspector")

/**
 * @type { import('@jest/types').Config.GlobalConfig }
 */
const config = {
  projects: ["jest.base.js"],
  testTimeout: inspector.url() ? 5 * 60 * 1000 : 5 * 1000,
}

module.exports = config
