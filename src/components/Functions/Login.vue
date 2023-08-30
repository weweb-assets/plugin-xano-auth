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
    <wwEditorInputRow
        v-for="(parameter, index) in endpointParameters"
        :key="index"
        :label="parameter.name"
        type="query"
        placeholder="Enter a value"
        bindable
        :binding-validation="parameter.bindingValidation"
        :required="parameter.required"
        :model-value="parameters[parameter.name]"
        @update:modelValue="setParameters({ ...parameters, [parameter.name]: $event })"
    />
    <wwEditorInputRow
        v-if="endpointBody.length"
        label="Body fields"
        type="select"
        multiple
        :options="bodyFieldOptions"
        :model-value="bodyFields"
        placeholder="All body fields"
        @update:modelValue="setBodyFields"
    />
    <wwEditorInputRow
        v-for="(elem, index) in endpointBodyFiltered"
        :key="index"
        :label="elem.name"
        :type="elem.type || 'string'"
        placeholder="Enter a value"
        bindable
        :binding-validation="elem.bindingValidation"
        :required="elem.required"
        :model-value="body[elem.name]"
        @update:modelValue="setBody({ ...body, [elem.name]: $event })"
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
            isLoading: false,
            apiGroup: null,
        };
    },
    mounted() {
        this.isLoading = true;
        this.plugin.xanoManager.onReady(this.refreshApiGroup);
    },
    computed: {
        apiGroupUrl() {
            if (!this.plugin.settings.publicData.loginEndpoint) return null;
            return this.plugin.settings.publicData.loginEndpoint.match(/https:\/\/.*\/api:[\w-]+/g)[0] || null;
        },
        endpoint() {
            if (!this.plugin.settings.publicData.loginEndpoint) return null;
            return this.plugin.settings.publicData.loginEndpoint.match(/https:\/\/.*\/api:.*?(\/.*)/)[1] || null;
        },
        headers() {
            return this.args.headers || [];
        },
        parameters() {
            return this.args.parameters || {};
        },
        bodyFields() {
            return this.args.bodyFields;
        },
        body() {
            return this.args.body || {};
        },
        endpointParameters() {
            return this.plugin.xanoManager.parseSpecEndpointParameters(this.spec, {
                path: this.endpoint,
                method: 'post',
            });
        },
        endpointBody() {
            return this.plugin.xanoManager.parseSpecEndpointBody(this.spec, { path: this.endpoint, method: 'post' });
        },
        endpointBodyFiltered() {
            return this.endpointBody.filter(
                item => !this.bodyFields || !this.bodyFields.length || this.bodyFields.includes(item.name)
            );
        },
        bodyFieldOptions() {
            return this.endpointBody.map(item => ({ label: item.name, value: item.name }));
        },
    },
    methods: {
        setParameters(parameters) {
            this.$emit('update:args', { ...this.args, parameters });
        },
        setHeaders(headers) {
            this.$emit('update:args', { ...this.args, headers });
        },
        setBody(body) {
            for (const bodyKey in body) {
                if (!this.endpointBodyFiltered.find(field => field.name === bodyKey)) {
                    delete body[bodyKey];
                }
            }
            for (const field of this.endpointBodyFiltered) {
                body[field.name] = body[field.name] || null;
            }
            this.$emit('update:args', { ...this.args, body });
        },
        setBodyFields(bodyFields) {
            this.$emit('update:args', { ...this.args, bodyFields });
            this.$nextTick(() => this.setBody({ ...this.body }));
        },
        async refreshApiGroup() {
            try {
                this.isLoading = true;
                this.apiGroup = await this.plugin.xanoManager.fetchApiGroupSpec(this.apiGroupUrl);
                if (!this.apiGroup) {
                    wwLib.wwNotification.open({
                        text: 'Xano signup endpoint cannot be loaded, please check your configuration, it can be because the swagger is disabled.',
                        color: 'yellow',
                        duration: 5000,
                    });
                }
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.hint {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: var(--ww-spacing-04);
    margin-top: var(--ww-spacing-02);
    border-radius: var(--ww-border-radius-02);
    background-color: var(--ww-color-yellow-50);
    color: var(--ww-color-yellow-500);
    border: 1px solid var(--ww-color-yellow-500);

    &--icon {
        width: 48px !important;
        height: 48px !important;
        margin: var(--ww-spacing-02) 0;
    }
    &--title,
    &--description {
        text-align: center;
        margin: var(--ww-spacing-01) 0;
    }
    &--description {
        color: var(--ww-color-theme-dark-300);
    }
}
</style>
