<template>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="code-branch" class="mr-2"></wwEditorIcon>
        Production: {{ branching.production }}
    </div>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="code-branch" class="mr-2"></wwEditorIcon>
        Staging: {{ branching.staging }}
    </div>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="code-branch" class="mr-2"></wwEditorIcon>
        Editor: {{ branching.editor }}
    </div>
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    computed: {
        branching() {
            return {
                editor: this.settings.publicData.xBranchEditor || 'Live',
                staging: this.settings.publicData.xBranchStaging || 'Live',
                production: this.settings.publicData.xBranchProd || 'Live',
            };
        },
    },
};
</script>
