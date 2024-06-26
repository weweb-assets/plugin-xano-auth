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
    <wwEditorFormRow v-for="(key, index) in legacyParameters" :key="key" :label="key">
        <template #append-label>
            <div class="flex items-center justify-end w-full body-3 content-alert">
                This parameter doesn't exist anymore
                <button
                    type="button"
                    class="ww-editor-button -icon -small -tertiary ml-1"
                    @click="removeParam([key])"
                >
                    <wwEditorIcon small name="trash" />
                </button>
            </div>
        </template>
        <wwEditorInputRow type="query" bindable :model-value="parameters[key]" />
    </wwEditorFormRow>
    <wwEditorInputRow
        v-for="(parameter, index) in endpointParameters"
        :key="parameter.name"
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
    <wwEditorFormRow v-for="(key, index) in legacyBody" :key="key" :label="key">
        <template #append-label>
            <div class="flex items-center justify-end w-full body-3 content-alert">
                This field doesn't exist anymore
                <button
                    type="button"
                    class="ww-editor-button -icon -small -tertiary ml-1"
                    @click="removeBody([key])"
                >
                    <wwEditorIcon small name="trash" />
                </button>
            </div>
        </template>
        <wwEditorInputRow
            type="query"
            bindable
            :model-value="body[key]"
            @update:modelValue="setBody({ ...body, [key]: $event })"
        />
    </wwEditorFormRow>
    <wwEditorInputRow
        v-for="(elem, index) in endpointBodyFiltered"
        :key="elem.name"
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
            spec: null,
        };
    },
    mounted() {
        if (this.plugin.xanoManager.hasFailed()) {
            wwLib.wwNotification.open({
                text: 'Failed to init Xano, please ensure your API key has the permission required.',
                color: 'red',
            });
            return;
        }
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
        withCredentials() {
            return this.args.withCredentials || false;
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
        legacyParameters() {
            if (this.isLoading) return [];
            const fields = this.endpointParameters.map(field => field.name);
            return Object.keys(this.parameters).filter(key => !fields.includes(key));
        },
        legacyBody() {
            if (this.isLoading) return [];
            const fields = this.endpointBody.map(field => field.name);
            return Object.keys(this.body).filter(key => !fields.includes(key));
        },
        forcedCredentials() {
            return this.plugin.settings?.publicData.withCredentials;
        },
    },
    methods: {
        setParameters(parameters) {
            this.$emit('update:args', { ...this.args, parameters });
        },
        setHeaders(headers) {
            this.$emit('update:args', { ...this.args, headers });
        },
        setWithCredentials(withCredentials) {
            this.$emit('update:args', { ...this.args, withCredentials });
        },
        setBody(body) {
            this.$emit('update:args', { ...this.args, body: this.sanitizeBody({ ...body }) });
        },
        setBodyFields(bodyFields) {
            this.$emit('update:args', { ...this.args, bodyFields });
            this.$nextTick(() => this.setBody(this.body));
        },
        removeParam(keys) {
            const parameters = { ...this.parameters };
            for (const key of keys) {
                delete parameters[key];
            }
            this.setParameters({ ...parameters });
        },
        removeBody(keys) {
            const body = { ...this.body };
            for (const key of keys) {
                delete body[key];
            }
            const bodyFields = (this.bodyFields || []).filter(field => !keys.includes(field));
            this.$emit('update:args', { ...this.args, body, bodyFields });
        },
        sanitizeBody(body) {
            const fields = [...this.endpointBodyFiltered.map(f => f.name), ...this.legacyBody];
            for (const bodyKey in body) {
                if (!fields.includes(bodyKey)) {
                    delete body[bodyKey];
                }
            }
            for (const field of fields) {
                body[field] = body[field] || null;
            }

            return body;
        },
        async refreshApiGroup() {
            try {
                this.isLoading = true;
                this.spec = await this.plugin.xanoManager.fetchApiGroupSpec(this.apiGroupUrl);
                if (!this.spec) {
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
    background-color: var(--ww-color-bg-warning-secondary);
    color: var(--ww-color-warning-secondary);
    border: 1px solid var(--ww-color-border-warning-secondary);

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
        color: var(--ww-color-content-tertiary);
    }
}
</style>
