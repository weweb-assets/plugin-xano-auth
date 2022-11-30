<template>
    <wwEditorInputRow
        label="Provider"
        type="select"
        :model-value="provider"
        :options="availableTypes"
        bindable
        required
        placeholder="Select a provider"
        @update:modelValue="setProvider"
    />
    <wwEditorInputRow
        label="Type"
        type="select"
        :model-value="type"
        :options="types"
        bindable
        required
        placeholder="Select an action"
        @update:modelValue="setType"
    />
    <a
        v-if="provider"
        class="ww-editor-link my-2"
        :href="`https://supabase.com/docs/guides/auth/auth-${provider}`"
        target="_blank"
    >
        See documentation
    </a>
    <wwEditorInputRow
        required
        type="select"
        label="Redirect to"
        :options="pagesOptions"
        :actions="pageActions"
        :model-value="redirectPage"
        placeholder="Select a page"
        bindable
        @update:modelValue="setRedirectPage"
        @action="onAction"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    data() {
        return {
            pageActions: [{ icon: 'add', label: 'Create page', onAction: this.createPage }],
            types: [
                { label: 'Login', value: 'login' },
                { label: 'Signup', value: 'signup' },
                { label: 'Login or Signup', value: 'continue' },
                { label: 'Login or Signup', value: 'access_token', provider: 'twitter-oauth' },
            ],
        };
    },
    watch: {
        availableTypes(types) {
            this.setType(types[0].value);
        },
    },
    computed: {
        providers() {
            return Object.values(this.plugin.settings.publicData.socialProviders || {}).map(provider => ({
                label: provider.name.split('-')[0],
                value: provider.name,
            }));
        },
        availableTypes() {
            const providerTypes = this.types.filter(type => type.provider === this.provider);
            const genericTypes = this.types.filter(type => !type.provider);
            return providerTypes.length ? providerTypes : genericTypes;
        },
        provider() {
            return this.args.provider;
        },
        type() {
            return this.args.type;
        },
        redirectPage() {
            return this.args.redirectPage;
        },
        pagesOptions() {
            return wwLib.wwWebsiteData
                .getPages()
                .filter(page => !page.cmsDataSetPath && !page.pageUserGroups.some(item => !!item))
                .map(page => ({ label: page.name, value: page.id }));
        },
    },
    methods: {
        setProvider(provider) {
            this.$emit('update:args', { ...this.args, provider });
        },
        setType(type) {
            this.$emit('update:args', { ...this.args, type });
        },
        setRedirectPage(redirectPage) {
            this.$emit('update:args', { ...this.args, redirectPage });
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
