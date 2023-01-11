<template>
    <wwEditorInputRow
        v-for="(parameter, index) in endpointParameters"
        :key="index"
        :label="parameter.name"
        type="query"
        placeholder="Enter a value"
        bindable
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
        :required="elem.required"
        :model-value="body[elem.name]"
        @update:modelValue="setBody({ ...body, [elem.name]: $event })"
    />
    <wwLoader :loading="isLoading" />
    <div class="hint m-2" v-if="!apiGroup">
        <wwEditorIcon class="hint--icon" name="warning" large />
        <div class="hint--title label-2">The Xano Auth plugin has been updated</div>
        <div class="hint--description body-2">
            This does not affect existing actions in workflows. However, if you wish to update or create a Xano auth
            action, you will need to re-enter your API key and re-select your instance, workspace, and endpoints in the
            Xano auth plugin configuration settings.
        </div>
    </div>
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
        this.refreshApiGroup();
    },
    computed: {
        apiGroupUrl() {
            if (!this.plugin.settings.publicData.signupEndpoint) return null;
            return this.plugin.settings.publicData.signupEndpoint.match(/https:\/\/.*\/api:[\w-]+/g)[0] || null;
        },
        endpoint() {
            if (!this.plugin.settings.publicData.signupEndpoint) return null;
            return this.plugin.settings.publicData.signupEndpoint.match(/https:\/\/.*\/api:.*?(\/.*)/)[1] || null;
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
            if (
                !this.apiGroup ||
                !this.endpoint ||
                !this.apiGroup.paths ||
                !this.apiGroup.paths[this.endpoint] ||
                !this.apiGroup.paths[this.endpoint]['post']
            )
                return [];
            return this.apiGroup.paths[this.endpoint]['post'].parameters || [];
        },
        endpointBody() {
            if (
                !this.apiGroup ||
                !this.endpoint ||
                !this.apiGroup.paths ||
                !this.apiGroup.paths[this.endpoint] ||
                !this.apiGroup.paths[this.endpoint]['post'] ||
                !this.apiGroup.paths[this.endpoint]['post'].requestBody
            )
                return [];

            const endpoint =
                this.apiGroup.paths[this.endpoint]['post'].requestBody.content['application/json'] ||
                this.apiGroup.paths[this.endpoint]['post'].requestBody.content['multipart/form-data'];

            return Object.keys(endpoint.schema.properties).map(key => {
                const elem = endpoint.schema.properties[key];
                return {
                    name: key,
                    type: elem.type === 'string' ? 'query' : elem.type,
                    required: elem.required,
                };
            });
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
        async refreshInstance() {
            try {
                this.isLoading = true;
                await this.plugin.fetchInstances();
                await this.plugin.fetchInstance();
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        async refreshApiGroup() {
            try {
                this.isLoading = true;
                this.apiGroup = await this.plugin.getApiGroup(this.apiGroupUrl);
                if (!this.apiGroup) {
                    wwLib.wwNotification.open({
                        text: 'Xano signup endpoint cannot be loaded, please check your configuration.',
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
