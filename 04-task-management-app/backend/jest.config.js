const path = require('path');

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/../tests'],
  testMatch: ['<rootDir>/../tests/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      },
    ],
  },
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', path.resolve(__dirname, 'node_modules')],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@nestjs/(.*)$': '<rootDir>/node_modules/@nestjs/$1',
    '^bcryptjs$': '<rootDir>/node_modules/bcryptjs',
  },
};
