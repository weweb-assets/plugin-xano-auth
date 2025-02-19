export default {
    features: {
        auth: true,
    },
    editor: {
        settings: [
            {
                label: 'Configuration',
                icon: 'advanced',
                edit: () => import('./src/components/Configuration/SettingsEdit.vue'),
                summary: () => import('./src/components/Configuration/SettingsSummary.vue'),
                getIsValid(settings) {
                    const { loginEndpoint, getMeEndpoint, signupEndpoint, customDomain = '' } = settings.publicData;
                    const { apiKey, metaApiKey, instanceId, workspaceId } = settings.privateData;
                    return (
                        !!loginEndpoint &&
                        !!getMeEndpoint &&
                        !!signupEndpoint &&
                        (metaApiKey || apiKey) &&
                        !!instanceId &&
                        !!workspaceId &&
                        (!customDomain || !customDomain.includes('http'))
                    );
                },
                onSave: 'initManager',
            },
            {
                label: 'Data Source',
                edit: () => import('./src/components/DataSource/SettingsEdit.vue'),
                summary: () => import('./src/components/DataSource/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
            },
            {
                label: 'Branching',
                edit: () => import('./src/components/Branching/SettingsEdit.vue'),
                summary: () => import('./src/components/Branching/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
                onSave: 'updateBranch',
            },
            {
                label: 'Global Headers',
                edit: () => import('./src/components/GlobalHeaders/SettingsEdit.vue'),
                summary: () => import('./src/components/GlobalHeaders/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
            },
        ],
        designSystemId: '9a1f106a-1397-4fb4-8b9a-369d744e6aa3',
    },
    variables: [
        { name: 'user', value: 'user', type: 'object', defaultValue: null },
        { name: 'isAuthenticated', value: 'isAuthenticated', type: 'boolean', defaultValue: false },
        { name: 'accessToken', value: 'token', type: 'string', defaultValue: null },
    ],
    actions: [
        {
            name: 'Sign Up',
            code: 'signUp',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignUp.vue'),
            getIsValid({ parameters, body }) {
                return !parameters || body;
            },
            copilot: {
                description:
                    'Register a new user in Xano. On success, automatically stores the auth token and fetches the user profile.',
                returns: 'object - The newly created user profile data',
                schema: {
                    body: {
                        type: 'object',
                        description:
                            'Request body containing user registration data. Must match your Xano API endpoint schema. The key values are bindable, but not the whole object.',
                        bindable: false,
                    },
                    parameters: {
                        type: 'object',
                        description:
                            'Add query parameters to URL. Example: {"userId": "123", "filter": "active"}. The values are bindable, but not the whole object.',
                        bindable: false,
                    },
                    headers: {
                        type: 'Array<{key: string, value: string}',
                        description:
                            'Custom headers as key-value pairs, e.g., [{"Content-Type": "application/json"}]. Automatically includes Xano authentication token if available. key and value are bindable individually.',
                        bindable: true,
                    },
                    withCredentials: {
                        type: 'boolean',
                        description:
                            'Whether to include credentials (cookies) with the request. Falls back to plugin settings if not specified.',
                        bindable: false,
                    },
                },
            },
            /* wwEditor:end */
        },
        {
            name: 'Login',
            code: 'login',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/Login.vue'),
            getIsValid({ parameters, body }) {
                return !parameters || body;
            },
            copilot: {
                description:
                    'Authenticate a user with Xano. On success, automatically stores the auth token and fetches the user profile.',
                returns: 'object - The authenticated user profile data',
                schema: {
                    body: {
                        type: 'object',
                        description:
                            'Request body containing login credentials. Must match your Xano API endpoint schema. The key values are bindable, but not the whole object.',
                        bindable: false,
                    },
                    parameters: {
                        type: 'object',
                        description:
                            'Add query parameters to URL. Example: {"userId": "123", "filter": "active"}. The values are bindable, but not the whole object.',
                        bindable: false,
                    },
                    headers: {
                        type: 'Array<{key: string, value: string}',
                        description:
                            'Custom headers as key-value pairs, e.g., [{"Content-Type": "application/json"}]. Automatically includes Xano authentication token if available. key and value are bindable individually.',
                        bindable: true,
                    },
                    withCredentials: {
                        type: 'boolean',
                        description:
                            'Whether to include credentials (cookies) with the request. Falls back to plugin settings if not specified.',
                        bindable: false,
                    },
                },
            },
            /* wwEditor:end */
        },
        {
            name: 'Login Provider',
            code: 'loginProvider',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/LoginProvider.vue'),
            getIsValid({ provider, type }) {
                return !!provider && !!type;
            },
            copilot: {
                description:
                    "Initiate OAuth social login with a specified provider (e.g., Google, Facebook). Opens the provider's authentication window.",
                returns: "void - Redirects to the provider's auth page",
                schema: {
                    provider: {
                        type: 'string',
                        description: 'The name of the social provider as configured in your Xano settings',
                        bindable: true,
                    },
                    type: {
                        type: 'string',
                        description:
                            'The type of OAuth flow to use. For twitter-oauth, use "access_token", for the rest, use "continue"',
                        bindable: true,
                    },
                    redirectPage: {
                        type: 'string',
                        description: 'The page path to redirect to after successful authentication',
                        bindable: true,
                    },
                    headers: {
                        type: 'Array<{key: string, value: string}',
                        description:
                            'Custom headers as key-value pairs, e.g., [{"Content-Type": "application/json"}]. Automatically includes Xano authentication token if available. key and value are bindable individually.',
                        bindable: true,
                    },
                    withCredentials: {
                        type: 'boolean',
                        description:
                            'Whether to include credentials (cookies) with the request. Falls back to plugin settings if not specified.',
                        bindable: false,
                    },
                },
            },
            /* wwEditor:end */
        },
        {
            name: 'Fetch User',
            code: 'fetchUser',
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/FetchUser.vue'),
            copilot: {
                description:
                    "Fetch the current authenticated user's profile from Xano. Updates the internal user state and isAuthenticated flag.",
                returns: "object - The current user's profile data",
                schema: {
                    headers: {
                        type: 'Array<{key: string, value: string}',
                        description:
                            'Custom headers as key-value pairs, e.g., [{"Content-Type": "application/json"}]. Automatically includes Xano authentication token if available. key and value are bindable individually.',
                        bindable: true,
                    },
                    withCredentials: {
                        type: 'boolean',
                        description:
                            'Whether to include credentials (cookies) with the request. Falls back to plugin settings if not specified.',
                        bindable: false,
                    },
                },
            },
            /* wwEditor:end */
        },
        {
            name: 'Store Auth Token',
            code: 'storeAuthToken',
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/StoreAuthToken.vue'),
            copilot: {
                description:
                    'Manually store a Xano authentication token. Updates the cookie, internal state, and configures the Xano client with the token.',
                returns: 'void',
                schema: {
                    authToken: {
                        type: 'string',
                        description: 'The authentication token to store',
                        bindable: true,
                    },
                },
            },
            /* wwEditor:end */
        },
        {
            name: 'Logout',
            code: 'logout',
            /* wwEditor:start */
            copilot: {
                description:
                    'Log out the current user. Clears the auth token, user data, and resets the authentication state.',
                returns: 'void',
                schema: {},
            },
            /* wwEditor:end */
        },
    ],
};
