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
                    class="w-full mr-3"
                    disabled
                />
                <button class="pointer" @click.prevent="isKeyVisible = !isKeyVisible">
                    <wwEditorIcon :name="isKeyVisible ? 'eye-off' : 'eye'"></wwEditorIcon>
                </button>
            </div>
        </wwEditorFormRow>
        <wwEditorFormRow required label="Metadata API Key">
            <template #append-label>
                <a class="xano-auth-settings-edit__link" href="https://docs.xano.com/metadata-api" target="_blank">
                    Find it here
                </a>
            </template>
            <div class="flex items-center">
                <wwEditorInputText
                    :type="isKeyVisible ? 'text' : 'password'"
                    name="api-key"
                    placeholder="ey**************"
                    :model-value="settings.privateData.metaApiKey"
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
            :disabled="!settings.privateData.apiKey && !settings.privateData.metaApiKey"
            :options="instancesOptions"
            required
            label="Instance"
            @update:modelValue="changeInstance"
        />
        <wwEditorInputRow
            type="query"
            :placeholder="'Default: ' + baseDomain"
            :model-value="settings.publicData.customDomain"
            :disabled="!settings.privateData.instanceId"
            label="Instance domain"
            @update:modelValue="setCustomDomain"
        />
        <p v-if="incorrectCustomDomain" class="label-sm flex items-center text-red-500 mb-3">
            <wwEditorIcon class="mr-1" name="warning" small />
            The custom domain must not include the protocol (http(s)://)
        </p>
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
            :model-value="getMeEndpoint"
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
            :model-value="loginEndpoint"
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
            :model-value="signupEndpoint"
            :disabled="!settings.privateData.workspaceId"
            :options="endpointsOptions.filter(endpoint => endpoint.label.startsWith('POST'))"
            @update:modelValue="setSignupEndpoint"
        />
    </div>
    <wwLoader :loading="isLoading" />
</template>

<script>
let xanoApi = null;
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
            instances: [],
            workspaces: [],
            apiGroups: [],
            apiSpec: [],
            defaultDomain: null,
        };
    },
    computed: {
        getMeEndpoint() {
            return this.plugin.resolveUrl(this.settings.publicData.getMeEndpoint);
        },
        loginEndpoint() {
            return this.plugin.resolveUrl(this.settings.publicData.loginEndpoint);
        },
        signupEndpoint() {
            return this.plugin.resolveUrl(this.settings.publicData.signupEndpoint);
        },
        instancesOptions() {
            return this.instances.map(instance => ({ label: instance.name, value: String(instance.id) }));
        },
        workspacesOptions() {
            return this.workspaces.map(workspace => ({ label: workspace.name, value: workspace.id, ...workspace }));
        },
        endpointsOptions() {
            return this.apiSpec
                .map(group =>
                    Object.keys(group.paths)
                        .map(path =>
                            Object.keys(group.paths[path]).map(method => ({
                                label: `${method.toUpperCase()} ${path}`,
                                value: this.plugin.resolveUrl(group.servers[0].url + path),
                            }))
                        )
                        .flat()
                )
                .flat();
        },
        incorrectCustomDomain() {
            return (this.settings.publicData.customDomain || '').includes('http');
        },
    },
    async mounted() {
        xanoApi = this.plugin.createApi(this.settings);
        await xanoApi.init();
        this.sync();
    },
    methods: {
        sync() {
            this.instances = xanoApi.getInstances();
            this.workspaces = xanoApi.getWorkspaces();
            this.apiGroups = xanoApi.getApiGroups();
            this.defaultDomain = xanoApi.getBaseDomain();
        },
        async changeApiKey(apiKey) {
            this.isLoading = true;
            await xanoApi.changeApiKey(value);
            this.sync();
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });
            this.isLoading = false;
        },
        async changeInstance(instanceId) {
            this.isLoading = true;
            await xanoApi.changeInstance(value);
            this.sync();
            this.$emit('update:settings', {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    instanceId,
                    workspaceId: null,
                },
                publicData: {
                    ...this.settings.publicData,
                    domain: xanoApi.getBaseDomain(),
                    customDomain: xanoApi.getCustomDomain() || this.settings.publicData.customDomain,
                    loginEndpoint: null,
                    getMeEndpoint: null,
                    signupEndpoint: null,
                },
            });
            this.isLoading = false;
        },
        async changeWorkspace(value) {
            this.isLoading = true;
            await xanoApi.changeWorkspace(value);
            this.sync();
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
            this.isLoading = false;
        },
        setCustomDomain(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, customDomain: value },
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
        async loadApiSpec() {
            this.apiSpec = [];
            try {
                this.isLoading = true;
                const promises = this.apigroups.map(group => xanoApi.fetchApiGroupSpec(group.api));
                this.apiSpec = (await Promise.all(promises)).filter(group => !!group);
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
