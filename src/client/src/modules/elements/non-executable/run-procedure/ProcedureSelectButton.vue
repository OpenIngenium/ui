<template>
    <button class="btn btn-primary" @click="$emit('tableEvent', selectProcedureSection)">Choose</button>
</template>

<script>
    export default {
        name: 'ProcedureSelectButton',
        props: {
            data: {
                type: Object
            }
        },
        computed: {
            selectProcedureSection() {
                return {
                    action: 'selectProcedure',
                    data: {
                        procedure_id: this.data.procedure_id,
                        title: this.data.title,
                        author: this.data.author,
                        institutional_id: this.data.institutional_id,
                        current_version: this.data.current_version,
                        time_created: this.data.time_created,
                        time_saved: this.data.time_saved,
                        description: this.data.description,
                    }
                };
            }
        }
    };
</script>


<style lang="scss" scoped>

</style>
