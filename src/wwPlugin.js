/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/Social/SettingsEdit.vue';
import './components/Social/SettingsSummary.vue';
import './components/DataSource/SettingsEdit.vue';
import './components/DataSource/SettingsSummary.vue';
import './components/Functions/Login.vue';
import './components/Functions/SignUp.vue';
import './components/Functions/LoginProvider.vue';
import './components/Functions/StoreAuthToken.vue';
import './components/Functions/FetchUser.vue';
/* wwEditor:end */

const ACCESS_COOKIE_NAME = 'ww-auth-access-token';
const PENDING_PROVIDER_LOGIN = 'ww-auth-xano-provider-login';

export default {
    instances: null,
    instance: null,
    instanceCache: {},
    isReady: false,
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async onLoad(settings) {
        /* wwEditor:start */
        await this.fetchInstances(settings.privateData.apiKey);
        await this.fetchInstance(settings.privateData.apiKey, settings.privateData.instanceId);
        this.isReady = true;
        /* wwEditor:end */
        const pendingLogin = window.vm.config.globalProperties.$cookie.getCookie(PENDING_PROVIDER_LOGIN);
        const accessToken = window.vm.config.globalProperties.$cookie.getCookie(ACCESS_COOKIE_NAME);
        wwLib.wwVariable.updateValue(`${this.id}-accessToken`, accessToken);
        if (accessToken) await this.fetchUser();
        if (pendingLogin) await this.continueLoginProvider(pendingLogin);
    },
    /*=============================================m_ÔÔ_m=============================================\
        Auth API
    \================================================================================================*/
    /* wwEditor:start */
    // async getRoles() {},
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Xano Auth API
    \================================================================================================*/
    storeToken(accessToken) {
        window.vm.config.globalProperties.$cookie.setCookie(ACCESS_COOKIE_NAME, accessToken);
        wwLib.wwVariable.updateValue(`${this.id}-accessToken`, accessToken);
    },
    removeToken() {
        window.vm.config.globalProperties.$cookie.removeCookie(ACCESS_COOKIE_NAME);
        wwLib.wwVariable.updateValue(`${this.id}-accessToken`, null);
    },
    async fetchUser({ headers } = {}) {
        const { getMeEndpoint } = this.settings.publicData;
        const authToken = wwLib.wwVariable.getValue(`${this.id}-accessToken`);

        if (!getMeEndpoint) throw new Error('No API Group Base URL defined.');

        try {
            const { data: user } = await this.request(getMeEndpoint, {
                headers: buildXanoHeaders({ authToken }, headers),
            });
            wwLib.wwVariable.updateValue(`${this.id}-user`, user);
            wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
            return user;
        } catch (err) {
            this.logout();
            throw err;
        }
    },
    async login({ headers, parameters = null, body = null, email = null, password = null }) {
        const { loginEndpoint } = this.settings.publicData;

        if (!loginEndpoint) throw new Error('No API Group Base URL defined.');

        // support old email + password fixed parameters
        const data = body || { email, password };

        try {
            const {
                data: { authToken },
            } = await await this.request(loginEndpoint, {
                method: 'post',
                data,
                params: parameters,
                headers: buildXanoHeaders({}, headers),
            });
            this.storeToken(authToken);
            return await this.fetchUser();
        } catch (err) {
            this.logout();
            throw err;
        }
    },
    async loginProvider({ headers, provider: providerName, type, redirectPage }) {
        try {
            const provider = this.settings.publicData.socialProviders[providerName];
            if (!provider) return;
            const websiteId = wwLib.wwWebsiteData.getInfo().id;
            const redirectUrl = wwLib.manager
                ? `${window.location.origin}/${websiteId}/${redirectPage}`
                : `${window.location.origin}${wwLib.wwPageHelper.getPagePath(redirectPage)}`;
            const endpoint = resolveOauthInitEndpoint(provider.name);

            const result = await this.request(`${provider.api}/oauth/${provider.name.split('-')[0]}/${endpoint}`, {
                params: {
                    redirect_uri: redirectUrl,
                },
                headers: buildXanoHeaders({}, headers),
            });
            window.vm.config.globalProperties.$cookie.setCookie(PENDING_PROVIDER_LOGIN, {
                provider,
                type,
                redirectUrl,
                headers: buildXanoHeaders({}, headers),
            });
            window.open(parseAuthUrl(provider.name, result.data), '_self');
        } catch (err) {
            window.vm.config.globalProperties.$cookie.removeCookie(PENDING_PROVIDER_LOGIN);
            this.logout();
            throw err;
        }
    },
    async continueLoginProvider({ headers, provider, type, redirectUrl }) {
        try {
            const result = await this.request(`${provider.api}/oauth/${provider.name.split('-')[0]}/${type}`, {
                params: {
                    code: wwLib.globalContext.browser.query.code,
                    oauth_token: wwLib.globalContext.browser.query.oauth_token,
                    oauth_verifier: wwLib.globalContext.browser.query.oauth_verifier,
                    redirect_uri: redirectUrl,
                },
                headers,
            });
            window.vm.config.globalProperties.$cookie.removeCookie(PENDING_PROVIDER_LOGIN);
            this.storeToken(parseAuthToken(provider.name, result.data));
            return await this.fetchUser();
        } catch (error) {
            window.vm.config.globalProperties.$cookie.removeCookie(PENDING_PROVIDER_LOGIN);
            throw error;
        }
    },
    async signUp({ headers, body, parameters, email, password, name }) {
        const { signupEndpoint } = this.settings.publicData;

        if (!signupEndpoint) throw new Error('No API Group Base URL defined.');

        // support old email + password fixed parameters
        const data = body || { email, password, name };

        try {
            const {
                data: { authToken },
            } = await this.request(signupEndpoint, {
                method: 'post',
                data,
                params: parameters,
                headers: buildXanoHeaders({}, headers),
            });
            this.storeToken(authToken);
            return await this.fetchUser();
        } catch (err) {
            this.logout();
            throw err;
        }
    },
    logout() {
        this.removeToken();
        wwLib.wwVariable.updateValue(`${this.id}-user`, null);
        wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, false);
    },
    storeAuthToken({ authToken }) {
        this.storeToken(authToken);
    },
    async request(to, config) {
        config.url = this.resolveUrl(to);
        return axios(config);
    },
    // Ensure everything use the right base domain
    resolveUrl(url) {
        const _url = new URL(url);
        _url.hostname = this.settings.publicData.customDomain || this.settings.publicData.domain || _url.hostname;

        return _url.href;
    },
    /* wwEditor:start */
    async fetchInstances(apiKey) {
        if (!apiKey && !this.settings.privateData.apiKey) return;

        const { data: instances } = await axios.get('https://app.xano.com/api:developer/instance', {
            headers: { Authorization: `Bearer ${apiKey || this.settings.privateData.apiKey}` },
        });

        this.instances = instances;
        this.instanceCache = {};
        this.instance = null;
        return instances;
    },
    async fetchInstance(apiKey, instanceId) {
        if (!apiKey && !this.settings.privateData.apiKey) return;
        if (!instanceId && !this.settings.privateData.instanceId) return;
        if (!this.instances) return;

        const instance = this.instances.find(
            instance => `${instance.id}` === (instanceId || this.settings.privateData.instanceId)
        );

        if (!instance) return;

        // Avoid to fetch again using the same tokenUrl
        if (this.instanceCache[instance.id]) {
            this.instance = this.instanceCache[instance.id];
            return this.instance;
        }

        const {
            data: { authToken, origin },
        } = await axios.get(instance.tokenUrl, {
            headers: { Authorization: `Bearer ${apiKey || this.settings.privateData.apiKey}` },
        });

        const { data: workspaces } = await axios.get(`${origin}/api:developer/workspace?type=json`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        this.instance = workspaces;
        this.instanceCache[instance.id] = workspaces;
        return this.instance;
    },
    async getApiGroup(apiGroupUrl) {
        if (!this.instance || !apiGroupUrl) return;

        const apiGroup = this.instance
            .map(({ apigroups }) => apigroups)
            .flat()
            .find(apiGroup => apiGroup.api === apiGroupUrl);
        if (!apiGroup) return;

        try {
            const { data } = await axios.get(apiGroup.swaggerspec, {
                headers: { Authorization: `Bearer ${this.settings.privateData.apiKey}` },
            });

            return data;
        } catch (error) {
            wwLib.wwLog.error(error);
            if (error && error.response && error.response.status === 429) {
                wwLib.wwNotification.open({
                    text: {
                        en: 'Your xano plan only support 10 requetes per 20 seconds, please wait and retry.',
                    },
                    color: 'red',
                    duration: '5000',
                });
            }
            if (error && error.response && error.response.status === 404) {
                wwLib.wwNotification.open({
                    text: {
                        en: `The endpoints inside the API group "${apiGroup.name}" cannot be loaded, make sure to have the swagger documentation enabled for this API Group while you're configuring this plugin if you need them.`,
                    },
                    color: 'orange',
                    duration: '8000',
                });
            }
            return null;
        }
    },
    /* wwEditor:end */
};

