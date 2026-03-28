const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const extensionRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(extensionRoot, '..');

const packageFiles = [
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    'README_PIC1.png',
    'README_PIC2.png',
    'README_PIC3.png',
];

function sha256(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function syncFile(relativePath) {
    const sourcePath = path.join(repoRoot, relativePath);
    const destinationPath = path.join(extensionRoot, relativePath);

    if (!fs.existsSync(sourcePath)) {
        throw new Error(`Missing source file: ${sourcePath}`);
    }

    if (!fs.statSync(sourcePath).isFile()) {
        throw new Error(`Source is not a file: ${sourcePath}`);
    }

    fs.copyFileSync(sourcePath, destinationPath);

    const sourceHash = sha256(sourcePath);
    const destinationHash = sha256(destinationPath);
    if (sourceHash !== destinationHash) {
        throw new Error(`Hash verification failed for ${relativePath}`);
    }

    console.log(`Synced ${relativePath}`);
}

function main() {
    console.log(`Syncing package files from ${repoRoot}`);
    for (const relativePath of packageFiles) {
        syncFile(relativePath);
    }
    console.log(`Verified ${packageFiles.length} package files from repo root`);
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}