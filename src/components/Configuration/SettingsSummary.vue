<template>
    <div class="xano-auth-settings-summary">
        <wwEditorFormRow label="Domain">
            <div class="xano-auth-settings-summary__elem">
                <div><wwEditorIcon large name="link" class="xano-auth-settings-summary__icon" /></div>
                <span class="xano-auth-settings-summary__value caption-m">{{ settings.publicData.domain }}</span>
            </div>
        </wwEditorFormRow>
    </div>
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
};
</script>

<style lang="scss" scoped>
.xano-auth-settings-summary {
    &__elem {
        display: flex;
        align-items: center;
        &:not(:last-child) {
            margin-bottom: var(--ww-spacing-02);
        }
    }
    &__icon {
        margin-right: var(--ww-spacing-02);
    }
    &__value {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
