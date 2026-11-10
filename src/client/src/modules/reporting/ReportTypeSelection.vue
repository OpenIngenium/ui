<template>
    <div>
        <div class="row">
            <div class="col-md-4">
                <select class="form-control" v-model="selected">
                    <option 
                        v-for="option in options" 
                        :key="option.value" 
                        :value="option.value">
                        {{option.text}}
                    </option>
                </select>
            </div>
            <div class="col-md-3">
                <button 
                    @click="showModal()"
                    type="button"
                    class="btn btn-md"
                    :class="buttonClass">
                    <i class="glyphicon glyphicon-search">&nbsp;{{buttonLable}}</i>
                </button>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="procedure_cm_container title" style="min-height: 200px; overflow: hidden;">
                    <div class="procedure_section_form procedure_config_management">
                        <div v-if="showProcedureDetails">
                            <div class="row">
                                <div class="col-sm-4"><strong>Procedure ID:</strong></div>
                                <div class="col-sm-8">{{ selectedProcedureDetails.procedure_id }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Institutional ID:</strong></div>
                                <div class="col-sm-8">{{ selectedProcedureDetails.institutional_id }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Title:</strong></div>
                                <div class="col-sm-8">{{ selectedProcedureDetails.title }}</div>
                            </div>
                            <div class="row" style="margin-top: 10px;">
                                <div class="col-sm-12">
                                    <strong class="description">Description:</strong>
                                </div>
                                <div class="col-sm-12">
                                    <p>{{ selectedProcedureDetails.description }}</p>
                                </div>
                            </div>
                            <div class="row">
                                    <div class="col-sm-4"><strong>Author:</strong></div>
                                    <div class="col-sm-8">{{ selectedProcedureDetails.author }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Procedure Created:</strong></div>
                                <div class="col-sm-8">{{ selectedProcedureDetails.time_created | commonDateTime }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Procedure Last Edited:</strong></div>
                                <div class="col-sm-8">{{ selectedProcedureDetails.time_saved | commonDateTime }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Version:</strong></div>
                                <div class="col-sm-8">{{ selectedVersionDetails.version }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Version Created:</strong></div>
                                <div class="col-sm-8">{{ selectedVersionDetails.time_versioned | commonDateTime }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Revision ID:</strong></div>
                                <div class="col-sm-8">{{ selectedVersionDetails.institutional_id }}</div>
                            </div>
                            <div class="row" style="margin-top: 10px;">
                                <div class="col-sm-12">
                                    <strong class="description">Description:</strong>
                                </div>
                                <div class="col-sm-12">
                                    <p>{{ selectedVersionDetails.version_description }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-if="showExecutionDetails">
                            <div class="row">
                                <div class="col-sm-4"><strong>Execution ID:</strong></div>
                                <div class="col-sm-8">{{ selectedExecutionDetails.executionId }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Venue:</strong></div>
                                <div class="col-sm-8">{{ selectedExecutionDetails.venueName }}</div>
                            </div>
                            <div class="row" style="margin-top: 10px;">
                                <div class="col-sm-12">
                                    <strong class="description">Description:</strong>
                                </div>
                                <div class="col-sm-12">
                                    <p>{{ selectedExecutionDetails.description }}</p>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Conductors:</strong></div>
                                <div class="col-sm-8">{{ conductorsStr }}</div>                             
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Procedure IDs:</strong></div>
                                <div class="col-sm-8">{{ procedureIdsStr }}</div>
                            </div>
                            <div class="row">
                                <div class="col-sm-4"><strong>Time Completed:</strong></div>
                                <div class="col-sm-8">{{ selectedExecutionDetails.timeCompleted }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <procedure-version-select 
            :showModal="showProcedureSelectModal"
            @confirm="saveProcedureDetails"
            @close="showProcedureSelectModal=false">
        </procedure-version-select>

        <execution-select
            :showModal="showExecutionSelectModal"
            @confirm="saveExecutionDetails"
            @close="showExecutionSelectModal=false">
        </execution-select>

    </div>    
</template>

<script>
    import ProcedureVersionSelect from './ProcedureVersionSelect.vue';
    import ExecutionSelect from './ExecutionSelect.vue';
    import {commonDateTime} from "../common/filters";

    export default {
        name: "ReportTypeSelection",
        components: {
            'procedure-version-select': ProcedureVersionSelect,
            'execution-select': ExecutionSelect
        },
        props : {
            type: {
                default: 'Base', //can be Base or Target
                type: String,
                required: true
            }
        },
        data() {
            return {
                selected: 'PROCEDURE',
                options: [
                    { text: 'Procedure', value: 'PROCEDURE' },
                    { text: 'Execution', value: 'EXECUTION' },
                ],
                showProcedureSelectModal: false,
                selectedProcedureDetails:'',
                selectedVersionDetails:'',
                showProcedureDetails: false,
                showExecutionSelectModal: false,
                selectedExecutionDetails:'',
                showExecutionDetails: false
            };
        },
        computed:{
            conductorsStr: function() {
                return this.selectedExecutionDetails.conductors.join(', ');
            },
            procedureIdsStr: function() {
                const procedureIds = this.selectedExecutionDetails.usedProcedures.map(usedProcedure => usedProcedure.procedure_id);
                return procedureIds.join(', ');
            },
            buttonLable: function() {
                if (this.selected === 'PROCEDURE') {
                    return `Select ${this.type} Procedure`;
                } else {
                    return `Select ${this.type} Execution`;
                }
            },
            buttonClass: function() {
                if (this.type === 'Base') {
                    return 'btn-primary';
                } else {
                    return 'btn-success';
                }
            }
        },
        methods:{
            showModal(){
                switch(this.selected){
                    case 'PROCEDURE':
                        this.showProcedureSelectModal = true;
                        break;
                    case 'EXECUTION':
                        this.showExecutionSelectModal = true;
                        break;
                }
            },
            saveProcedureDetails: function(procedure,version){
                this.selectedProcedureDetails = procedure;
                this.selectedVersionDetails = version;
                this.showProcedureDetails = true;
                this.$emit('updateReport', this.selected, procedure.procedure_id, version.version);
            },
            saveExecutionDetails: function(execution) {
                this.selectedExecutionDetails = execution;
                this.showExecutionDetails = true;
                this.$emit('updateReport', this.selected, execution.executionId, null);
            },
        },
        filters: {
            commonDateTime: commonDateTime,
        }
    };
</script>

<style lang="scss" scoped>    
.procedure_config_management {
    background-color: #F7F7F7;
    margin-top: 4px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 2px;
    font-size: 12px;
    color: #797979;
    min-height: 150px;
}
</style>
