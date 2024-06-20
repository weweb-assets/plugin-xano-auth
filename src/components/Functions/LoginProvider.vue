<template>
    <wwEditorInputRow
        label="Headers"
        type="array"
        :model-value="headers"
        bindable
        @update:modelValue="setHeaders"
        @add-item="setHeaders([...(headers || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                type="query"
                :model-value="item.key"
                label="Key"
                placeholder="Enter a value"
                bindable
                small
                @update:modelValue="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                type="query"
                :model-value="item.value"
                label="Value"
                placeholder="Enter a value"
                bindable
                small
                @update:modelValue="setItem({ ...item, value: $event })"
            />
        </template>
    </wwEditorInputRow>
    <wwEditorFormRow>
        <div class="flex items-center">
            <wwEditorInputSwitch
                :model-value="forcedCredentials || withCredentials"
                @update:modelValue="setWithCredentials($event)"
                :disabled="forcedCredentials"
            />
            <div class="body-sm ml-2">Include credentials (cookies)</div>
            <wwEditorQuestionMark
                tooltip-position="top-left"
                forced-content="Cookies will be sent automatically. Your Xano endpoint API group need to have CORS configured with the proper header for this to works. 1) Access-Control-Allow-Credentials must be true, 2) Access-Control-Allow-Origin must be set to your editor and production link, not wildcard. [See Xano documentation](https://docs.xano.com/api/the-basics/api-groups#cors-management)"
                class="ml-auto content-secondary"
            />
        </div>
    </wwEditorFormRow>
    <wwEditorInputRow
        label="Provider"
        type="select"
        :model-value="provider"
        :options="providers"
        bindable
        required
        placeholder="Select a provider"
        @update:modelValue="setProvider"
    />
    <wwEditorInputRow
        label="Type"
        type="select"
        :model-value="type"
        :options="availableTypes"
        bindable
        required
        placeholder="Select an action"
        @update:modelValue="setType"
    />
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
    <wwLoader :loading="isLoading" />
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
                // Disabled for now
                // { label: 'Login', value: 'login', excludes: ['twitter-oauth', 'auth0-oauth'] },
                // { label: 'Signup', value: 'signup', excludes: ['twitter-oauth', 'auth0-oauth'] },
                { label: 'Login or Signup', value: 'continue', excludes: ['twitter-oauth'] },
                { label: 'Login or Signup', value: 'access_token', includes: ['twitter-oauth'] },
            ],
        };
    },
    watch: {
        provider(provider) {
            if (!provider || !this.availableTypes.some(type => type.value === this.type)) {
                this.setType(this.availableTypes[0].value);
            }
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
            return this.types.filter(
                type =>
                    (!type.includes || type.includes.includes(this.provider)) &&
                    (!type.excludes || !type.excludes.includes(this.provider))
            );
        },
        headers() {
            return this.args.headers || [];
        },
        withCredentials() {
            return this.args.withCredentials || false;
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
        forcedCredentials() {
            return this.plugin.settings?.publicData.withCredentials;
        },
    },
    methods: {
        setHeaders(headers) {
            this.$emit('update:args', { ...this.args, headers });
        },
        setWithCredentials(withCredentials) {
            this.$emit('update:args', { ...this.args, withCredentials });
        },
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
