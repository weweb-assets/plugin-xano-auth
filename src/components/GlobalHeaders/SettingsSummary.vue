<template>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="options" class="mr-2"></wwEditorIcon>
        {{ hasHeaders ? 'Has headers set' : 'No headers set' }}
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
            !!this.settings.publicData.globalHeaders;
        },
    },
};
</script>
