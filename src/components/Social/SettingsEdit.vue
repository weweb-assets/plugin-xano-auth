<template>
    <div class="xano-auth-settings-edit">
        <wwEditorFormRow label="Extensions" v-if="!providers.length">
            <template #append-label>
                <a
                    class="ww-editor-link ml-2"
                    href="https://docs.xano.com/building-features/authentication-sign-up-and-log-in/authentication/oauth-social-sign-in"
                    target="_blank"
                >
                    Please install extensions in your Xano
                </a>
                <button type="button" class="ww-editor-button -primary -small ml-auto" @click="loadProviders">
                    refresh
                </button>
            </template>
        </wwEditorFormRow>
        <wwEditorFormRow v-for="provider in providers" :label="provider.name" :key="provider.name">
            <div class="xano-auth-settings-edit__elem">
                <wwEditorIcon large name="puzzle" class="xano-auth-settings-edit__icon" />
                <span class="xano-auth-settings-edit__value caption-m">{{ provider.api }}</span>
            </div>
        </wwEditorFormRow>
    </div>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            isLoading: false,
        };
    },
    computed: {
        providers() {
            return Object.values(this.settings.publicData.socialProviders || {}).map(provider => ({
                name: provider.name.split('-')[0].toUpperCase(),
                api: provider.api,
            }));
        },
    },
    mounted() {
        this.loadProviders();
    },
    methods: {
        async loadProviders() {
            try {
                this.isLoading = true;
                const socialProviders = await this.plugin.xanoManager.getSocialProviders();
                this.$emit('update:settings', {
                    ...this.settings,
                    publicData: {
                        ...this.settings.publicData,
                        socialProviders,
                    },
                });
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
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
