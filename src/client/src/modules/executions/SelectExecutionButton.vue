<template>
    <a :href="getUrl">
        {{ getExecutionId }}
    </a>
</template>

<script>
    export default {
        name: 'SelectExecutionButton',
        props: {
            data: {
                executionId: String,
            },
        },
        computed: {
            getExecutionId() {
                return this.data.execution_id;
            },
            getUrl() {
                return `/execute/as_run/${this.data.execution_id}/`;
            },
        },
    };
</script>

<style lang="scss" scoped></style>
