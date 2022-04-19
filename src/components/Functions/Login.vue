<template>
    <wwEditorInputRow
        label="Email"
        type="query"
        :model-value="email"
        bindable
        placeholder="Enter a email"
        required
        @update:modelValue="setEmail"
    />
    <wwEditorInputRow
        label="Password"
        type="query"
        :model-value="password"
        bindable
        placeholder="Enter a password"
        required
        @update:modelValue="setPassword"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, default: () => ({ email: null, password: null }) },
    },
    emits: ['update:args'],
    computed: {
        email() {
            return this.args.email;
        },
        password() {
            return this.args.password;
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setPassword(password) {
            this.$emit('update:args', { ...this.args, password });
        },
    },
};
</script>
