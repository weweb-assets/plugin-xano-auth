<template>
    <div class="xano-auth-settings-summary">
        <wwEditorFormRow label="Page to redirect when user is not signed-in">
            <div class="xano-auth-settings-summary__elem">
                <div><wwEditorIcon large name="document" class="xano-auth-settings-summary__icon" /></div>
                <span class="xano-auth-settings-summary__value caption-m">
                    {{ getPageFromId(settings.publicData.afterNotSignInPageId).name }}
                </span>
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
        pages() {
            return wwLib.wwWebsiteData.getPages();
        },
    },
    methods: {
        getPageFromId(id) {
            return this.pages.find(page => page && page.id === id) || {};
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
