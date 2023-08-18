<template>
    <div class="flex items-center">
        <wwEditorIcon name="options" class="mr-2"></wwEditorIcon>
        {{ hasHeaders ? 'Headers are configured' : 'None' }}
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
        hasHeaders() {
            return !!this.settings.publicData.globalHeaders;
        },
    },
};
</script>
