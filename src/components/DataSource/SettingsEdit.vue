<template>
    <div class="mb-2 label-md">
        X-Data-Source Header
        <a class="xano-settings-edit__link" href="https://docs.xano.com/database/data-sources" target="_blank">
            Learn more
        </a>
    </div>
    <div class="mb-3 label-sm text-yellow-500 flex items-center">
        <wwEditorIcon class="mr-1" name="warning" small />
        Static and cached collections will always use the production setting.
    </div>
    <wwEditorInputRow
        type="query"
        placeholder="Default to live data"
        :model-value="settings.publicData.xDataSourceProd"
        label="In production"
        @update:modelValue="updatePublicSettings('xDataSourceProd', $event)"
        small
    />
    <wwEditorInputRow
        type="query"
        placeholder="Default to live data"
        :model-value="settings.publicData.xDataSourceStaging"
        label="In staging"
        @update:modelValue="updatePublicSettings('xDataSourceStaging', $event)"
        small
    />
    <wwEditorInputRow
        type="query"
        placeholder="Default to live data"
        :model-value="settings.publicData.xDataSourceEditor"
        label="In editor"
        @update:modelValue="updatePublicSettings('xDataSourceEditor', $event)"
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
        async updatePublicSettings(key, value) {
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
