<template>
    <div class="mb-3 label-sm text-dark-500">
        Global headers will be applied to each request made to your Xano server from the browser side.
    </div>
    <wwEditorInputRow
        label="Headers"
        type="array"
        :model-value="settings.publicData.globalHeaders"
        bindable
        @update:modelValue="updatePublicSettings('globalHeaders', $event)"
        @add-item="updatePublicSettings('globalHeaders', [...(settings.publicData.globalHeaders || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                type="query"
                :model-value="item.key"
                label="Key"
                placeholder="Enter a value"
                small
                bindable
                @update:modelValue="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                type="query"
                :model-value="item.value"
                label="Value"
                placeholder="Enter a value"
                small
                bindable
                @update:modelValue="setItem({ ...item, value: $event })"
            />
        </template>
    </wwEditorInputRow>
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
