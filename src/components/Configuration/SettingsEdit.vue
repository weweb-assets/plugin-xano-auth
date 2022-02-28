<template>
    <div class="xano-auth-settings-edit">
        <wwEditorFormRow required label="Login Endpoint">
            <wwEditorInputText
                type="text"
                placeholder="https://********.xano.io/.../login"
                :model-value="settings.publicData.loginEndpoint"
                @update:modelValue="setLoginEndpoint"
            />
        </wwEditorFormRow>
        <wwEditorFormRow required label="Get Me Endpoint">
            <wwEditorInputText
                type="text"
                placeholder="https://********.xano.io/.../me"
                :model-value="settings.publicData.getMeEndpoint"
                @update:modelValue="setGetMeEndpoint"
            />
        </wwEditorFormRow>
        <wwEditorFormRow required label="Signup Endpoint">
            <wwEditorInputText
                type="text"
                placeholder="https://********.xano.io/.../signup"
                :model-value="settings.publicData.signupEndpoint"
                @update:modelValue="setSignupEndpoint"
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
        setLoginEndpoint(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, loginEndpoint: value },
            });
        },
        setGetMeEndpoint(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, getMeEndpoint: value },
            });
        },
        setSignupEndpoint(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, signupEndpoint: value },
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.xano-auth-settings-edit {
    display: flex;
    flex-direction: column;
}
</style>
