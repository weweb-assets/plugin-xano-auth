<template>
    <wwEditorInputRow
        label="Access token"
        type="query"
        :model-value="accessToken"
        bindable
        placeholder="Enter a access token"
        required
        @update:modelValue="setAccessToken"
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
        accessToken() {
            return this.args.accessToken;
        },
    },
    methods: {
        setAccessToken(accessToken) {
            this.$emit('update:args', { ...this.args, accessToken });
        },
    },
};
</script>
