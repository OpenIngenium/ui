<template>
    <div>
        <div v-if="isLevelTwoDetail" class="row">
            <div class="col-xs-12 top-buffer">
                <table class="table">
                    <thead>
                    <tr>
                        <th>VI</th>
                        <th>Steps</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="col-xs-6 table-column" width="50%;"  :class="modStyle(elementId, `vis`)">
                            <span v-for="vi in _vis" :key="vi.vi_id">
                                <span class="badge badge-warning">
                                    <span>{{vi.vi_name}}</span>
                                    <button 
                                        v-if="!disableFields"
                                        type="button" 
                                        class="close" 
                                        aria-label="Close" 
                                        @click="handleDeleteVi(vi)">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </span>
                            </span>
                        </td>
                        <td class="col-xs-6 table-column" width="50%;"  :class="modStyle(elementId, `steps`)">
                            <span v-for="step in steps" :key="step.elem_id">
                                <div class="step-container">
                                    <span class="badge badge-info">
                                        <span>{{step.number}} - {{step.title ? step.title : "No Title"}}</span>
                                        <button
                                            v-if="!disableFields"
                                            type="button"
                                            class="close"
                                            aria-label="Close"
                                            @click="handleDeleteStep(step.elem_id)">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </span>
                                    <span v-if="stepResultStatus(step.elem_id)"
                                        :class="stepResultClasses(step.elem_id)" 
                                        :title="stepResultTooltip(step.elem_id)" 
                                    ></span>
                                </div>
                            </span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="isLevelTwoDetail" class="row">
            <div class="col-xs-12 top-buffer">
                <button
                    type="button"
                    class="btn btn-primary ing-tooltip"
                    :disabled="disableFields"
                    data-toggle="tooltip" 
                    data-placement="top"
                    data-trigger="hover" 
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_exec_vi_status_step"
                    @click="handleShowSelectVisModal()">
                    Select VIs
                </button>
                <button
                    type="button"
                    class="btn btn-primary pull-right ing-tooltip"
                    :disabled="disableFields"
                    data-toggle="tooltip" 
                    data-placement="top"
                    data-trigger="hover" 
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_exec_vi_status_select_steps"
                    @click="handleShowSelectStepsModal">
                    Select Steps
                </button>
            </div>
        </div>

        <!-- Modals -->
        <select-vis-modal
            tableId="verificationItemStatusSelectVisModal"
            :use-vis-from-parent="true"
            :vis-from-parent="allSelectedVis"
            :show-modal="showSelectVisModal"
            :choose-vi-button="chooseViButton"
            :element-id="this.elementId"
            @save="handleCloseAndSaveSelectVisModal()"
            @cancel="handleCloseSelectVisModal()">
        </select-vis-modal>
        <select-steps-modal
           :show-modal="showSelectStepsModal"
           @close="handleCloseSelectStepsModal">
        </select-steps-modal>
    </div>

</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import SelectVisModal from "../../../common/verification-item/SelectVisModal.vue";
    import ChooseViButton from "./ChooseViButton.vue";
    import SelectStepsModal from "./SelectStepsModal.vue";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "VerificationItemStatusElement",
        components: {
            "select-vis-modal": SelectVisModal,
            "select-steps-modal": SelectStepsModal,
        },
        data() {
            return {
                showSelectVisModal: false,
                showSelectStepsModal: false,
                chooseViButton: ChooseViButton,
            };
        },
        computed: {
            ...mapGetters([
                "getVisByElementId",
                "getStepsByElementId",
                "getStepResultsByElementId",
                "allSelectedVis",
                "modStyle",
            ]),
            _vis: function() {
                return this.getVisByElementId(this.elementId);
            },
            steps: function() {
                return this.getStepsByElementId(this.elementId);
            },
            stepResults: function() {
                return this.getStepResultsByElementId(this.elementId);
            },
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            }
        },
        methods: {
            ...mapActions([
                "setSelectedVisStepElementId",
                "deleteViFromStatusStep",
                "deleteStepFromStep",
            ]),
            handleShowSelectVisModal: function() {
                this.setSelectedVisStepElementId({elementId: this.elementId});
                this.showSelectVisModal = true;
            },
            handleCloseSelectVisModal: function() {
                this.showSelectVisModal = false;
            },
            handleShowSelectStepsModal: function() {
                this.setSelectedVisStepElementId({elementId: this.elementId});
                this.showSelectStepsModal = true;
            },
            handleCloseSelectStepsModal: function() {
                this.showSelectStepsModal = false;
            },
            handleDeleteVi: function(vi) {
                this.setSelectedVisStepElementId({elementId: this.elementId});
                this.deleteViFromStatusStep({vi: vi});
            },
            handleDeleteStep: function(elem_id) {
                this.deleteStepFromStep({elementId: this.elementId, elem_id: elem_id});
            },
            stepResultStatus: function(elem_id) {
                const result = this.stepResults.find((stepResult) => stepResult.elem_id === elem_id);
                if (result && result.status) {
                    return result.status;
                } 
                return '';
            },            
            stepResultClasses: function(elem_id) {
                const status = this.stepResultStatus(elem_id);
                
                if (status === 'NOT_FOUND') {
                    return ['error', 'glyphicon', 'glyphicon-ban-circle'];
                } else if (status === 'PASS' || status === 'OVERRIDE_PASS') {
                    return ['pass', 'glyphicon', 'glyphicon-ok'];
                } else if (status === 'FAIL' || status === 'OVERRIDE_FAIL') {
                    return ['fail', 'glyphicon', 'glyphicon-remove'];
                } else if (status === 'ERROR') {
                    return ['error', 'glyphicon', 'glyphicon-exclamation-sign'];
                } else {
                    return [];
                }
            },
            stepResultTooltip: function(elem_id) {
                const status = this.stepResultStatus(elem_id);
                
                if (status === 'NOT_FOUND') {
                    return 'Step was not found';
                } else if (status === 'PASS') {
                    return 'Step passed';
                } else if (status === 'FAIL') {
                    return 'Step failed';
                } else if (status === 'ERROR') {
                    return 'Step errored';
                } else {
                    return '';
                }
            },     
            handleCloseAndSaveSelectVisModal: function() {
                this.showSelectVisModal = false;
            }       
        }
    };
</script>

<style lang="scss" scoped>
    .top-buffer {
        margin-top: 10px;
    }
    
    .step-container {
        display: flex;
        align-items: center;
    }

    /* Selected-item badge */
    .badge {
        display: inline-block;
        line-height: 21px;
        margin-top: 1px;
        margin-bottom: 1px;
        white-space: initial;
    }
    .badge > span {
        display: inline-block;
        vertical-align: middle;
    }
    .table-column {
        vertical-align: top !important;
    }
    .pass {
        color: #019e11;
        display: inline-block;
    }
    .fail {
        color: #ff9900;
        display: inline-block;
    }
    .error {
        color: #cf2928;
        display: inline-block;
    }    
</style>
