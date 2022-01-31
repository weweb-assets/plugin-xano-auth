<template>
    <wwEditorInputRow
        label="Email"
        type="query"
        :model-value="email"
        bindable
        placeholder="Enter a email"
        @update:modelValue="setEmail"
    />
    <wwEditorInputRow
        label="Password"
        type="query"
        :model-value="password"
        bindable
        placeholder="Enter a password"
        @update:modelValue="setPassword"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Array, default: () => [null] },
    },
    emits: ['update:args'],
    computed: {
        email() {
            return this.args[0];
        },
        password() {
            return this.args[1];
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', [email, this.password]);
        },
        setPassword(password) {
            this.$emit('update:args', [this.email, password]);
        },
    },
};
</script>
