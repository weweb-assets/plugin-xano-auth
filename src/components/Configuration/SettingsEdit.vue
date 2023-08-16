<template>
    <div class="xano-auth-settings-edit">
        <wwEditorFormRow required label="Developer API key" v-if="deprecated">
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
                    class="w-full mr-2"
                    :disabled="settings.privateData.metaApiKey"
                />
                <button class="ww-editor-button -icon -secondary -dark" @click.prevent="isKeyVisible = !isKeyVisible">
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
                    name="meta-api-key"
                    placeholder="ey**************"
                    :model-value="settings.privateData.metaApiKey"
                    @update:modelValue="changeMetaApiKey"
                    class="w-full mr-3"
                />
                <button class="ww-editor-button -icon -secondary -dark" @click.prevent="isKeyVisible = !isKeyVisible">
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
            :placeholder="'Default: ' + defaultDomain"
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
let xanoManager = null;
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            deprecated: false,
            useMetaApi: false,
            isKeyVisible: false,
            isLoading: false,
            instances: [],
            workspaces: [],
            apiSpec: [],
            defaultDomain: null,
        };
    },
    computed: {
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
                                value: group.servers[0].url + path,
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
    watch: {
        async 'settings.privateData.metaApiKey'(value) {
            this.isLoading = true;
            if (this.useMetaApi) {
                await xanoManager.changeApiKey(apiKey);
                await this.sync();
            } else {
                await this.initManager();
                this.useMetaApi = true;
            }
            this.isLoading = false;
        },
    },
    async mounted() {
        this.deprecated = !!this.settings.privateData.apiKey;
        this.useMetaApi = !!this.settings.privateData.metaApiKey;
        this.initManager();
    },
    methods: {
        async initManager() {
            this.isLoading = true;
            xanoManager = this.plugin.createManager(this.settings);
            await xanoManager.init();
            await this.sync();
            this.isLoading = false;
        },
        async sync() {
            this.isLoading = true;
            const workspaceChanged = xanoManager.getWorkspace()?.id !== this.settings.publicData.workspaceId;
            workspaceChanged && (await this.loadApiSpec());

            this.instances = xanoManager.getInstances();
            this.workspaces = xanoManager.getWorkspaces();
            this.defaultDomain = xanoManager.getBaseDomain();
            this.$emit('update:settings', {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    instanceId: xanoManager.getInstance()?.id,
                    workspaceId: xanoManager.getWorkspace()?.id,
                },
                publicData: {
                    ...this.settings.publicData,
                    domain: xanoManager.getBaseDomain(),
                    customDomain: xanoManager.getCustomDomain() || this.settings.publicData.customDomain,
                    loginEndpoint: xanoManager.fixUrl(workspaceChanged ? null : this.settings.publicData.loginEndpoint),
                    getMeEndpoint: xanoManager.fixUrl(workspaceChanged ? null : this.settings.publicData.getMeEndpoint),
                    signupEndpoint: xanoManager.fixUrl(
                        workspaceChanged ? null : this.settings.publicData.signupEndpoint
                    ),
                },
            });

            this.isLoading = false;
        },
        async changeApiKey(apiKey) {
            this.isLoading = true;
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });

            await xanoManager.changeApiKey(apiKey);
            await this.sync();

            this.isLoading = false;
        },
        async changeMetaApiKey(metaApiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey: null, metaApiKey },
            });
        },
        async changeInstance(instanceId) {
            this.isLoading = true;
            await xanoManager.changeInstance(instanceId);
            await this.sync();
            this.isLoading = false;
        },
        async changeWorkspace(value) {
            this.isLoading = true;
            await xanoManager.changeWorkspace(value);
            await this.sync();
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
                const promises = xanoManager.getApiGroups().map(group => xanoManager.fetchApiGroupSpec(group.api));
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
