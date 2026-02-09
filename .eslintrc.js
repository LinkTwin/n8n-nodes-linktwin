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
		// Allow the standalone checkApiResponse function pattern
		// (required because 'this' in execute() is IExecuteFunctions, not the class)
	},
};
