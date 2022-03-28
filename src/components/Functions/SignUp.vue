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
    <wwEditorInputRow
        label="Name"
        type="query"
        :model-value="name"
        bindable
        placeholder="Enter a value"
        required
        @update:modelValue="setName"
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
        name() {
            return this.args[2];
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', [email, this.password, this.name]);
        },
        setPassword(password) {
            this.$emit('update:args', [this.email, password, this.name]);
        },
        setName(name) {
            this.$emit('update:args', [this.email, this.password, name]);
        },
    },
};
</script>
