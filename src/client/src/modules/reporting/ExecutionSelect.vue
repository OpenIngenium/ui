<template>
    <ing-modal v-if="showModal" size="large" @close="close()">
        <template slot="title">
            <h4 style="font-weight: bold; display: inline-block;">Select Execution</h4>
        </template>
        <template slot="body">
            <select-execution-table v-on:setExecution="setExecution"></select-execution-table>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Cancel
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from '../common/IngModal.vue';
    import {commonDateTime} from "../common/filters";
    import SelectExecutionTable from './SelectExecutionTable.vue';
   
    export default {
        name:'ExecutionSelect',
        components: {
            'ing-modal': IngModal,
            'select-execution-table' : SelectExecutionTable
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
        data() {
            return {
                executionDetails: {}
            };
        },
        methods: {
            setExecution: function(event) {
                this.executionDetails = event.data;
                this.$emit('confirm', this.executionDetails);
                this.close();
            },
            close: function() {    
                this.$emit('close');
            },
        },
        filters: {
            commonDateTime: commonDateTime,
        }
    };
</script>

<style scoped>
</style>
