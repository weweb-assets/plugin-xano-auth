<template>
    <div class="xano-auth-settings-edit">
        <wwEditorFormRow required label="Page to redirect when user is not signed-in">
            <wwEditorInputTextSelect
                name="after-not-sign-in-page-id"
                :options="pagesOptions"
                :actions="pageActions"
                :model-value="settings.publicData.afterNotSignInPageId"
                placeholder="Select a page"
                large
                @update:modelValue="changePublicSettings('afterNotSignInPageId', $event)"
                @action="onAction"
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
    data() {
        return {
            pageActions: [{ icon: 'add', label: 'Create page', onAction: this.createPage }],
        };
    },
    computed: {
        pagesOptions() {
            return wwLib.wwWebsiteData
                .getPages()
                .filter(page => !page.cmsDataSetPath)
                .map(page => ({ label: page.name, value: page.id }));
        },
    },
    methods: {
        changePublicSettings(key, value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, [key]: value },
            });
        },
        createPage() {
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwTopBar:open', 'WEBSITE_PAGES');
            // eslint-disable-next-line vue/custom-event-name-casing
            wwLib.$emit('wwTopBar:pages:setPage', undefined);
            // eslint-disable-next-line vue/custom-event-name-casing
            this.$nextTick(() => wwLib.$emit('wwTopBar:pages:setMenu', 'ww-page-create'));
        },
        onAction(action) {
            action.onAction && action.onAction();
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
