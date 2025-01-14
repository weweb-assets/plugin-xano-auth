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
                description: "Creates a new user account with the provided credentials",
                returns: "object - The newly created user data",
                schema: {
                    headers: {
                        type: "array",
                        description: "Custom headers to send with the request",
                        bindable: true
                    },
                    withCredentials: {
                        type: "boolean", 
                        description: "Whether to include credentials (cookies) with the request",
                        bindable: true
                    },
                    parameters: {
                        type: "object",
                        description: "URL parameters to include in the request",
                        bindable: true
                    },
                    body: {
                        type: "object",
                        description: "Request body containing user registration data",
                        bindable: true
                    }
                }
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
                description: "Authenticates a user with their credentials",
                returns: "object - The authenticated user data",
                schema: {
                    headers: {
                        type: "array",
                        description: "Custom headers to send with the request",
                        bindable: true
                    },
                    withCredentials: {
                        type: "boolean",
                        description: "Whether to include credentials (cookies) with the request",
                        bindable: true
                    },
                    parameters: {
                        type: "object",
                        description: "URL parameters to include in the request",
                        bindable: true
                    },
                    body: {
                        type: "object",
                        description: "Request body containing login credentials",
                        bindable: true
                    }
                }
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
                description: "Initiates OAuth login flow with a third-party provider",
                returns: "object - The authenticated user data after successful OAuth login",
                schema: {
                    provider: {
                        type: "string",
                        description: "The OAuth provider to use (e.g. 'github-oauth', 'facebook-oauth')",
                        bindable: true
                    },
                    type: {
                        type: "string",
                        description: "The type of OAuth flow to initiate",
                        bindable: true
                    },
                    redirectPage: {
                        type: "string",
                        description: "The page to redirect to after successful authentication",
                        bindable: true
                    }
                }
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
                description: "Fetches the current authenticated user's data",
                returns: "object - The current user's data",
                schema: {
                    headers: {
                        type: "array",
                        description: "Custom headers to send with the request",
                        bindable: true
                    },
                    withCredentials: {
                        type: "boolean",
                        description: "Whether to include credentials (cookies) with the request",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Store Auth Token',
            code: 'storeAuthToken',
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/StoreAuthToken.vue'),
            copilot: {
                description: "Stores an authentication token in the browser",
                returns: "void",
                schema: {
                    authToken: {
                        type: "string",
                        description: "The authentication token to store",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Logout',
            code: 'logout',
            /* wwEditor:start */
            copilot: {
                description: "Logs out the current user and clears authentication data",
                returns: "void",
                schema: {}
            },
            /* wwEditor:end */
        },
    ],
};