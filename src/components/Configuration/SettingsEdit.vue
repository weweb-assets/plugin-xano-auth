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
            workspaces: null,
            apiGroups: [],
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
            if (!this.instances) return [];
            return this.instances.map(instance => ({ label: instance.display, value: String(instance.id) }));
        },
        workspacesOptions() {
            if (!this.workspaces) return [];
            return this.workspaces.map(workspace => ({ label: workspace.name, value: workspace.id, ...workspace }));
        },
        endpointsOptions() {
            if (!this.apiGroups) return [];
            return this.apiGroups
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
        defaultDomain() {
            return (
                this.settings.publicData.domain ||
                this.instances?.find(instance => String(instance.id) === this.settings.privateData.instanceId)?.host
            );
        },
        incorrectCustomDomain() {
            return (this.settings.publicData.customDomain || '').includes('http');
        },
    },
    watch: {
        async 'settings.privateData.apiKey'(value) {
            await this.loadInstances(value);
            if (
                this.settings.privateData.instanceId &&
                this.instances.length &&
                !this.instances.some(instance => String(instance.id) === String(this.settings.privateData.instanceId))
            ) {
                this.changeInstance(null);
            } else {
                await this.loadWorkspaces(this.settings.privateData.instanceId);
                if (!this.workspaces?.some(workspace => workspace.id === this.settings.privateData.workspaceId)) {
                    this.changeWorkspace(null);
                }
            }
        },
        async 'settings.privateData.instanceId'(value) {
            this.loadWorkspaces(value);
        },
        async 'settings.privateData.workspaceId'(value, oldValue) {
            await this.loadApiGroups(value);
            if (!value || (value && oldValue)) {
                wwLib.wwNotification.open({
                    text: {
                        en: "You are updating your workspace ? Don't forget to review steps 2, 3 and 5 to update them if needed.",
                    },
                    color: 'blue',
                    duration: '8000',
                });
            }
        },
    },
    async mounted() {
        await this.loadInstances(this.settings.privateData.apiKey);
        await this.loadWorkspaces(this.settings.privateData.instanceId);
        await this.loadApiGroups(this.settings.privateData.workspaceId);
    },
    methods: {
        async loadInstances(apiKey) {
            this.instances = [];
            if (!apiKey) return;
            try {
                this.isLoading = true;
                this.instances = await this.plugin.api.fetchInstances(apiKey);
            } catch (err) {
                wwLib.wwNotification.open({
                    text: {
                        en: 'Unable to fetch your instance, please verify your API key',
                    },
                    color: 'red',
                    duration: '5000',
                });
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        changeApiKey(apiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });
        },
        changeInstance(instanceId) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    instanceId,
                    workspaceId: null,
                },
                publicData: {
                    ...this.settings.publicData,
                    domain: this.instances.find(instance => String(instance.id) === instanceId)?.host,
                    loginEndpoint: null,
                    getMeEndpoint: null,
                    signupEndpoint: null,
                },
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
        async loadWorkspaces(instanceId) {
            this.workspaces = null;
            if (!instanceId) return;
            try {
                this.isLoading = true;
                this.workspaces = await this.plugin.api.fetchWorkspaces(instanceId, this.settings.privateData.apiKey);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        async loadApiGroups(workspaceId) {
            this.apiGroups = [];
            try {
                this.isLoading = true;
                const apigroups = await this.plugin.api.fetchApiGroups(
                    workspaceId,
                    this.settings.privateData.instanceId,
                    this.settings.privateData.apiKey
                );

                const promises = apigroups.map(group =>
                    this.plugin.api.getApiGroup(group.api, workspaceId, this.settings.privateData.apiKey)
                );
                this.apiGroups = (await Promise.all(promises)).filter(group => !!group);
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
