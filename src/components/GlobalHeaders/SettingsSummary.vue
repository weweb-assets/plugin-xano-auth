<template>
    <div class="flex items-center caption-m" :class="{ 'text-blue-500': hasHeaders }">
        <wwEditorIcon name="options" class="mr-2"></wwEditorIcon>
        {{ hasHeaders ? 'Headers are configured' : 'No headers configured' }}
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