function resolveOauthInitEndpoint(provider) {
    switch (provider) {
        case 'twitter-oauth':
            return 'request_token';
        default:
            return 'init';
    }
}

function parseAuthToken(provider, data) {
    switch (provider) {
        case 'twitter-oauth':
            return data.authToken;
        default:
            return data.token;
    }
}
function parseAuthUrl(provider, data) {
    switch (provider) {
        case 'github-oauth':
            return data.github_authurl;
        case 'facebook-oauth':
            return data.facebook_authurl;
        case 'linkedin-oauth':
            return data;
        default:
            return data.authUrl;
    }
}
function getCurrentDataSource() {
    const settings = wwLib.wwPlugins.xanoAuth.settings;
    switch (wwLib.globalContext.browser.environment) {
        case 'editor':
            return settings.publicData.xDataSourceEditor;
        case 'preview':
            return settings.publicData.xDataSourceProd;
        case 'staging':
            return settings.publicData.xDataSourceStaging;
        case 'production':
            return settings.publicData.xDataSourceProd;
        default:
            return null;
    }
}

function buildXanoHeaders({ xDataSource = getCurrentDataSource(), authToken, dataType }, customHeaders = []) {
    return {
        ...(xDataSource ? { 'X-Data-Source': xDataSource } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(dataType ? { 'Content-Type': dataType } : {}),
        ...(Array.isArray(customHeaders) ? customHeaders : [])
            .filter(header => !!header && !!header.key)
            .reduce((curr, next) => ({ ...curr, [next.key]: next.value }), {}),
    };
}
