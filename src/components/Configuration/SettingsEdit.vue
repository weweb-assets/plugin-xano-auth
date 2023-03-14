<template>
    <div class="xano-auth-settings-edit">
        <wwEditorFormRow required label="API key">
            <template #append-label>
                <a class="xano-auth-settings-edit__link" href="https://docs.xano.com/developer-api" target="_blank">
                    Find it here
                </a>
            </template>
            <div class="flex items-center">
                <wwEditorInputText
                    :type="isKeyVisible ? 'text' : 'password'"
                    name="api-key"
                    placeholder="ey**************"
                    :model-value="settings.privateData.apiKey"
                    @update:modelValue="changeApiKey"
                    class="w-full mr-3"
                />
                <button class="pointer" @click.prevent="isKeyVisible = !isKeyVisible">
                    <wwEditorIcon :name="isKeyVisible ? 'eye-off' : 'eye'"></wwEditorIcon>
                </button>
            </div>
        </wwEditorFormRow>
        <wwEditorInputRow
            type="select"
            placeholder="Select an instance"
            :model-value="settings.privateData.instanceId"
            :disabled="!settings.privateData.apiKey"
            :options="instancesOptions"
            required
            label="Instance"
            @update:modelValue="changeInstance"
        />
        <wwEditorInputRow
            label="Workspace"
            type="select"
            placeholder="Select a workspace"
            required
            :model-value="settings.privateData.workspaceId"
            :disabled="!settings.privateData.instanceId"
            :options="workspacesOptions"
            @update:modelValue="changeWorkspace"
        />
        <wwEditorInputRow
            label="Get Me Endpoint"
            type="select"
            full
            placeholder="Select an endpoint"
            required
            :model-value="settings.publicData.getMeEndpoint"
            :disabled="!settings.privateData.workspaceId"
            :options="endpointsOptions.filter(endpoint => endpoint.label.startsWith('GET'))"
            @update:modelValue="setGetMeEndpoint"
        />
        <wwEditorInputRow
            label="Login Endpoint"
            type="select"
            full
            placeholder="Select an endpoint"
            required
            :model-value="settings.publicData.loginEndpoint"
            :disabled="!settings.privateData.workspaceId"
            :options="endpointsOptions.filter(endpoint => endpoint.label.startsWith('POST'))"
            @update:modelValue="setLoginEndpoint"
        />
        <wwEditorInputRow
            label="Signup Endpoint"
            type="select"
            full
            placeholder="Select an endpoint"
            required
            :model-value="settings.publicData.signupEndpoint"
            :disabled="!settings.privateData.workspaceId"
            :options="endpointsOptions.filter(endpoint => endpoint.label.startsWith('POST'))"
            @update:modelValue="setSignupEndpoint"
        />
    </div>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            isKeyVisible: false,
            isLoading: false,
            instances: null,
            instance: null,
            apiGroups: [],
        };
    },
    computed: {
        instancesOptions() {
            if (!this.instances) return [];
            return this.instances.map(instance => ({ label: instance.display, value: `${instance.id}` }));
        },
        workspacesOptions() {
            if (!this.instance) return [];
            return this.instance.map(workspace => ({ label: workspace.name, value: workspace.id, ...workspace }));
        },
        endpointsOptions() {
            if (!this.apiGroups) return [];
            return this.apiGroups
                .map(group =>
                    Object.keys(group.paths)
                        .map(path =>
                            Object.keys(group.paths[path]).map(method => ({
                                label: `${method.toUpperCase()} ${path}`,
                                value: group.servers[0].url + path,
                            }))
                        )
                        .flat()
                )
                .flat();
        },
    },
    watch: {
        async 'settings.privateData.instanceId'(value) {
            this.loadInstance(value);
        },
        async 'settings.privateData.workspaceId'(value) {
            this.loadWorkspace(value);
        },
    },
    async mounted() {
        await this.fetchInstances(this.settings.privateData.apiKey);
        await this.loadInstance(this.settings.privateData.instanceId);
        await this.loadWorkspace(this.settings.privateData.workspaceId);
    },
    methods: {
        async fetchInstances(apiKey) {
            if (!apiKey) return;
            try {
                this.isLoading = true;
                this.instances = await this.plugin.fetchInstances(apiKey);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        changeApiKey(apiKey) {
            this.$emit('update:settings', { ...this.settings, privateData: { ...this.settings.privateData, apiKey } });
            if (!apiKey) return;
            this.fetchInstances(apiKey);
        },
        changeInstance(instanceId) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, instanceId, workspaceId: null },
            });
        },
        changeWorkspace(value) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    workspaceId: value,
                },
                publicData: {
                    ...this.settings.publicData,
                    loginEndpoint: null,
                    getMeEndpoint: null,
                    signupEndpoint: null,
                },
            });
        },
        setLoginEndpoint(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, loginEndpoint: value },
            });
        },
        setGetMeEndpoint(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, getMeEndpoint: value },
            });
        },
        setSignupEndpoint(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, signupEndpoint: value },
            });
        },
        async loadInstance(instanceId) {
            if (!instanceId) return;
            try {
                this.isLoading = true;
                this.instance = await this.plugin.fetchInstance(this.settings.privateData.apiKey, instanceId);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        async loadWorkspace(workspaceId) {
            try {
                if (!workspaceId) return;
                const workspace = this.workspacesOptions.find(workspace => workspace.value === workspaceId);
                if (!workspace) return;
                const promises = workspace.apigroups.map(group => this.plugin.getApiGroup(group.api));
                this.apiGroups = await Promise.all(promises);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.xano-auth-settings-edit {
    display: flex;
    flex-direction: column;
    &__link {
        color: var(--ww-color-blue-500);
        margin-left: var(--ww-spacing-02);
    }
}
</style>
