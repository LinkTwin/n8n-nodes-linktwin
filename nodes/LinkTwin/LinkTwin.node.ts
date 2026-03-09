import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';

/**
 * Check API response for errors.
 * LinkTwin API returns HTTP 200 with error info in the body.
 */
function checkApiResponse(response: IDataObject): void {
	if (response.error != 0) {
		throw new ApplicationError((response.message as string) || 'Unknown API error');
	}
}

/**
 * LinkTwin n8n Node
 *
 * Turn any link into a smart deep link that opens directly in the right app
 * (YouTube, Amazon, Spotify & 100+ apps) or in the user's external browser.
 * Track clicks with geo, device & referrer analytics.
 *
 * API Base URL: https://linktw.in/api
 * Authentication: Bearer token (API key)
 *
 * Operations:
 * - Deep Links: Create, Get, List, Update, Delete
 * - Analytics: Get Link Statistics
 */
export class LinkTwin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LinkTwin - Deep Linking & URL Shortener',
		name: 'linkTwin',
		icon: 'file:linktwin.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Turn any link into a smart deep link that opens directly in the right app (YouTube, Amazon, Spotify & 100+ apps) or external browser, boosting clicks and conversions',
		defaults: {
			name: 'LinkTwin - Deep Linking & URL Shortener',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'linkTwinApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://linktw.in/api',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ----------------------------------
			//         Resource Selection
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Deep Link',
						value: 'deepLink',
						description: 'Create and manage smart deep links',
					},
					{
						name: 'Statistic',
						value: 'statistics',
						description: 'Get click analytics for deep links',
					},
				],
				default: 'deepLink',
			},

			// ----------------------------------
			//         Deep Link Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['deepLink'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Turn any URL into a smart deep link',
						action: 'Create a deep link',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a deep link',
						action: 'Delete a deep link',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get details of a deep link',
						action: 'Get a deep link',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all deep links',
						action: 'List deep links',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing deep link',
						action: 'Update a deep link',
					},
				],
				default: 'create',
			},

			// ----------------------------------
			//         Statistics Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['statistics'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get click statistics for a deep link',
						action: 'Get link statistics',
					},
				],
				default: 'get',
			},

			// ----------------------------------
			//         Deep Link: Create
			// ----------------------------------
			{
				displayName: 'Destination URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://youtube.com/watch?v=...',
				description: 'The URL to turn into a smart deep link. LinkTwin detects the app and creates a link that opens directly in the right app or external browser.',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Custom Alias',
				name: 'custom',
				type: 'string',
				default: '',
				placeholder: 'my-campaign',
				description: 'Custom alias for the short URL (e.g., "my-campaign" creates linktw.in/my-campaign). Leave empty for auto-generated.',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['create'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['create'],
					},
				},
				options: [
					{
						displayName: 'A/B Testing',
						name: 'abtesting',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'A/B test variants — each entry routes a percentage of traffic to a different URL',
						options: [
							{
								displayName: 'Variant',
								name: 'entries',
								values: [
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Destination URL for this variant',
									},
									{
										displayName: 'Percentage',
										name: 'percentage',
										type: 'number',
										default: 50,
										description: 'Percentage of traffic routed to this variant',
									},
								],
							},
						],
					},
					{
						displayName: 'Click Limit',
						name: 'clicklimit',
						type: 'number',
						default: 0,
						description: 'Maximum number of clicks before link expires (0 = unlimited)',
					},
					{
						displayName: 'Collection Names or IDs',
						name: 'collections',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
						},
						default: [],
						description: 'Collections to organize this link. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Custom Description',
						name: 'metadescription',
						type: 'string',
						default: '',
						description: 'Custom meta description for social sharing previews',
					},
					{
						displayName: 'Custom Image URL',
						name: 'metaimage',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/image.jpg',
						description: 'Custom image URL for social sharing previews (JPG or PNG)',
					},
					{
						displayName: 'Custom Parameters',
						name: 'parameters',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Custom query parameters appended to the destination URL on redirect',
						options: [
							{
								displayName: 'Parameter',
								name: 'entries',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Parameter name (e.g., utm_source)',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Parameter value (e.g., newsletter)',
									},
								],
							},
						],
					},
					{
						displayName: 'Custom Title',
						name: 'metatitle',
						type: 'string',
						default: '',
						description: 'Custom meta title for social sharing previews',
					},
					{
						displayName: 'Device Targeting',
						name: 'devicetarget',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Redirect users to different URLs based on their device type',
						options: [
							{
								displayName: 'Target',
								name: 'entries',
								values: [
									{
										displayName: 'Device',
										name: 'device',
										type: 'options',
										options: [
											{ name: 'Android', value: 'android' },
											{ name: 'iPad', value: 'ipad' },
											{ name: 'iPhone', value: 'iphone' },
											{ name: 'Linux', value: 'linux' },
											{ name: 'macOS', value: 'macos' },
											{ name: 'Windows', value: 'windows' },
										],
										default: 'android',
										description: 'Target device type',
									},
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Redirect URL for this device',
									},
								],
							},
						],
					},
					{
						displayName: 'Display Title',
						name: 'display_title',
						type: 'string',
						default: '',
						description: 'Custom title for organizing this link in your dashboard. This is for your reference only and does not affect og:title or the link preview.',
					},
					{
						displayName: 'Domain Name or ID',
						name: 'domain',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDomains',
						},
						default: '',
						description: 'Branded domain to use (leave empty for default linktw.in). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Expiration Redirect URL',
						name: 'expirationredirect',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/expired',
						description: 'URL to redirect to after the link expires',
					},
					{
						displayName: 'Expiry Date',
						name: 'expiry',
						type: 'dateTime',
						default: '',
						description: 'Date and time when the link should expire',
					},
					{
						displayName: 'Geo Targeting',
						name: 'geotarget',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Redirect users to different URLs based on their country',
						options: [
							{
								displayName: 'Target',
								name: 'entries',
								values: [
									{
										displayName: 'Country Code',
										name: 'country',
										type: 'string',
										default: '',
										placeholder: 'US',
										description: 'ISO 3166-1 alpha-2 country code (e.g., US, DE, FR)',
									},
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Redirect URL for visitors from this country',
									},
								],
							},
						],
					},
					{
						displayName: 'Internal Note',
						name: 'note',
						type: 'string',
						default: '',
						description: 'Internal note for this link (not visible to visitors)',
					},
					{
						displayName: 'Language Targeting',
						name: 'languagetarget',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Redirect users to different URLs based on their browser language',
						options: [
							{
								displayName: 'Target',
								name: 'entries',
								values: [
									{
										displayName: 'Language Code',
										name: 'language',
										type: 'string',
										default: '',
										placeholder: 'en',
										description: 'ISO 639-1 language code (e.g., en, de, fr)',
									},
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Redirect URL for visitors with this browser language',
									},
								],
							},
						],
					},
					{
						displayName: 'Password',
						name: 'password',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'Password to protect access to this link',
					},
					{
						displayName: 'Tracking Pixel Names or IDs',
						name: 'pixels',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getPixels',
						},
						default: [],
						description: 'Tracking pixels to attach (Facebook, Google, etc.). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
				],
			},

			// ----------------------------------
			//         Deep Link: Get
			// ----------------------------------
			{
				displayName: 'Link ID or Short URL',
				name: 'linkId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '5444983 or https://linktw.in/abc123',
				description: 'The numeric link ID or the full short URL',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['get'],
					},
				},
				options: [
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						placeholder: 'Europe/Berlin',
						description: 'Timezone for date data (e.g., America/New_York, Europe/London)',
					},
				],
			},

			// ----------------------------------
			//         Deep Link: List
			// ----------------------------------
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['list'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['list'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['list'],
					},
				},
				options: [
					{
						displayName: 'Collection Names or IDs',
						name: 'collections',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
						},
						default: [],
						description: 'Filter by specific collections. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Date From',
						name: 'date_from',
						type: 'dateTime',
						default: '',
						description: 'Filter links created on or after this date',
					},
					{
						displayName: 'Date To',
						name: 'date_to',
						type: 'dateTime',
						default: '',
						description: 'Filter links created on or before this date',
					},
					{
						displayName: 'Search',
						name: 'search',
						type: 'string',
						default: '',
						description: 'Search by alias, URL, title, or description',
					},
					{
						displayName: 'Sort Order',
						name: 'order',
						type: 'options',
						options: [
							{ name: 'Clicks (Least First)', value: 'clicks_asc' },
							{ name: 'Clicks (Most First)', value: 'clicks_desc' },
							{ name: 'Date (Default)', value: 'date' },
							{ name: 'Date (Newest First)', value: 'date_desc' },
							{ name: 'Date (Oldest First)', value: 'date_asc' },
							{ name: 'Name (A-Z)', value: 'name_asc' },
							{ name: 'Name (Z-A)', value: 'name_desc' },
						],
						default: 'date_desc',
						description: 'How to sort the results',
					},
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						placeholder: 'Europe/Berlin',
						description: 'Timezone for date filtering (e.g., America/New_York, Europe/London)',
					},
				],
			},

			// ----------------------------------
			//         Deep Link: Update
			// ----------------------------------
			{
				displayName: 'Link ID or Short URL',
				name: 'linkId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '5444983 or https://linktw.in/abc123',
				description: 'The numeric link ID or the full short URL to update',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['update'],
					},
				},
			},
			{
				displayName: 'Update Fields',
				name: 'updateFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['update'],
					},
				},
				options: [
					{
						displayName: 'A/B Testing',
						name: 'abtesting',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'A/B test variants — each entry routes a percentage of traffic to a different URL',
						options: [
							{
								displayName: 'Variant',
								name: 'entries',
								values: [
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Destination URL for this variant',
									},
									{
										displayName: 'Percentage',
										name: 'percentage',
										type: 'number',
										default: 50,
										description: 'Percentage of traffic routed to this variant',
									},
								],
							},
						],
					},
					{
						displayName: 'Click Limit',
						name: 'clicklimit',
						type: 'number',
						default: 0,
						description: 'Maximum number of clicks before link expires (0 = unlimited)',
					},
					{
						displayName: 'Collection Names or IDs',
						name: 'collections',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getCollections',
						},
						default: [],
						description: 'Replace collections (send empty to remove all). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Custom Alias',
						name: 'custom',
						type: 'string',
						default: '',
						placeholder: 'my-new-alias',
						description: 'New custom alias for the short URL',
					},
					{
						displayName: 'Custom Description',
						name: 'metadescription',
						type: 'string',
						default: '',
						description: 'Custom meta description for social sharing previews',
					},
					{
						displayName: 'Custom Image URL',
						name: 'metaimage',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/image.jpg',
						description: 'Custom image URL for social sharing previews (JPG or PNG)',
					},
					{
						displayName: 'Custom Parameters',
						name: 'parameters',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Custom query parameters appended to the destination URL on redirect',
						options: [
							{
								displayName: 'Parameter',
								name: 'entries',
								values: [
									{
										displayName: 'Name',
										name: 'name',
										type: 'string',
										default: '',
										description: 'Parameter name (e.g., utm_source)',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Parameter value (e.g., newsletter)',
									},
								],
							},
						],
					},
					{
						displayName: 'Custom Title',
						name: 'metatitle',
						type: 'string',
						default: '',
						description: 'Custom meta title for social sharing previews',
					},
					{
						displayName: 'Destination URL',
						name: 'url',
						type: 'string',
						default: '',
						description: 'New destination URL',
					},
					{
						displayName: 'Device Targeting',
						name: 'devicetarget',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Redirect users to different URLs based on their device type',
						options: [
							{
								displayName: 'Target',
								name: 'entries',
								values: [
									{
										displayName: 'Device',
										name: 'device',
										type: 'options',
										options: [
											{ name: 'Android', value: 'android' },
											{ name: 'iPad', value: 'ipad' },
											{ name: 'iPhone', value: 'iphone' },
											{ name: 'Linux', value: 'linux' },
											{ name: 'macOS', value: 'macos' },
											{ name: 'Windows', value: 'windows' },
										],
										default: 'android',
										description: 'Target device type',
									},
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Redirect URL for this device',
									},
								],
							},
						],
					},
					{
						displayName: 'Display Title',
						name: 'display_title',
						type: 'string',
						default: '',
						description: 'Custom title for dashboard organization. Leave empty to keep unchanged, or set to clear the existing value.',
					},
					{
						displayName: 'Domain Name or ID',
						name: 'domain',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDomains',
						},
						default: '',
						description: 'Change the branded domain for this link. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Expiration Redirect URL',
						name: 'expirationredirect',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/expired',
						description: 'URL to redirect to after the link expires',
					},
					{
						displayName: 'Expiry Date',
						name: 'expiry',
						type: 'dateTime',
						default: '',
						description: 'Date and time when the link should expire',
					},
					{
						displayName: 'Geo Targeting',
						name: 'geotarget',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Redirect users to different URLs based on their country',
						options: [
							{
								displayName: 'Target',
								name: 'entries',
								values: [
									{
										displayName: 'Country Code',
										name: 'country',
										type: 'string',
										default: '',
										placeholder: 'US',
										description: 'ISO 3166-1 alpha-2 country code (e.g., US, DE, FR)',
									},
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Redirect URL for visitors from this country',
									},
								],
							},
						],
					},
					{
						displayName: 'Internal Note',
						name: 'note',
						type: 'string',
						default: '',
						description: 'Internal note for this link (not visible to visitors)',
					},
					{
						displayName: 'Language Targeting',
						name: 'languagetarget',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						description: 'Redirect users to different URLs based on their browser language',
						options: [
							{
								displayName: 'Target',
								name: 'entries',
								values: [
									{
										displayName: 'Language Code',
										name: 'language',
										type: 'string',
										default: '',
										placeholder: 'en',
										description: 'ISO 639-1 language code (e.g., en, de, fr)',
									},
									{
										displayName: 'URL',
										name: 'url',
										type: 'string',
										default: '',
										description: 'Redirect URL for visitors with this browser language',
									},
								],
							},
						],
					},
					{
						displayName: 'Password',
						name: 'password',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'Password to protect access (leave empty to remove)',
					},
					{
						displayName: 'Tracking Pixel Names or IDs',
						name: 'pixels',
						type: 'multiOptions',
						typeOptions: {
							loadOptionsMethod: 'getPixels',
						},
						default: [],
						description: 'Replace tracking pixels (send empty to remove all). Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
				],
			},

			// ----------------------------------
			//         Deep Link: Delete
			// ----------------------------------
			{
				displayName: 'Link ID or Short URL',
				name: 'linkId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '5444983 or https://linktw.in/abc123',
				description: 'The numeric link ID or the full short URL to delete',
				displayOptions: {
					show: {
						resource: ['deepLink'],
						operation: ['delete'],
					},
				},
			},

			// ----------------------------------
			//         Statistics: Get
			// ----------------------------------
			{
				displayName: 'Link ID or Short URL',
				name: 'linkId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '5444983 or https://linktw.in/abc123',
				description: 'The numeric link ID or the full short URL',
				displayOptions: {
					show: {
						resource: ['statistics'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Date Range',
				name: 'dateRange',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['statistics'],
						operation: ['get'],
					},
				},
				options: [
					{ name: 'All Time', value: 'max' },
					{ name: 'Custom Range', value: 'custom' },
					{ name: 'Last 24 Hours', value: '1d' },
					{ name: 'Last 30 Days', value: '30d' },
					{ name: 'Last 7 Days', value: '7d' },
				],
				default: '30d',
				description: 'Time period for statistics',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['statistics'],
						operation: ['get'],
						dateRange: ['custom'],
					},
				},
				default: '',
				description: 'Start date for custom range',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['statistics'],
						operation: ['get'],
						dateRange: ['custom'],
					},
				},
				default: '',
				description: 'End date for custom range',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['statistics'],
						operation: ['get'],
					},
				},
				options: [
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: '',
						placeholder: 'Europe/Berlin',
						description: 'Timezone for data (e.g., America/New_York, Europe/London)',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			/**
			 * Load collections for dropdown selection
			 */
			async getCollections(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('linkTwinApi');
				const options = {
					method: 'GET' as IHttpRequestMethods,
					url: 'https://linktw.in/api/collections',
					qs: { limit: 100 },
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						Accept: 'application/json',
					},
				};

				try {
					const response = await this.helpers.httpRequest(options);
					if (response.error === 0 && response.data?.collections) {
						return response.data.collections.map((collection: { id: number; name: string }) => ({
							name: collection.name,
							value: collection.name,
						}));
					}
					return [];
				} catch {
					return [];
				}
			},

			/**
			 * Load domains for dropdown selection
			 */
			async getDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('linkTwinApi');
				const options = {
					method: 'GET' as IHttpRequestMethods,
					url: 'https://linktw.in/api/domains',
					qs: { limit: 100 },
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						Accept: 'application/json',
					},
				};

				try {
					const response = await this.helpers.httpRequest(options);
					if (response.error === 0 && response.data?.domains) {
						return response.data.domains.map((domain: { domain: string }) => ({
							name: domain.domain,
							value: domain.domain,
						}));
					}
					return [];
				} catch {
					return [];
				}
			},

			/**
			 * Load tracking pixels for dropdown selection
			 */
			async getPixels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('linkTwinApi');
				const options = {
					method: 'GET' as IHttpRequestMethods,
					url: 'https://linktw.in/api/pixels',
					qs: { limit: 100 },
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						Accept: 'application/json',
					},
				};

				try {
					const response = await this.helpers.httpRequest(options);
					if (response.error === 0 && response.data?.pixels) {
						return response.data.pixels.map((pixel: { id: number; name: string; type: string }) => ({
							name: `${pixel.name} (${pixel.type})`,
							value: pixel.name,
						}));
					}
					return [];
				} catch {
					return [];
				}
			},
		},
	};

	/**
	 * Execute the node operations
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('linkTwinApi');

		const baseUrl = 'https://linktw.in/api';
		const headers = {
			Authorization: `Bearer ${credentials.apiKey}`,
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject;

				// ----------------------------------
				//         Deep Link Operations
				// ----------------------------------
				if (resource === 'deepLink') {
					// CREATE
					if (operation === 'create') {
						const url = this.getNodeParameter('url', i) as string;
						const custom = this.getNodeParameter('custom', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = { url };
						if (custom) body.custom = custom;

						// Add additional fields
						Object.assign(body, additionalFields);

						// Unwrap fixedCollection fields from {entries: [...]} to [...]
						const fixedCollectionFields = ['geotarget', 'devicetarget', 'languagetarget', 'abtesting', 'parameters'];
						for (const field of fixedCollectionFields) {
							if (body[field] && (body[field] as IDataObject).entries) {
								body[field] = (body[field] as IDataObject).entries;
							}
						}

						const response = await this.helpers.httpRequest({
							method: 'POST',
							url: `${baseUrl}/url/add`,
							headers,
							body,
						});

						checkApiResponse(response);
						responseData = {
							id: response.id,
							shorturl: response.shorturl,
							title: response.title,
							description: response.description,
						};
					}

					// GET
					else if (operation === 'get') {
						const linkId = this.getNodeParameter('linkId', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;

						const qs: IDataObject = {};
						if (options.timezone) {
							qs.timezone = options.timezone;
						}

						const response = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseUrl}/url/${encodeURIComponent(linkId)}`,
							headers,
							qs,
						});

						checkApiResponse(response);
						responseData = response as IDataObject;
					}

					// LIST
					else if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						const qs: IDataObject = {};

						if (!returnAll) {
							qs.limit = this.getNodeParameter('limit', i) as number;
						} else {
							qs.limit = 100; // Max per page
						}

						// Apply filters
						if (filters.search) qs.search = filters.search;
						if (filters.order) qs.order = filters.order;
						if (filters.date_from) qs.date_from = filters.date_from;
						if (filters.date_to) qs.date_to = filters.date_to;
						if (filters.collections && (filters.collections as string[]).length > 0) {
							qs.collections = JSON.stringify(filters.collections);
						}
						if (filters.timezone) qs.timezone = filters.timezone;

						if (returnAll) {
							// Fetch all pages
							const allLinks: IDataObject[] = [];
							let page = 1;
							let hasMore = true;

							while (hasMore) {
								qs.page = page;
								const response = await this.helpers.httpRequest({
									method: 'GET',
									url: `${baseUrl}/urls`,
									headers,
									qs,
								});

								checkApiResponse(response);

								if (response.data?.urls) {
									allLinks.push(...(response.data.urls as IDataObject[]));
								}

								hasMore = response.data?.currentpage < response.data?.maxpage;
								page++;
							}

							responseData = {
								result: allLinks.length,
								urls: allLinks,
							};
						} else {
							const response = await this.helpers.httpRequest({
								method: 'GET',
								url: `${baseUrl}/urls`,
								headers,
								qs,
							});

							checkApiResponse(response);
							responseData = response.data as IDataObject;
						}
					}

					// UPDATE
					else if (operation === 'update') {
						const linkId = this.getNodeParameter('linkId', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

						const body: IDataObject = {};
						Object.assign(body, updateFields);

						// Unwrap fixedCollection fields from {entries: [...]} to [...]
						const fixedCollectionFields = ['geotarget', 'devicetarget', 'languagetarget', 'abtesting', 'parameters'];
						for (const field of fixedCollectionFields) {
							if (body[field] && (body[field] as IDataObject).entries) {
								body[field] = (body[field] as IDataObject).entries;
							}
						}

						const response = await this.helpers.httpRequest({
							method: 'PUT',
							url: `${baseUrl}/url/update/${encodeURIComponent(linkId)}`,
							headers,
							body,
						});

						checkApiResponse(response);
						responseData = {
							id: response.id,
							shorturl: response.shorturl,
							title: response.title,
							description: response.description,
						};
					}

					// DELETE
					else if (operation === 'delete') {
						const linkId = this.getNodeParameter('linkId', i) as string;

						const response = await this.helpers.httpRequest({
							method: 'DELETE',
							url: `${baseUrl}/url/delete/${encodeURIComponent(linkId)}`,
							headers,
						});

						checkApiResponse(response);
						responseData = {
							deleted: true,
							message: response.message || 'Link has been successfully deleted.',
						};
					} else {
						throw new ApplicationError(`Unknown operation: ${operation}`);
					}
				}

				// ----------------------------------
				//         Statistics Operations
				// ----------------------------------
				else if (resource === 'statistics') {
					if (operation === 'get') {
						const linkId = this.getNodeParameter('linkId', i) as string;
						const dateRange = this.getNodeParameter('dateRange', i) as string;
						const options = this.getNodeParameter('options', i) as IDataObject;

						const qs: IDataObject = {
							date_range: dateRange,
						};

						if (dateRange === 'custom') {
							const startDate = this.getNodeParameter('startDate', i) as string;
							const endDate = this.getNodeParameter('endDate', i) as string;

							if (startDate) {
								qs.start_date = new Date(startDate).toISOString().slice(0, 10);
							}
							if (endDate) {
								qs.end_date = new Date(endDate).toISOString().slice(0, 10);
							}
						}

						if (options.timezone) {
							qs.timezone = options.timezone;
						}

						const response = await this.helpers.httpRequest({
							method: 'GET',
							url: `${baseUrl}/statistics/link/${encodeURIComponent(linkId)}`,
							headers,
							qs,
						});

						checkApiResponse(response);
						responseData = response.data as IDataObject;
					} else {
						throw new ApplicationError(`Unknown operation: ${operation}`);
					}
				} else {
					throw new ApplicationError(`Unknown resource: ${resource}`);
				}

				returnData.push({
					json: responseData!,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
