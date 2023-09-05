<template>
    <wwEditorFormRow label="Instance">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="data" class="mr-2" /></div>
            <span class="truncate">{{ instanceName }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Workspace">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="data" class="mr-2" /></div>
            <span class="truncate">{{ workspaceName }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Login Endpoint">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="link" class="mr-2" /></div>
            <span class="truncate">{{ getPath(settings.publicData.loginEndpoint) }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Get Me  Endpoint">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="link" class="mr-2" /></div>
            <span class="truncate">{{ getPath(settings.publicData.getMeEndpoint) }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Signup Endpoint">
        <div class="flex items-center">
            <div><wwEditorIcon large name="link" class="mr-2" /></div>
            <span class="truncate">{{ getPath(settings.publicData.signupEndpoint) }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="OAuth">
        <div class="flex items-center">
            <div><wwEditorIcon large name="puzzle" class="mr-2" /></div>
            <span class="truncate">{{ socialProviders }}</span>
        </div>
    </wwEditorFormRow>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    data: () => ({
        isLoading: false,
        instanceName: null,
        workspaceName: null,
        socialProviders: null,
    }),
    mounted() {
        if (this.plugin.xanoManager.hasFailed()) {
            wwLib.wwNotification.open({
                text: 'Failed to init Xano, please ensure your API key has the permission required.',
                color: 'red',
            });
            return;
        }

        this.isLoading = true;
        this.plugin.xanoManager.onReady(() => {
            this.instanceName = this.plugin.xanoManager.getInstance()?.name;
            this.workspaceName = this.plugin.xanoManager.getWorkspace()?.name;
            this.socialProviders = Object.values(this.settings.publicData.socialProviders || {})
                .map(provider => provider.name.replace('-oauth', ''))
                .join(', ');
            this.isLoading = false;
        });
    },
    methods: {
        getPath(url) {
            return url.replace(/^.*\/\/[^\/]+\/[^\/]+/, '');
        },
    },
};
</script>
