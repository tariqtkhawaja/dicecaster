/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    module: 'CommonJS',
                    moduleResolution: 'node',
                    esModuleInterop: true,
                    strict: true,
                    target: 'ES2022',
                },
            },
        ],
    },
    testPathIgnorePatterns: [
        '<rootDir>/dist/',
    ],
};
