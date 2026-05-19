/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^../../../sdk$": "<rootDir>/../../sdk.ts",
    "^../../sdk$": "<rootDir>/../../sdk.ts",
    "^../../../../server-sdk$": "<rootDir>/../../server-sdk.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { module: "commonjs" } }],
  },
};

module.exports = config;
