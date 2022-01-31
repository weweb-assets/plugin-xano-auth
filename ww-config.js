export default {
    editor: {
        settings: [
            {
                label: 'Configuration',
                icon: 'advanced',
                edit: () => import('./src/components/Configuration/SettingsEdit.vue'),
                summary: () => import('./src/components/Configuration/SettingsSummary.vue'),
                getIsValid(settings) {
                    const { baseUrl } = settings.publicData;
                    return !!baseUrl;
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
        designSystemId: 'ec2eebfe-499b-43c4-b260-80ee5a4d9504',
    },
    variables: [
        { name: 'user', value: 'user', type: 'object', defaultValue: null },
        { name: 'token', value: 'token', type: 'string', defaultValue: null },
        { name: 'isAuthenticated', value: 'isAuthenticated', type: 'boolean', defaultValue: false },
    ],
    functions: [
        {
            name: 'Sign Up',
            code: 'signUp',
            parameters: [
                { name: 'Email', type: 'string' },
                { name: 'Password', type: 'string' },
                { name: 'Name', type: 'string' },
            ],
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/SignUp.vue'),
            getIsValid([email, password, name]) {
                return !!email && !!password && !!name;
            },
            /* wwEditor:end */
        },
        {
            name: 'Login',
            code: 'login',
            parameters: [
                { name: 'Email', type: 'string' },
                { name: 'Password', type: 'string' },
            ],
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Functions/Login.vue'),
            getIsValid([email, password]) {
                return !!email && !!password;
            },
            /* wwEditor:end */
        },
        {
            name: 'Logout',
            code: 'logout',
            parameters: [],
        },
    ],
};
