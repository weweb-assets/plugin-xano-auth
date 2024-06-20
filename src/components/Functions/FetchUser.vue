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
</template>

<script>
export default {
    props: {
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    computed: {
        headers() {
            return this.args.headers || [];
        },
        withCredentials() {
            return this.args.withCredentials || false;
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
    },
};
</script>
