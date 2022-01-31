/* wwEditor:start */
import './components/Configuration/SettingsEdit.vue';
import './components/Configuration/SettingsSummary.vue';
import './components/Redirections/SettingsEdit.vue';
import './components/Redirections/SettingsSummary.vue';
import './components/Functions/Login.vue';
import './components/Functions/SignUp.vue';
/* wwEditor:end */

const COOKIE_NAME = 'ww-auth-token';

export default {
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async onLoad() {
        const token = window.vm.config.globalProperties.$cookie.getCookie(COOKIE_NAME);
        wwLib.wwVariable.updateValue(`${this.id}-token`, token);
        if (token) await this.fetchUser();
    },
    /*=============================================m_ÔÔ_m=============================================\
        Auth API
    \================================================================================================*/
    /* wwEditor:start */
    // async getRoles() {},
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Auth Token API
    \================================================================================================*/
    storeToken(token) {
        window.vm.config.globalProperties.$cookie.setCookie(COOKIE_NAME, token);
        wwLib.wwVariable.updateValue(`${this.id}-token`, token);
    },
    removeToken() {
        window.vm.config.globalProperties.$cookie.removeCookie(COOKIE_NAME);
        wwLib.wwVariable.updateValue(`${this.id}-token`, null);
    },
    async fetchUser() {
        const { baseUrl } = this.settings.publicData;
        const token = wwLib.wwVariable.getValue(`${this.id}-token`);

        if (!baseUrl) throw new Error('No API Group Base URL defined.');

        try {
            const { data: user } = await axios.get(`${baseUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            wwLib.wwVariable.updateValue(`${this.id}-user`, user);
            wwLib.wwVariable.updateValue(`${this.id}-isAuthenticated`, true);
            return user;
        } catch (err) {
            this.logout();
            throw err;
        }
    },
    async login(email, password, name) {
        const { baseUrl } = this.settings.publicData;
        const token = wwLib.wwVariable.getValue(`${this.id}-token`);

        if (!baseUrl) throw new Error('No API Group Base URL defined.');

        try {
            const {
                data: { authToken },
            } = await axios.post(
                `${baseUrl}/auth/login`,
                { email, password, name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            this.storeToken(authToken);
            return await this.fetchUser();
        } catch (err) {
            this.logout();
            throw err;
        }
    },
    async signUp() {
        const { baseUrl } = this.settings.publicData;
        const token = wwLib.wwVariable.getValue(`${this.id}-token`);

        if (!baseUrl) throw new Error('No API Group Base URL defined.');

        try {
            const {
                data: { authToken },
            } = await axios.get(`${baseUrl}/auth/signup`, {
                headers: { Authorization: `Bearer ${token}` },
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
};
