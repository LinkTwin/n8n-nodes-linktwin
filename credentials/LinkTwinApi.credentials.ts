import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

/**
 * LinkTwin API Credentials
 *
 * Implements Bearer token authentication for the LinkTwin API.
 * Users obtain their API key from https://linktw.in/user/settings
 *
 * Authentication: Authorization: Bearer {apiKey}
 * Test Endpoint: GET /accountinfo (validates the API key)
 */
export class LinkTwinApi implements ICredentialType {
	name = 'linkTwinApi';

	displayName = 'LinkTwin API';

	documentationUrl = 'https://linktw.in/user/settings';

	icon: Icon = 'file:../icons/linktwin.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your LinkTwin API key. Get it from <a href="https://linktw.in/user/settings" target="_blank">Settings → Developer API Key</a>.',
		},
	];

	/**
	 * Configure Bearer token authentication.
	 * The API key is sent as a Bearer token in the Authorization header.
	 */
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	/**
	 * Test the credentials by calling the /accountinfo endpoint.
	 * This endpoint returns basic account information and validates the API key.
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://linktw.in/api',
			url: '/accountinfo',
			method: 'GET',
		},
	};
}
