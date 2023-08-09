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
    async fetchApiGroups(workspaceId = this.workspaceId, instanceId = this.instanceId, apiKey = this.apiKey) {
        const workspace = this.workspacesCache[instanceId].find(
            workspace => String(workspace.id) === String(workspaceId)
        );
        if (!workspace) return [];
        return workspace.apigroups.map(group => ({ id: group.id, name: group.name, api: group.api }));
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
        if (!workspaceId) return null;
        const apiGroups = this.fetchApiGroups(workspaceId);
        const groups = apiGroups.filter(group => group.name.match('-oauth'));
        const socialProviders = groups.reduce((providers, group) => ({ ...providers, [group.name]: group }), {});
        return socialProviders;
    },
};
