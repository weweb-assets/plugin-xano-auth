export default {
    instances: null,
    workspacesCache: {},
    apiKey: null,
    instanceId: null,
    workspaceId: null,
    async init(apiKey, instanceId, workspaceId) {
        this.apiKey = apiKey;
        this.instanceId = instanceId;
        this.workspaceId = workspaceId;
        await this.fetchInstances();
        await this.fetchWorkspaces();
    },
    async fetchInstances(apiKey = this.apiKey) {
        if (!apiKey) return;

        const { data: instances } = await axios.get('https://app.xano.com/api:developer/instance', {
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        this.instances = instances;
        this.workspacesCache = {};
        return instances;
    },
    async fetchWorkspaces(instanceId = this.instanceId, apiKey = this.apiKey) {
        if (!apiKey || !instanceId) return;
        if (!this.instances) return;

        const instance = this.instances.find(instance => `${instance.id}` === `${instanceId}`);

        if (!instance) return;

        // Avoid to fetch again using the same tokenUrl
        if (this.workspacesCache[instance.id]) {
            return this.workspacesCache[instance.id];
        }

        const {
            data: { authToken, origin },
        } = await axios.get(instance.tokenUrl, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        const { data: workspaces } = await axios.get(`${origin}/api:developer/workspace?type=json`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        this.workspacesCache[instanceId] = workspaces;
        return workspaces;
    },
    async getApiGroup(apiGroupUrl, workspaceId = this.workspaceId, apiKey = this.apiKey) {
        if (!workspaceId || !apiGroupUrl) return;
        const specUrl = apiGroupUrl.replace('/api:', '/apispec:') + '?type=json';
        try {
            const { data } = await axios.get(specUrl, {
                headers: { Authorization: `Bearer ${apiKey}` },
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
    async getSocialProvider(workspaceId = this.workspaceId) {
        if (!this.instances) await this.fetchInstances();
        const workspaces = await this.fetchWorkspaces();
        if (!workspaces || !workspaceId) return null;
        const workspace = workspaces.filter(workspace => workspace.id === workspaceId);
        if (!workspace) return;
        const groups = workspace[0].apigroups.filter(group => group.name.match('-oauth'));
        const socialProviders = groups.reduce((providers, group) => ({ ...providers, [group.name]: group }), {});
        return socialProviders;
    },
    // base domain can change over time
    pathIsEqual(endpointA, endpointB) {
        const urlA = new URL(endpointA);
        const urlB = new URL(endpointB);
        return urlA.pathname === urlB.pathname;
    },
};
