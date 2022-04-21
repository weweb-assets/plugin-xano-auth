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
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    computed: {
        email() {
            return this.args.email;
        },
        password() {
            return this.args.password;
        },
        name() {
            return this.args.name;
        },
    },
    methods: {
        setEmail(email) {
            this.$emit('update:args', { ...this.args, email });
        },
        setPassword(password) {
            this.$emit('update:args', { ...this.args, password });
        },
        setName(name) {
            this.$emit('update:args', { ...this.args, name });
        },
    },
};
</script>
