// This file is auto-generated during build. Do not edit manually.
// Build information is injected by the esbuild process.

export interface BuildInfo {
    buildNumber: number;
    buildTime: string;
    buildTimeIso: string;
    version: string;
}

// These values will be replaced by the esbuild define plugin
declare const BUILD_NUMBER: number;
declare const BUILD_TIME: string;
declare const BUILD_TIME_ISO: string;
declare const BUILD_VERSION: string;

export const buildInfo: BuildInfo = {
    buildNumber: typeof BUILD_NUMBER !== 'undefined' ? BUILD_NUMBER : 0,
    buildTime: typeof BUILD_TIME !== 'undefined' ? BUILD_TIME : 'Development',
    buildTimeIso: typeof BUILD_TIME_ISO !== 'undefined' ? BUILD_TIME_ISO : new Date().toISOString(),
    version: typeof BUILD_VERSION !== 'undefined' ? BUILD_VERSION : '0.0.0-dev'
};

export function getBuildInfoString(): string {
    return `v${buildInfo.version} (Build #${buildInfo.buildNumber})`;
}

export function getBuildTimeString(): string {
    return buildInfo.buildTime;
}
