<template>
    <div class="xano-auth-settings-edit">
        <wwEditorFormRow required label="API Group Base URL">
            <wwEditorInputText
                type="text"
                placeholder="https://********.xano.io"
                :model-value="settings.publicData.baseUrl"
                large
                @update:modelValue="setBaseUrl"
            />
        </wwEditorFormRow>
    </div>
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    methods: {
        setBaseUrl(value) {
            if (value.endsWith('/')) value = value.replace(/\/$/, '');
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, baseUrl: value },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.xano-auth-settings-edit {
    display: flex;
    flex-direction: column;
    &__link {
        color: var(--ww-color-blue-500);
        margin-left: var(--ww-spacing-02);
    }
    &__row {
        display: flex;
        align-items: center;
    }
    &__radio-label {
        margin-left: var(--ww-spacing-02);
    }
}
</style>
