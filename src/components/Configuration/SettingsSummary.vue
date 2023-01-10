<template>
    <div class="xano-auth-settings-summary">
        <wwEditorFormRow
            v-if="
                !settings.privateData.apiKey &&
                (settings.publicData.loginEndpoint ||
                    settings.publicData.loginEndpoint ||
                    settings.publicData.signupEndpoint)
            "
            label="Configuration missing"
        >
            <div class="xano-auth-settings-summary__elem">
                <div><wwEditorIcon large name="warning" class="xano-auth-settings-summary__icon" /></div>
                <span class="xano-auth-settings-summary__value caption-m"
                    >This plugin has been updated to enable social logins Please enter your API key and select your
                    instance, workspace, and endpoints</span
                >
            </div>
        </wwEditorFormRow>
        <template v-else>
            <wwEditorFormRow label="Login Endpoint">
                <div class="xano-auth-settings-summary__elem">
                    <div><wwEditorIcon large name="link" class="xano-auth-settings-summary__icon" /></div>
                    <span class="xano-auth-settings-summary__value caption-m">{{
                        settings.publicData.loginEndpoint
                    }}</span>
                </div>
            </wwEditorFormRow>
            <wwEditorFormRow label="Get Me  Endpoint">
                <div class="xano-auth-settings-summary__elem">
                    <div><wwEditorIcon large name="link" class="xano-auth-settings-summary__icon" /></div>
                    <span class="xano-auth-settings-summary__value caption-m">{{
                        settings.publicData.getMeEndpoint
                    }}</span>
                </div>
            </wwEditorFormRow>
            <wwEditorFormRow label="Signup Endpoint">
                <div class="xano-auth-settings-summary__elem">
                    <div><wwEditorIcon large name="link" class="xano-auth-settings-summary__icon" /></div>
                    <span class="xano-auth-settings-summary__value caption-m">{{
                        settings.publicData.signupEndpoint
                    }}</span>
                </div>
            </wwEditorFormRow>
        </template>
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
