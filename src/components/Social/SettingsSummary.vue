<template>
    <div class="xano-auth-settings-summary">
        <wwEditorFormRow v-for="provider in providers" :label="provider.name" :key="provider.name">
            <div class="xano-auth-settings-summary__elem">
                <wwEditorIcon large name="puzzle" class="xano-auth-settings-summary__icon" />
                <span class="xano-auth-settings-summary__value caption-m">{{ provider.api }}</span>
            </div>
        </wwEditorFormRow>
    </div>
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
    computed: {
        providers() {
            return Object.values(this.settings.publicData.socialProviders || {}).map(provider => ({
                name: provider.name.split('-')[0].toUpperCase(),
                api: provider.api,
            }));
        },
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
