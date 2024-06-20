<template>
    <div class="mb-3 label-sm content-secondary">
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
    <div v-if="isBound" class="mb-3 label-sm content-brand flex items-center">
        <wwEditorIcon name="information-circle" class="mr-1"></wwEditorIcon>
        Format => [{key: 'MyHeaderName', value: 'MyHeaderValue'}]
    </div>
    <wwEditorFormRow>
        <div class="flex items-center">
            <wwEditorInputSwitch
                :model-value="settings.publicData.withCredentials"
                @update:modelValue="updatePublicSettings('withCredentials', $event)"
            />
            <div class="body-sm ml-2">Include credentials (cookies)</div>
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Cookies will be sent automatically. Your Xano endpoint API group need to have CORS configured with the proper header for this to works. 1) Access-Control-Allow-Credentials must be true, 2) Access-Control-Allow-Origin must be set to your editor and production link, not wildcard. [See Xano documentation](https://docs.xano.com/api/the-basics/api-groups#cors-management)"
                class="ml-auto content-secondary"
            />
        </div>
    </wwEditorFormRow>
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    computed: {
        isBound() {
            return this.settings.publicData.globalHeaders && !Array.isArray(this.settings.publicData.globalHeaders);
        },
    },
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
        color: var(--ww-color-content-brand);
        display: inline;
    }
}
.divider {
    width: 100%;
    height: 1px;
    background-color: var(--ww-color-border);
    margin: 12px 0px;
}
</style>
