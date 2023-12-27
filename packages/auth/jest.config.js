const dotenv = require("dotenv");

dotenv.config({
    path: ".env.test"
});

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ["**/test/integration/*.test.ts"],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
};