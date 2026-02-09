const { src, dest } = require('gulp');

/**
 * Copy SVG icons to the dist folder
 * This ensures icons are available after TypeScript compilation
 * Using base: '.' preserves the directory structure (nodes/LinkTwin/icon.svg -> dist/nodes/LinkTwin/icon.svg)
 */
function buildIcons() {
	return src(['nodes/**/*.svg', 'credentials/**/*.svg', 'icons/**/*.svg'], { base: '.' })
		.pipe(dest('dist'));
}

exports['build:icons'] = buildIcons;
