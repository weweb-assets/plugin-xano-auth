export default class {
    #rateLimit = false;

    #apiKey = null;
    #instanceId = null;
    #workspaceId = null;
    #instances = [];
    #workspacesCache = {};
    #workspaces = [];
    #apiGroups = [];

    constructor(apiKey, instanceId, workspaceId) {
        this.#apiKey = apiKey;
        this.#instanceId = instanceId;
        this.#workspaceId = workspaceId;
    }

    async init() {
        await this.#loadInstances();
        await this.#loadWorkspaces();
        await this.#loadApiGroups();
    }

    /**
     * PRIVATE
     */
    async #loadInstances() {
        this.#instances = [];
        if (!this.#apiKey) return;

        const { data: instances } = await axios.get('https://app.xano.com/api:developer/instance', {
            headers: { Authorization: `Bearer ${this.#apiKey}` },
        });

        this.#instances = instances;
        this.#workspacesCache = {};
    }
    async #loadWorkspaces() {
        this.#workspaces = [];
        if (!this.#apiKey || !this.#instanceId || !this.#instances.length) return;

        const instance = this.getInstance();

        if (!instance) return;

        // Avoid to fetch again using the same tokenUrl
        if (this.#workspacesCache[instance.id]) {
            this.#workspaces = this.#workspacesCache[instance.id];
            return;
        }

        const {
            data: { authToken, origin },
        } = await axios.get(instance.tokenUrl, {
            headers: { Authorization: `Bearer ${this.#apiKey}` },
        });

        const { data: workspaces } = await axios.get(`${origin}/api:developer/workspace?type=json`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        this.#workspaces = workspaces;
        this.#workspacesCache[this.#instanceId] = workspaces;
    }
    async #loadApiGroups() {
        this.#apiGroups = [];
        const workspace = this.getWorkspace();
        if (!workspace) return;
        this.#apiGroups = workspace.apigroups;
    }

    /**
     * PUBLIC GETTERS
     */
    getInstances() {
        return this.#instances.map(instance => ({
            id: String(instance.id),
            name: instance.display,
            baseDomain: instance.host,
            customDomain: null,
            tokenUrl: instance.tokenUrl,
        }));
    }
    getInstance() {
        return this.getInstances().find(instance => instance.id === this.#instanceId);
    }
    getWorkspaces() {
        return this.#workspaces;
    }
    getWorkspace() {
        return this.getWorkspaces().find(workspace => workspace.id === this.#workspaceId);
    }
    getApiGroups() {
        return this.#apiGroups.map(group => ({ id: group.id, name: group.name, api: group.api }));
    }
    getSocialProviders() {
        if (!this.#workspaceId) return null;
        const apiGroups = this.getApiGroups();
        const groups = apiGroups.filter(group => group.name.match('-oauth'));
        const socialProviders = groups.reduce((providers, group) => ({ ...providers, [group.name]: group }), {});
        return socialProviders;
    }
    getBaseDomain() {
        return this.getInstance()?.baseDomain;
    }
    getCustomDomain() {
        return this.getInstance()?.customDomain;
    }

    /**
     * PUBLIC SETTERS
     */

    async changeApiKey(apiKey) {
        this.#apiKey = apiKey;
        await this.#loadInstances();
        if (!this.getInstance()) {
            await this.changeInstance(null);
        }
    }
    async changeInstance(instanceId) {
        this.#instanceId = instanceId;
        await this.#loadWorkspaces();
        if (!this.getWorkspace()) {
            await this.changeWorkspace(null);
        }
    }
    async changeWorkspace(workspaceId) {
        this.#workspaceId = workspaceId;
        await this.#loadApiGroups();
    }

    /**
     * PUBLIC API
     */
    async fetchApiGroupSpec(apiGroupUrl) {
        if (!apiGroupUrl) return;
        const specUrl = apiGroupUrl.replace('/api:', '/apispec:') + '?type=json';
        try {
            const { data } = await axios.get(specUrl, {
                headers: { Authorization: `Bearer ${this.#apiKey}` },
            });
            return data;
        } catch (error) {
            wwLib.wwLog.error(error);
            if (error && error.response && error.response.status === 429) {
                await this.waitRateLimit();
                return this.fetchApiGroupSpec(apiGroupUrl);
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
    }

    async fetchFullSpec() {
        const groups = this.getApiGroups();
        const chunks = Array.from({ length: Math.ceil(groups.length / 10) }, (v, i) =>
            groups.slice(i * 10, i * 10 + 10)
        );
        const spec = [];
        for (const chunk of chunks) {
            const promises = chunk.map(group => this.fetchApiGroupSpec(group.api));
            spec.push(...(await Promise.all(promises)));
        }
        return spec.filter(group => !!group);
    }

    fixUrl(url) {
        if (!url) return null;
        const _url = new URL(url);
        _url.hostname = this.getBaseDomain() || _url.hostname;

        return _url.href;
    }

    waitRateLimit() {
        wwLib.wwNotification.open({
            text: {
                en: 'Your xano plan only support 10 requests per 20 seconds, please wait ...',
            },
            color: 'yellow',
            duration: '20000',
        });
        return new Promise(resolve => {
            setTimeout(async () => {
                resolve();
            }, 20000);
        });
    }
}
