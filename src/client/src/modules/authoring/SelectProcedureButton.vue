<template>
    <a :href="procedureId" @click.stop.prevent="$emit('tableEvent', selectProcedure)">
        {{procedureId}}
    </a>
</template>

<script>
    export default {
        name: 'SelectProcedureButton',
        props: {
            index: {
                type: Number,
                default: undefined,
            },
            data: {
                type: Object,
            },
        },
        computed: {
            procedureId() {
                return this.data.procedure_id;
            },
            selectProcedure() {
                const eventObj = {
                    action: 'selectProcedure',
                    data: {
                        procedure_id: this.procedureId,
                    },
                };
                if (this.index !== undefined) {
                    eventObj.index = this.index;
                }
                return eventObj;
            },
        },
    };
</script>

<style lang="scss" scoped></style>
