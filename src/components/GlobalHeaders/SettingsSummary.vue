<template>
    <div class="flex items-center caption-m" :class="{ 'text-stale-500': !hasHeaders }">
        <wwEditorIcon name="options" class="mr-2"></wwEditorIcon>
        {{ hasHeaders ? 'Headers are configured' : 'No headers configured' }}
    </div>
    <div class="flex items-center caption-m" :class="{ 'text-stale-500': !hasCredentials }">
        <wwEditorIcon name="toggle" class="mr-2"></wwEditorIcon>
        {{ hasCredentials ? 'Credentials enabled' : 'Credentials disabled' }}
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
        hasCredentials() {
            return !!this.settings.publicData.withCredentials;
        },
    },
};
</script>
