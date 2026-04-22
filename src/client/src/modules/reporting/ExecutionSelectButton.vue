<template>
    <button class="btn btn-primary" @click="$emit('tableEvent', selectProcedureSection)">Choose</button>
</template>

<script>
    export default {
        name: 'ExecutionSelectButton',
        props: {
            data: {
                type: Object
            }
        },
        computed: {
            selectProcedureSection() {
                return {
                    action: 'selectExecution',
                    data: {
                        executionId: this.data.execution_id,
                        conductors: this.data.conductors,
                        timeStarted: this.data.time_started,
                        timeCompleted: this.data.time_completed,
                        usedProcedures: this.data.used_procedures,
                        description: this.data.description,
                        status: this.data.status,
                        venueName: this.data.venue_name,
                        runForScore: this.data.run_for_score
                    }
                };
            }
        }
    };
</script>


<style lang="scss" scoped>

</style>
