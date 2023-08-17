/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/Social/SettingsEdit.vue';
import './components/Social/SettingsSummary.vue';
import './components/DataSource/SettingsEdit.vue';
import './components/DataSource/SettingsSummary.vue';
import './components/Branching/SettingsEdit.vue';
import './components/Branching/SettingsSummary.vue';
import './components/GlobalHeaders/SettingsEdit.vue';
import './components/GlobalHeaders/SettingsSummary.vue';
import './components/Functions/Login.vue';
import './components/Functions/SignUp.vue';
import './components/Functions/LoginProvider.vue';
import './components/Functions/StoreAuthToken.vue';
import './components/Functions/FetchUser.vue';

import DevApi from './api/developer.class';
import MetaApi from './api/metadata.class';
/* wwEditor:end */

const ACCESS_COOKIE_NAME = 'ww-auth-access-token';
const PENDING_PROVIDER_LOGIN = 'ww-auth-xano-provider-login';

export default {
    xanoManager: null,
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async onLoad(settings) {
        /* wwEditor:start */
        await this.initManager(settings);
        /* wwEditor:end */
        const pendingLogin = window.vm.config.globalProperties.$cookie.getCookie(PENDING_PROVIDER_LOGIN);
        const accessToken = window.vm.config.globalProperties.$cookie.getCookie(ACCESS_COOKIE_NAME);
        wwLib.wwVariable.updateValue(`${this.id}-accessToken`, accessToken);
        if (accessToken) await this.fetchUser();
        if (pendingLogin) await this.continueLoginProvider(pendingLogin);
    },
    /*=============================================m_ÔÔ_m=============================================\
        Editor API
    \================================================================================================*/
    /* wwEditor:start */
    async initManager(settings) {
        this.xanoManager = this.createManager(settings);
        await this.xanoManager.init();
    },
    createManager(settings) {
        const XanoManager = settings.privateData.metaApiKey ? MetaApi : DevApi;
        return new XanoManager(
            settings.privateData.metaApiKey || settings.privateData.apiKey,
            settings.privateData.instanceId,
            settings.privateData.workspaceId
        );
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Xano Auth API
    \================================================================================================*/
    storeToken(accessToken) {
        window.vm.config.globalProperties.$cookie.setCookie(ACCESS_COOKIE_NAME, accessToken, {
            expire: '1y',
            secure: true,
        });
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
            const codePayload = parseAuthCode(wwLib.globalContext.browser.query);
            if (!codePayload) throw new Error('No code provided for social login');

            const result = await this.request(`${provider.api}/oauth/${provider.name.split('-')[0]}/${type}`, {
                params: {
                    ...codePayload,
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
    resolveUrl(url) {
        if (!url) return null;
        const _url = new URL(url);
        _url.hostname = this.settings.publicData.customDomain || this.settings.publicData.domain || _url.hostname;

        return _url.href;
    },
};

function resolveOauthInitEndpoint(provider) {
    switch (provider) {
        case 'twitter-oauth':
            return 'request_token';
        default:
            return 'init';
    }
}

function parseAuthCode(query) {
    if (query.code) return { code: query.code };
    else if (query.oauth_token) return { oauth_token: query.oauth_token };
    else if (query.oauth_verifier) return { oauth_verifier: query.oauth_verifier };
    else return null;
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

function getCurrentBranch() {
    const settings = wwLib.wwPlugins.xanoAuth.settings;
    switch (wwLib.globalContext.browser.environment) {
        case 'editor':
            return settings.publicData.xBranchEditor;
        case 'preview':
            return settings.publicData.xBranchProd;
        case 'staging':
            return settings.publicData.xBranchStaging;
        case 'production':
            return settings.publicData.xBranchProd;
        default:
            return null;
    }
}

function getGlobalHeaders() {
    return wwLib.wwFormula.getValue(wwLib.wwPlugins.xanoAuth.settings.publicData.globalHeaders);
}

function buildXanoHeaders(
    {
        xDataSource = getCurrentDataSource(),
        xBranch = getCurrentBranch(),
        authToken,
        dataType,
        globalHeaders = getGlobalHeaders(),
    },
    customHeaders = []
) {
    return {
        ...(xDataSource ? { 'X-Data-Source': xDataSource } : {}),
        ...(xBranch ? { 'X-Branch': xBranch } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(dataType ? { 'Content-Type': dataType } : {}),
        ...(Array.isArray(globalHeaders) ? globalHeaders : [])
            .filter(header => !!header && !!header.key)
            .reduce((curr, next) => ({ ...curr, [next.key]: next.value }), {}),
        ...(Array.isArray(customHeaders) ? customHeaders : [])
            .filter(header => !!header && !!header.key)
            .reduce((curr, next) => ({ ...curr, [next.key]: next.value }), {}),
    };
}
