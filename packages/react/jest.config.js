/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
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
                    jsx: 'react-jsx',
                    lib: ['es2022', 'dom'],
                },
            },
        ],
    },
    testPathIgnorePatterns: [
        '<rootDir>/dist/',
    ],
};
