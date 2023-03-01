export default {
    editor: {
        settings: [
            {
                label: 'Configuration',
                icon: 'advanced',
                edit: () => import('./src/components/Configuration/SettingsEdit.vue'),
                summary: () => import('./src/components/Configuration/SettingsSummary.vue'),
                getIsValid(settings) {
                    const { loginEndpoint, getMeEndpoint, signupEndpoint } = settings.publicData;
                    const { apiKey, instanceId, workspaceId } = settings.privateData;
                    return (
                        !!loginEndpoint &&
                        !!getMeEndpoint &&
                        !!signupEndpoint &&
                        !!apiKey &&
                        !!instanceId &&
                        !!workspaceId
                    );
                },
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
                label: 'Social login',
                icon: 'advanced',
                edit: () => import('./src/components/Social/SettingsEdit.vue'),
                summary: () => import('./src/components/Social/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
            },
            {
                label: 'Define redirections (URLs)',
                icon: 'open-out',
                edit: () => import('./src/components/Redirections/SettingsEdit.vue'),
                summary: () => import('./src/components/Redirections/SettingsSummary.vue'),
                getIsValid(settings) {
                    const { afterNotSignInPageId } = settings.publicData;
                    return !!afterNotSignInPageId;
                },
            },
        ],
        designSystemId: '9a1f106a-1397-4fb4-8b9a-369d744e6aa3',
    },
    variables: [
        { name: 'user', value: 'user', type: 'object', defaultValue: null },
        { name: 'accessToken', value: 'token', type: 'string', defaultValue: null },
        { name: 'isAuthenticated', value: 'isAuthenticated', type: 'boolean', defaultValue: false },
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
            /* wwEditor:end */
        },
        {
            name: 'Fetch User',
            code: 'fetchUser',
            isAsync: true,
        },
        {
            name: 'Logout',
            code: 'logout',
        },
    ],
};
