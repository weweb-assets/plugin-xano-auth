<template>
    <wwEditorFormRow label="Login Endpoint">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="data" class="mr-2" /></div>
            <span class="truncate text-stale-500">{{ instanceName }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Get Me  Endpoint">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="data" class="mr-2" /></div>
            <span class="truncate text-stale-500">{{ workspaceName }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Login Endpoint">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="link" class="mr-2" /></div>
            <span class="truncate text-stale-500">{{ settings.publicData.loginEndpoint }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Get Me  Endpoint">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="link" class="mr-2" /></div>
            <span class="truncate text-stale-500">{{ settings.publicData.getMeEndpoint }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Signup Endpoint">
        <div class="flex items-center">
            <div><wwEditorIcon large name="link" class="mr-2" /></div>
            <span class="truncate text-stale-500">{{ settings.publicData.signupEndpoint }}</span>
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
    }),
    mounted() {
        this.isLoading = true;
        this.plugin.xanoManager.onReady(() => {
            this.instanceName = this.plugin.xanoManager.getInstance()?.name;
            this.workspaceName = this.plugin.xanoManager.getWorkspace()?.name;
            this.isLoading = false;
        });
    },
};
</script>
