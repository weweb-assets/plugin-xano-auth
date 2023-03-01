<template>
    <p class="mb-3">
        X-Data-Source Header
        <a class="xano-settings-edit__link" href="https://docs.xano.com/database/data-sources" target="_blank">
            Learn more
        </a>
    </p>
    <wwEditorInputRow
        type="query"
        placeholder="Default to live data"
        :model-value="settings.publicData.xDataSourceProd"
        label="In production"
        @update:modelValue="changeXDataSource('xDataSourceProd', $event)"
        small
    />
    <wwEditorInputRow
        type="query"
        placeholder="Default to live data"
        :model-value="settings.publicData.xDataSourceStaging"
        label="In staging"
        @update:modelValue="changeXDataSource('xDataSourceStaging', $event)"
        small
    />
    <wwEditorInputRow
        type="query"
        placeholder="Default to live data"
        :model-value="settings.publicData.xDataSourceEditor"
        label="In editor"
        @update:modelValue="changeXDataSource('xDataSourceEditor', $event)"
        small
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    methods: {
        async changeXDataSource(key, value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, [key]: value },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.xano-settings-edit {
    &__link {
        color: var(--ww-color-blue-500);
        display: inline;
    }
}
.divider {
    width: 100%;
    height: 1px;
    background-color: var(--ww-color-dark-200);
    margin: 12px 0px;
}
</style>
