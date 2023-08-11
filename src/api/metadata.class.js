export default class {
    constructor(apiKey, instanceId, workspaceId) {
        this.#apiKey = apiKey;
        this.#instanceId = instanceId;
        this.#workspaceId = workspaceId;
        this.#instances = [];
        this.#workspaces = [];
        this.#apigroups = [];
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

        const { data: instances } = await axios.get('https://app.xano.com/api:meta/instance', {
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        this.#instances = instances;
    }
    async #loadWorkspaces() {
        this.#workspaces = [];
        if (!this.#apiKey || !this.#instanceId || !this.#instances.length) return;

        const instance = this.getInstance();

        if (!instance) return;

        const { data: workspaces } = await axios.get(`${instance.baseDomain}/api:meta/workspace`, {
            headers: { Authorization: `Bearer ${auth}` },
        });

        this.#workspaces = workspaces;
    }
    async #loadApiGroups() {
        this.#apigroups = [];
        const instance = this.getInstance();
        const workspace = this.getWorkspace();
        if (!instance || !workspace) return;
        const { data: apigroups } = await axios.get(
            `${instance.baseDomain}/api:meta/workspace/${workspace.id}/apigroup`,
            {
                headers: { Authorization: `Bearer ${this.#apiKey}` },
            }
        );
        this.#apiGroups = apigroups;
    }

    /**
     * PUBLIC GETTERS
     */
    getInstances() {
        return this.#instances.map(instance => ({
            id: instance.id,
            name: instance.name,
            baseDomain: instance.xano_domain,
            customDomain: instance.custom_domain,
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
        return this.#apiGroups.map(group => ({
            id: group.id,
            name: group.name,
            api: `https://${this.getBaseDomain()}/api:${group.canonical}`,
        }));
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
        } else {
            await this.#loadWorkspaces();
            if (!this.getWorkspaces()) {
                await this.changeWorkspace(null);
            }
        }
    }
    async changeInstance(instanceId) {
        this.#instanceId = instanceId;
        await this.#loadWorkspaces();
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
    }
}
