export default class {
    #isReady = false;
    #isLoading = false;
    #error = null;
    #callbacks = [];

    #apiKey = null;
    #instanceId = null;
    #workspaceId = null;
    #branch = null;

    #instances = [];
    #workspaces = [];
    #apiGroups = [];

    constructor(apiKey, instanceId, workspaceId, branch) {
        this.#apiKey = apiKey;
        this.#instanceId = instanceId;
        this.#workspaceId = workspaceId;
        this.#branch = branch;
    }

    async init() {
        this.#isReady = false;
        this.#isLoading = true;
        try {
            await this.#loadInstances();
            await this.#loadWorkspaces();
            await this.#loadApiGroups();
            this.#isReady = true;
            this.#callbacks.forEach(callback => callback());
        } catch (error) {
            this.#error = error;
            throw error;
        } finally {
            this.#isLoading = false;
        }
    }

    onReady(callback) {
        if (this.#isReady) callback();
        else this.#callbacks.push(callback);
    }

    hasFailed() {
        return !this.#isReady && !this.#isLoading && this.#error;
    }

    /**
     * PRIVATE
     */
    async #loadInstances() {
        this.#instances = [];
        if (!this.#apiKey) return;

        const { data: instances } = await axios.get('https://app.xano.com/api:meta/instance', {
            headers: { Authorization: `Bearer ${this.#apiKey}` },
        });

        this.#instances = instances;
    }
    async #loadWorkspaces() {
        this.#workspaces = [];
        if (!this.#apiKey || !this.#instanceId || !this.#instances.length) return;

        const instance = this.getInstance();
        if (!instance) return;

        try {
            const { data: workspaces } = await axios.get(`https://${instance.baseDomain}/api:meta/workspace`, {
                headers: { Authorization: `Bearer ${this.#apiKey}` },
            });
            this.#workspaces = workspaces;
        } catch (error) {
            if (error && error.response && error.response.status === 429) {
                await this.waitRateLimit();
                return this.#loadWorkspaces();
            }
        }
    }

    async #loadApiGroups() {
        this.#apiGroups = [];
        const instance = this.getInstance();
        const workspace = this.getWorkspace();
        if (!instance) return;

        if (workspace) {
            this.#apiGroups = await this.#fetchApiGroups(workspace.id);
        } else {
            for (const workspace of this.getWorkspaces()) {
                const groups = await this.#fetchApiGroups(workspace.id);
                this.#apiGroups.push(
                    ...groups.map(group => ({
                        ...group,
                        name: workspace.name + ' - ' + group.name,
                    }))
                );
            }
        }
    }

    async #fetchApiGroups(workspaceId) {
        const instance = this.getInstance();
        if (!instance) return;
        try {
            const { data } = await axios.get(
                `https://${instance.baseDomain}/api:meta/workspace/${workspaceId}/apigroup?per_page=200${this.#branch ? '&branch=' + this.#branch : ''
                }`,
                {
                    headers: { Authorization: `Bearer ${this.#apiKey}` },
                }
            );
            return data.items;
        } catch (error) {
            if (error && error.response && error.response.status === 429) {
                await this.waitRateLimit();
                return this.#fetchApiGroups();
            }
            throw error;
        }
    }

    /**
     * PUBLIC GETTERS
     */
    getInstances() {
        return this.#instances.map(instance => ({
            id: instance.name,
            name: instance.display,
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
        return this.#apiGroups
            .map(group => ({
                id: group.id,
                name: group.name,
                api: `https://${this.getBaseDomain()}/api:${group.canonical}`,
                token: group?.documentation?.token,
            }))
            .sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
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
        if (!this.#apiKey) {
            this.#instanceId = null;
            this.#workspaceId = null;
            this.#instances = [];
            this.#workspaces = [];
            this.#apiGroups = [];
            return;
        }
        await this.init();
        if (!this.getInstance()) {
            await this.changeInstance(null);
        }
        if (!this.getWorkspace()) {
            await this.changeWorkspace(null);
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
    async changeBranch(branch) {
        this.#branch = branch;
        await this.#loadApiGroups();
    }

    /**
     * PUBLIC API UTILS
     */
    async fetchApiGroupSpec(apiGroupUrl, branch = this.#branch) {
        if (!apiGroupUrl) return;
        const apiGroup = this.getApiGroups().find(group => group.api === apiGroupUrl);
        const specUrl = apiGroupUrl.replace('/api:', '/apispec:') + (branch ? ':' + branch : '') + '?type=json' + (apiGroup?.token ? '&token=' + apiGroup.token : '');
        try {
            const { data } = await axios.get(specUrl, {
                headers: { Authorization: `Bearer ${this.#apiKey}` },
            });
            return data;
        } catch (error) {
            wwLib.wwLog.error(error);
            if (error && error.response && error.response.status === 429) {
                await this.waitRateLimit();
                return this.fetchApiGroupSpec(apiGroupUrl, branch);
            }
            if (error && error.response && error.response.status === 404) {
                wwLib.wwNotification.open({
                    text: {
                        en: `Some endpoints cannot be loaded, make sure to have the swagger documentation enabled while you're configuring this plugin if you need them.`,
                    },
                    color: 'yellow',
                });
            }
            return null;
        }
    }

    getBindingValidation(property) {
        return {
            tooltip: property.description || `Must be of type ${property.type}`,
            type: property.type === 'integer' ? 'number' : property.type,
        };
    }

    parseSpecEndpoints(spec) {
        if (!spec) return [];
        return Object.keys(spec.paths)
            .map(path =>
                Object.keys(spec.paths[path]).map(method => ({
                    label: `${method.toUpperCase()} ${path}`,
                    value: `${method}-${path}`,
                }))
            )
            .flat();
    }

    parseSpecEndpointParameters(spec, endpoint) {
        if (!spec || !endpoint) return [];
        return (
            spec.paths?.[endpoint.path]?.[endpoint.method]?.parameters.map(param => ({
                ...param,
                bindingValidation: this.getBindingValidation(param),
            })) || []
        );
    }

    parseSpecEndpointBody(spec, endpoint) {
        if (!spec || !endpoint) return [];
        const body =
            spec.paths?.[endpoint.path]?.[endpoint.method]?.requestBody?.content['application/json'] ||
            spec.paths?.[endpoint.path]?.[endpoint.method]?.requestBody?.content['multipart/form-data'];
        if (!body) return [];

        return Object.keys(body.schema.properties).map(key => {
            const elem = body.schema.properties[key];
            return {
                name: key,
                type: elem.type === 'string' ? 'query' : elem.type,
                required: elem.required,
                bindingValidation: this.getBindingValidation(elem),
            };
        });
    }

    async fetchFullSpec(branch = this.#branch) {
        const groups = this.getApiGroups();
        const chunks = Array.from({ length: Math.ceil(groups.length / 10) }, (v, i) =>
            groups.slice(i * 10, i * 10 + 10)
        );
        const spec = [];
        for (const chunk of chunks) {
            const promises = chunk.map(group => this.fetchApiGroupSpec(group.api, branch));
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
            duration: '21000',
        });
        return new Promise(resolve => {
            setTimeout(async () => {
                resolve();
            }, 21000);
        });
    }
}
