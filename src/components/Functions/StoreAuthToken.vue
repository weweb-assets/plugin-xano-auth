<template>
    <wwEditorInputRow
        label="Auth token"
        type="query"
        :model-value="authToken"
        bindable
        placeholder="Enter an auth token"
        required
        @update:modelValue="setAuthToken"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    computed: {
        authToken() {
            return this.args.authToken;
        },
    },
    methods: {
        setAuthToken(authToken) {
            this.$emit('update:args', { ...this.args, authToken });
        },
    },
};
</script>
