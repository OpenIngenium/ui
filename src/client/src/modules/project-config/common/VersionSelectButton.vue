<template>
    <button
        type="button"
        class="btn btn-default"
        @click="$emit('tableEvent', selectVersion)"
        >{{ version }}</button>
</template>

<script>
    export default {
        name: "VersionSelectButton",
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        computed: {
            version() {
                return this.data.dictionary_version;
            },
            selectVersion() {
                return {
                    action: 'selectVersion',
                    data: {
                        version: this.data.dictionary_version
                    }
                };
            }
        }
    };
</script>

<style>

</style>
