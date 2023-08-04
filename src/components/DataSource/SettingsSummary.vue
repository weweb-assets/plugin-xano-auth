<template>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="data" class="mr-2"></wwEditorIcon>
        Production: {{ dataSources.production }}
    </div>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="data" class="mr-2"></wwEditorIcon>
        Staging: {{ dataSources.staging }}
    </div>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="data" class="mr-2"></wwEditorIcon>
        Editor: {{ dataSources.editor }}
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
        dataSources() {
            return {
                editor: this.settings.publicData.xDataSourceEditor || 'Live',
                staging: this.settings.publicData.xDataSourceStaging || 'Live',
                production: this.settings.publicData.xDataSourceProd || 'Live',
            };
        },
    },
};
</script>
