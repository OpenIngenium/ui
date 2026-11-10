<template>
    <div class="controls">
        <div class="row header">
            <div class="col col-sm-12 dotted-line">
                <button
                    v-if="canAbortExecution"
                    type="button"
                    class="btn btn-xs btn-danger pull-right"
                    style="margin-bottom:5px;"
                    @click="abortExecution">
                    <span
                        class="glyphicon glyphicon-remove">
                        &nbsp;Abort
                    </span>
                </button>
                <div
                    v-else
                    class="pull-right"
                    style="height:27px; width: 20px;"></div>
                <h4>Controls</h4>
            </div>
        </div>
        <div class="execution_mode_toggle">
            <button 
                id="runExecution"
                type="button"
                @click="onRunExecution"
                class="btn btn-default btn-sm pull-left"
                style="margin-right:10px;"
                :disabled="!canRunExecution">
                <span class="glyphicon glyphicon-play">&nbsp;Play</span>
            </button>
            <button 
                id="setPauseExecution"
                type="button"
                @click="onPauseExecution"
                class="btn btn-default btn-sm pull-left"
                style="margin-right:10px;"
                :disabled="!canPauseExecution">
                <span class="glyphicon glyphicon-pause">&nbsp;Pause</span>
            </button>
            <ing-toggle
                :disabled="!isTestConductor"
                :style="isTestConductor ? '' : 'pointer-events: none'"
                :value="isAuto"
                sizeClass="btn-sm"
                onName="Automatic"
                offName="Manual"
                :clickHandler="toggleMode">
            </ing-toggle>
            <button id="suspendExecution"
                :disabled="!canSuspendExecution"
                type="button"
                @click="showConfirmSuspend = true"
                class="btn btn-default btn-sm pull-left"
                style="margin-right:10px;">
                Suspend
            </button>
        </div>
        <ing-modal v-if="showConfirmSuspend" @close="showConfirmSuspend = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Suspend Execution</h4>
            </template>
            <template slot="body">
                Are you sure you want to suspend this execution? This will release the venue for other users.
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    @click="showConfirmSuspend = false">
                    Cancel
                </button>
                <button
                    type="button"
                    class="btn btn-danger"
                    @click="onSuspendExecution"
                    aria-label="Suspend Execution">
                    Suspend
                </button>
            </template>
        </ing-modal>
        <div class="execution_mode_automatic" v-if="isAuto">
            <div class="execution_delay">
                <div class="row">
                    <div class="col col-sm-4">
                        <b style="float:right; margin-right:10px;">Delay</b>
                    </div>
                    <div class="col col-sm-8">
                        <select class="custom-select" 
                            v-model="delay"
                            :disabled="!isTestConductor">
                            <option v-for="(num, idx) in 11" :key="idx">{{ idx }}</option>
                        </select>
                        s
                    </div>
                </div>
            </div>
            <div class="execution_pause_on">
                <div class="row">
                    <div class="col col-sm-4">
                        <b style="float:right; margin-right:10px;">Pause On</b>
                    </div>
                    <div class="col col-sm-3">
                        <label>
                            <input
                                :disabled="!isTestConductor"
                                class="form-check-input"
                                type="checkbox"
                                v-model="pause_condition_error">
                            Error
                        </label>
                    </div>
                    <div class="col col-sm-5">
                        <label>
                            <input
                                :disabled="!isTestConductor"
                                class="form-check-input"
                                type="checkbox"
                                v-model="pause_condition_section_end">
                            Section
                        </label>
                    </div>
                </div>
                <div class="row">
                    <div class="col col-sm-4"></div>
                    <div class="col col-sm-3">
                        <label>
                            <input
                                :disabled="!isTestConductor"
                                class="form-check-input"
                                type="checkbox"
                                v-model="pause_condition_fail">
                            Failure
                        </label>
                    </div>
                    <div class="col col-sm-5">
                        <label>
                            <input
                                :disabled="!isTestConductor"
                                class="form-check-input"
                                type="checkbox"
                                v-model="pause_condition_procedure_end">
                            Procedure
                        </label>
                    </div>
                </div>
                <div class="row">
                    <div class="col col-sm-4"></div>
                    <div class="col col-sm-3">
                        <label>
                            <input
                                :disabled="!isTestConductor"
                                class="form-check-input"
                                type="checkbox"
                                v-model="pause_condition_breakpoint">
                            Breakpoint
                        </label>
                    </div>
                    <div class="col col-sm-5">
                        <label>
                            <input
                                :disabled="!isTestConductor"
                                class="form-check-input"
                                type="checkbox"
                                v-model="pause_condition_command">
                            Command
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <button type="button" 
            :disabled="!canCloseExecution"
            @click="closeExecutionConfirmation" 
            class="btn btn-default btn-sm" 
            style="margin-top:10px;">
            <span class="glyphicon glyphicon-saved">&nbsp;Close Execution</span>
        </button>
        <button type="button" @click="handleSaveAsPdf" 
            class="btn btn-default btn-sm" style="margin-top:10px;">
            <span class="glyphicon glyphicon-download">&nbsp;Save as PDF</span>
        </button>
        <div class="clearfix"></div>
        <ing-modal v-if="showModal" @close="showModal = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Complete?</h4>
            </template>
            <template slot="body">
                If you are done with this execution, press the "Close Execution" button below.
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    @click="cancelExecutionConfirmation">
                    Cancel
                </button>
                <button
                    type="button"
                    class="btn btn-danger"
                    @click="closeExecutionAndRedirect"
                    aria-label="Close Execution">
                    Close Execution
                </button>
            </template>
        </ing-modal>
        <report-submitted-modal
            :show="showReportSubmittedModal"
            :report-id="submittedReportId"
            :message="submittedReportMessage"
            title="As Run PDF Report Request"
            @close="showReportSubmittedModal = false">
        </report-submitted-modal>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex';
    import IngToggle from '../IngToggle.vue';
    import ReportSubmittedModal from '../ReportSubmittedModal.vue';
    import reportApi from '../../../api/report';
    
    export default {
        name: "Controls",
        data() {
            return {
                executionId: this.$route.params.executionId,
                showModal: false, // TODO: move this to vuex app-wide store,
                showConfirmSuspend: false,
                showReportSubmittedModal: false,
                submittedReportId: '',
                submittedReportMessage: ''
            };
        },
        components: {
            IngToggle,
            'report-submitted-modal': ReportSubmittedModal
        },
        computed: {
            ...mapGetters([
                "isPending",
                "execution",
                "isTestConductor",
                "updatingElementInput",
            ]),
            // true = AUTOMATIC
            // false = MANUAL
            status: function() {
                if(this.execution && this.execution.status)
                    return this.execution.status;
                return "IDLE";
            },
            isAuto: function() {
                if(this.execution)
                    return this.execution.mode === "AUTO";
                return false;
            },
            canRunExecution: function() {
                return this.isTestConductor && this.status === 'IDLE' && !this.isPending && !this.updatingElementInput;
            },
            canPauseExecution: function() {
                return this.isTestConductor && this.status === 'RUNNING' && !this.isPending && !this.updatingElementInput;
            },
            canAbortExecution: function() {
                return this.isTestConductor && (this.status === 'RUNNING' || this.status === 'PAUSED');
            },
            canSuspendExecution: function() {
                return this.isTestConductor && this.execution && this.execution.status === 'IDLE';
            },
            canCloseExecution: function() {
                return this.isTestConductor && this.execution && this.execution.status === 'IDLE';
            },
            delay: {
                get: function() {
                    if(this.execution)
                        return this.execution.delay;
                    return "0";
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            delay: parseInt(newVal)
                        }
                    });
                }
            },
            pause_condition_fail: {
                get: function() {
                    if(this.execution)
                        return this.execution.pause_conditions.on_fail;
                    return false;
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            pause_conditions: {
                                on_fail: newVal
                            }
                        }
                    });
                }
            },
            pause_condition_error: {
                get: function() {
                    if(this.execution)
                        return this.execution.pause_conditions.on_error;
                    return false;
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            pause_conditions: {
                                on_error: newVal
                            }
                        }
                    });
                }
            },
            pause_condition_section_end: {
                get: function() {
                    if(this.execution)
                        return this.execution.pause_conditions.on_section_end;
                    return false;
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            pause_conditions: {
                                on_section_end: newVal
                            }
                        }
                    });
                }
            },
            pause_condition_procedure_end: {
                get: function() {
                    if(this.execution)
                        return this.execution.pause_conditions.on_procedure_end;
                    return false;
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            pause_conditions: {
                                on_procedure_end: newVal
                            }
                        }
                    });
                }
            },
            pause_condition_breakpoint: {
                get: function() {
                    if(this.execution)
                        return this.execution.pause_conditions.on_break_point;
                    return false;
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            pause_conditions: {
                                on_break_point: newVal
                            }
                        }
                    });
                }
            },
            pause_condition_command: {
                get: function() {
                    if(this.execution)
                        return this.execution.pause_conditions.on_command;
                    return false;
                },
                set: async function(newVal) {
                    await this.updateAutoExecutionParams({
                        executionId: this.executionId,
                        _params: {
                            pause_conditions: {
                                on_command: newVal
                            }
                        }
                    });
                }
            }
        },
        methods: {
            ...mapActions([
                "setPending",
                "runExecution",
                "setPauseExecution",
                "closeExecution",
                "abortExecution",
                "suspendExecution",
                "resetState",
                "switchExecutionMode",
                "updateAutoExecutionParams",
                "displayFeedback"
            ]),
            toggleMode: async function() {
                await this.switchExecutionMode({
                    executionId: this.executionId,
                    mode: this.isAuto ? "MANUAL" : "AUTO"
                });                
            },
            onRunExecution: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.runExecution();
                this.setPending(false);
            },
            onPauseExecution: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.setPauseExecution();
                this.setPending(false);
            },
            // cancels confirmation modal
            cancelExecutionConfirmation: function() {
                this.showModal = false;
            },
            // shows confirmation modal
            closeExecutionConfirmation: function() {
                this.showModal = true;
            },
            closeExecutionAndRedirect: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                const success = await this.closeExecution({executionId: this.executionId});
                this.showModal = false;
                this.setPending(false);
                if(success) {
                    this.$router.push({
                        path: `/execute/as_run/${this.executionId}`,
                        onComplete: () => {
                            this.resetState();
                        }
                    });
                    this.$router.go();
                }
            },
            handleSaveAsPdf: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);

                try {
                    const response = await reportApi.getExecutionInPdf(this.executionId);
                    this.submittedReportId = response.data.report_id;
                    this.submittedReportMessage = response.data.message;
                    this.showReportSubmittedModal = true;
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            },
            onSuspendExecution: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);

                this.showConfirmSuspend = false;
                const response = await this.suspendExecution({executionId: this.executionId});
                if (response && response.status === 200) {
                    this.$router.push({
                        path: `/executions`,
                        onComplete: () => {
                            this.resetState();
                        }
                    });
                    this.$router.go();
                }
                this.setPending(false);
            }
        }
    };
</script>

<style lang="scss" scoped>
    .execution_mode_manual {
        margin-top: 8px;
    }

    .execution_mode_automatic {
        margin-top: 8px;
        background-color:white;
        border-radius:4px;
        padding:10px;
        border:1px solid #ddd;
    }

    .execution_mode_automatic .col {
        padding:0px;
    }

    .execution_mode_toggle {
        margin-top: 8px;
    }

    .execution_delay {
        margin-top: 8px;
    }

    .execution_pause_on label {
        font-weight:normal;
    }

    button span {
        font-weight: 400;
    }

    .header {
        margin:0px;
        padding:0px;
        margin-bottom:8px;
    }

    .header .dotted-line {
        margin:0px;
        padding:0px;
        border-bottom:2px dotted #c8c8c8;
    }

    @media print {
        .controls{
            display:none;
        }
    }
</style>
