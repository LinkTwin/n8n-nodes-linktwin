/**
 * ESLint configuration for n8n-nodes-linktwin
 * Uses the official n8n-nodes-base ESLint plugin for community node validation
 */
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		sourceType: 'module',
	},
	plugins: ['n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/nodes'],
	ignorePatterns: ['node_modules/', 'dist/', '*.js'],
	rules: {
		// n8n manual review (Mar 2026) requires NodeConnectionTypes.Main instead of
		// 'main' string literals. The lint plugin still enforces the old form, so
		// disable these two rules until the plugin catches up.
		'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
		'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
	},
};
