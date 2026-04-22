<template>
    <button
        type="button"
        class="btn btn-light"
        @click="$emit('tableEvent', {action: 'updateVersion', data: version})">
        <span class="glyphicon glyphicon-pencil"></span>
    </button>
</template>

<script>
    export default {
        name: "UpdateButton",
        props: {
            data: {
                type: Object,
                required: true
            },
        },
        computed: {
            version() {
                return this.data.dictionary_version;
            }
        }
    };
</script>

<style scoped>

</style>
