const { src, dest, parallel } = require('gulp');

/**
 * Copy SVG icons to the dist folder
 * This ensures icons are available after TypeScript compilation
 * Using base: '.' preserves the directory structure (nodes/LinkTwin/icon.svg -> dist/nodes/LinkTwin/icon.svg)
 */
function buildIcons() {
	return src(['nodes/**/*.svg', 'credentials/**/*.svg', 'icons/**/*.svg'], { base: '.' })
		.pipe(dest('dist'));
}

/**
 * Copy node codex JSON files (e.g., LinkTwin.node.json) to the dist folder so
 * n8n can read them alongside the compiled node for category/resource metadata.
 */
function buildCodex() {
	return src(['nodes/**/*.node.json'], { base: '.' }).pipe(dest('dist'));
}

exports['build:icons'] = parallel(buildIcons, buildCodex);
