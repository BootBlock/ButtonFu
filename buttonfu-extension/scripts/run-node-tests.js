const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const testDir = path.resolve(__dirname, '..', '.test-out', 'test');

function getCompiledTestFiles() {
    if (!fs.existsSync(testDir)) {
        throw new Error(`Compiled test directory not found: ${testDir}`);
    }

    return fs.readdirSync(testDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.test.js'))
        .map((entry) => path.join(testDir, entry.name))
        .sort();
}

function main() {
    const testFiles = getCompiledTestFiles();
    if (testFiles.length === 0) {
        throw new Error(`No compiled test files found in ${testDir}`);
    }

    const result = childProcess.spawnSync(process.execPath, ['--test', ...testFiles], {
        stdio: 'inherit'
    });

    if (result.error) {
        throw result.error;
    }

    process.exit(result.status ?? 1);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}