<template>
    <div class="flex flex-col">
        <wwEditorFormRow required label="Developer API key (Deprecated)" v-if="deprecated">
            <template #append-label>
                <a class="ml-2 ww-editor-link" href="https://docs.xano.com/developer-api" target="_blank">
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
                <a class="ml-2 ww-editor-link" href="https://docs.xano.com/metadata-api" target="_blank">
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
                    class="w-full mr-2"
                />
                <button class="ww-editor-button -icon -secondary -dark" @click.prevent="isKeyVisible = !isKeyVisible">
                    <wwEditorIcon :name="isKeyVisible ? 'eye-off' : 'eye'"></wwEditorIcon>
                </button>
            </div>
        </wwEditorFormRow>
        <p v-if="deprecated" class="label-sm flex items-center content-warning mb-3">
            <wwEditorIcon class="mr-1" name="warning" small />
            Setting up your Metadata API key will reset your configuration for this step.
        </p>
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
            :placeholder="'Default: ' + (defaultDomain || '')"
            :model-value="settings.publicData.customDomain"
            :disabled="!settings.privateData.instanceId"
            label="Instance domain"
            @update:modelValue="setCustomDomain"
        />
        <p v-if="incorrectCustomDomain" class="label-sm flex items-center content-alert mb-3">
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
        <wwEditorFormRow label="OAuth">
            <template #append-label>
                <a
                    class="ml-2 ww-editor-link"
                    href="https://docs.xano.com/building-features/authentication-sign-up-and-log-in/authentication/oauth-social-sign-in"
                    target="_blank"
                >
                    How to configure OAuth providers
                </a>
            </template>
            <div class="flex items-center">
                <wwEditorIcon large name="puzzle" class="mr-2" />
                <span class="truncate">{{ socialProviders || 'none' }}</span>
            </div>
        </wwEditorFormRow>
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
        socialProviders() {
            return Object.values(this.settings.publicData.socialProviders || {})
                .map(provider => provider.name.replace('-oauth', ''))
                .join(', ');
        },
        endpointsOptions() {
            return this.apiSpec
                .map(group =>
                    Object.keys(group.paths)
                        .map(path =>
                            Object.keys(group.paths[path]).map(method => ({
                                label: `${method.toUpperCase()} ${path}`,
                                value: this.removeBranchFromUrl(group.servers[0].url) + path,
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
            this.initManager();
        },
        async 'settings.privateData.workspaceId'(value) {
            this.loadApiSpec();
            if (!value) {
                this.$emit('update:settings', {
                    ...this.settings,
                    publicData: {
                        ...this.settings.publicData,
                        loginEndpoint: null,
                        getMeEndpoint: null,
                        signupEndpoint: null,
                    },
                });
            }
        },
    },
    async mounted() {
        this.deprecated = !!this.settings.privateData.apiKey;
        this.initManager();
    },
    methods: {
        async initManager() {
            this.isLoading = true;
            xanoManager = this.plugin.createManager(this.settings);
            try {
                await xanoManager.init();
                await this.loadApiSpec();
                this.sync();
            } catch (error) {
                wwLib.wwNotification.open({
                    text: 'Failed to init Xano, please ensure your API key has the permission required.',
                    color: 'red',
                });
            }
            this.isLoading = false;
        },
        sync() {
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
                    loginEndpoint: xanoManager.fixUrl(this.settings.publicData.loginEndpoint),
                    getMeEndpoint: xanoManager.fixUrl(this.settings.publicData.getMeEndpoint),
                    signupEndpoint: xanoManager.fixUrl(this.settings.publicData.signupEndpoint),
                    socialProviders: xanoManager.getSocialProviders(),
                },
            });
        },
        async changeApiKey(apiKey) {
            this.isLoading = true;
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });

            await xanoManager.changeApiKey(apiKey);
            this.sync();

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
            this.sync();
            this.isLoading = false;
        },
        async changeWorkspace(value) {
            this.isLoading = true;
            await xanoManager.changeWorkspace(value);
            this.sync();
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
                this.apiSpec = await xanoManager.fetchFullSpec();
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        removeBranchFromUrl(url) {
            const split = url.split(':');
            return (split.length === 4 ? [split[0], split[1], split[2]] : split).join(':');
        },
    },
};
</script>
