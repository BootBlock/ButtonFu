const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

// Build number management (shared with installer)
const buildInfoPath = path.join(__dirname, '..', 'Installer', 'Version.Build.txt');
function getBuildNumber() {
    let buildNumber = 0;
    if (fs.existsSync(buildInfoPath)) {
        try {
            const content = fs.readFileSync(buildInfoPath, 'utf-8').trim();
            buildNumber = parseInt(content, 10);
            if (isNaN(buildNumber)) buildNumber = 0;
        } catch (e) {
            buildNumber = 0;
        }
    }
    return buildNumber;
}

// Get version from package.json
function getVersion() {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
        return pkg.version || '0.0.0';
    } catch (e) {
        return '0.0.0';
    }
}

async function main() {
    const buildNumber = getBuildNumber();
    const buildTime = new Date();
    const buildTimeFormatted = buildTime.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const version = getVersion();

    console.log(`Building ButtonFu Extension - Build #${buildNumber} at ${buildTimeFormatted}`);

    const ctx = await esbuild.context({
        entryPoints: ['src/extension.ts'],
        bundle: true,
        format: 'cjs',
        minify: production,
        sourcemap: !production,
        sourcesContent: false,
        platform: 'node',
        outfile: 'out/extension.js',
        external: ['vscode'],
        logLevel: 'info',
        define: {
            'BUILD_NUMBER': buildNumber.toString(),
            'BUILD_TIME': JSON.stringify(buildTimeFormatted),
            'BUILD_TIME_ISO': JSON.stringify(buildTime.toISOString()),
            'BUILD_VERSION': JSON.stringify(version)
        },
        plugins: [],
    });
    if (watch) {
        await ctx.watch();
    } else {
        await ctx.rebuild();
        await ctx.dispose();
        // Log content hash so developers can verify builds are fresh
        const outFile = path.join(__dirname, 'out', 'extension.js');
        if (fs.existsSync(outFile)) {
            const hash = crypto.createHash('sha256').update(fs.readFileSync(outFile)).digest('hex').slice(0, 12);
            console.log(`Output hash: ${hash}  out/extension.js`);
        }
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
