<template>
    <div>
        <ing-modal 
            v-show="approveAsRunModal" 
            @close="approveAsRunModal = false" 
            size="medium">
            <template slot="title">
                <h4><span class="glyphicon glyphicon-thumbs-up"></span> Approve As-Run</h4>
            </template>

            <template slot="body">
                <textarea class="form-control" v-model="approveAsRunText" rows="3"></textarea>
            </template>

            <template slot="footer">
                <button type="button" class="btn btn-primary pull-right" @click="approveAsRunCallback('IN_REVIEW')">Approve</button>
                <button type="button" class="btn pull-right" @click="approveAsRunModal = false">Cancel</button>
            </template>
        </ing-modal>

        <ing-modal 
            v-show="dataReviewModal" 
            @close="dataReviewModal = false" 
            size="medium">
            <template slot="title">
                <h4><span class="glyphicon glyphicon-book"></span>Complete Closeout</h4>
            </template>

            <template slot="body">
                <textarea class="form-control" v-model="dataReviewText" rows="3"></textarea>
            </template>

            <template slot="footer">
                <button type="button" class="btn btn-primary pull-right" @click="dataReviewCallback">Approve</button>
                <button type="button" class="btn pull-right" @click="dataReviewModal = false">Cancel</button>
            </template>
        </ing-modal>

        <ing-modal 
            v-show="unfinalizeAsRunModal" 
            @close="unfinalizeAsRunModal = false" 
            size="medium">
            <template slot="title">
                <h4><span class="glyphicon glyphicon-exclamation-sign"></span> Unfinalize As-Run</h4>
            </template>

            <template slot="body">
                <div>Rationale:</div>
                <textarea class="form-control" v-model="unfinalizeAsRunText" rows="3"></textarea>
            </template>

            <template slot="footer">
                <button type="button" class="btn btn-primary pull-right" @click="unfinalizeAsRunCallback('IN_REVIEW')">Unfinalize</button>
                <button type="button" class="btn pull-right" @click="unfinalizeAsRunModal = false">Cancel</button>
            </template>
        </ing-modal>

        <participants-modal
            :showModal="showParticipantsModal"
            @close="showParticipantsModal = false">
        </participants-modal>

        <div class="row header">
            <div class="col col-sm-12 dotted-line">
                <a class="statusExpand" @click="toggleDisplay()">
                    <h4>Status</h4> 
                    <i v-if="display" class="glyphicon glyphicon-menu-up"></i>
                    <i v-else class="glyphicon glyphicon-menu-down"></i>
                    <span v-if="current_step_number" style="font-size: 20px; margin-left: 30px;">({{ statusText }}: {{ current_step_number }})</span>
                    <span v-else style="font-size: 20px; margin-left: 30px;">({{ statusText }})</span>
                </a>
            </div>
        </div>
        <div v-if="display" class="execution_status">
            <div class="row">
                <div class="col-sm-6"><strong>Status</strong></div>
                <div class="col-sm-6">{{ statusText }}</div>
            </div>
            <div class="row">
                <div class="col-sm-6"><strong>Mode</strong></div>
                <div class="col-sm-6">{{ mode }}</div>
            </div>
            <div class="row">
                <div class="col-sm-6"><strong>Time Elapsed</strong></div>
                <div class="col-sm-6">{{ time_elapsed }}</div>
            </div>
            <div
                v-if="this.executionOpen"
                class="row">
                <div class="col-sm-6"><strong>Current Step</strong></div>
                <div class="col-sm-6">
                    <a 
                        href="#" 
                        class="overflow-link"
                        @click="jumpToStep(current_step_id, $event)"><b>{{ current_step_number }}</b> {{ current_step_title }}</a>
                </div>
            </div>
            <div
                v-if="this.executionOpen" 
                class="row">
                <div class="col-sm-6"><strong>Current Procedure</strong></div>
                <div class="col-sm-6">
                    <a 
                        href="#" 
                        class="overflow-link"
                        @click="jumpToStep(current_procedure_id, $event)">{{ current_procedure_title }}</a>
                </div>
            </div>
            <div
                class="row">
                <div class="col-sm-6"><strong>Executed Steps</strong></div>
                <div class="col-sm-6">{{ executed_steps }}</div>
            </div>
            <div
                class="row">
                <div class="col-sm-6"><strong>Steps</strong></div>
                <div class="col-sm-6">
                    <span
                        style="color:green;"
                        :title="passed_steps + ' passed steps'">{{ passed_steps }}</span> /
                    <span
                        style="color:#ff8c00;"
                        :title="failed_steps + ' failed steps'">{{ failed_steps }}</span> /
                    <span
                        style="color:red;"
                        :title="errored_steps + ' errored steps'">{{ errored_steps }}</span>
                </div>
            </div>
            <div
                v-if="!this.isAsRun && this.executionOpen"
                class="row">
                <div class="col-sm-6"><strong>Test Conductor</strong></div>
                <div class="col-sm-6">{{ testConductor }}</div>
            </div>
            <div
                v-if="!this.isAsRun && this.executionOpen"
                class="row">
                <div class="col-sm-6"><strong>Redline Approvers</strong></div>
                <a v-if="isTestConductor" href="#" class="col-sm-6" @click.stop="showParticipantsModal=true">{{ redlineApproversText }}</a>
                <div v-else class="col-sm-6">{{ redlineApproversText }}</div>
            </div>
            <div
                v-if="!this.isAsRun && this.executionOpen"
                class="row">
                <div class="col-sm-6"><strong>Participants</strong></div>
                <a v-if="isTestConductor" href="#" class="col-sm-6" @click.stop="showParticipantsModal=true">{{ participantsText }}</a>
                <div v-else class="col-sm-6">{{ participantsText }}</div>
            </div>
            <div
                v-if="this.isAsRun" 
                class="row">
                <div class="col-sm-6"><strong>Test Conductors</strong></div>
                <div class="col-sm-6">{{ test_conductors.join(", ") }}</div>
            </div>
            <div
                v-if="!this.executionOpen" 
                class="row">
                <div class="col-sm-6"><strong>Approved By</strong></div>
                <div class="col-sm-6">{{ approved_by }}</div>
            </div>
            <div
                v-if="!this.executionOpen" 
                class="row">
                <div class="col-sm-6"><strong>Approved On</strong></div>
                <div class="col-sm-6">{{ approved_on }}</div>
            </div>
            <div
                v-if="!this.executionOpen" 
                class="row">
                <div class="col-sm-6"><strong>Reviewers</strong></div>
                <div class="col-sm-6">{{ _reviewers.join(", ") }}</div>
            </div>
            <div
                v-if="!this.executionOpen" 
                class="row">
                <div class="col-sm-6"><strong>Review Closed By</strong></div>
                <div class="col-sm-6">{{ review_closed_by }}</div>
            </div>
            <div
                v-if="!this.executionOpen" 
                class="row">
                <div class="col-sm-6"><strong>Review Closed On</strong></div>
                <div class="col-sm-6">{{ review_closed_on }}</div>
            </div>
            <div
                class="row">
                <div class="col-sm-6"><strong>Ingenium Version</strong></div>
                <div class="col-sm-6">{{ ingenium_version }}</div>
            </div>
            <div class="row" style="margin-left:0px; margin-top:5px;">
                <button 
                    v-if="this.isAsRun && this.execution &&  (this.execution.status == 'CLOSED')"
                    @click="approveAsRunModal = !approveAsRunModal"
                    type="button" 
                    class="btn btn-default"><span class="glyphicon glyphicon-thumbs-up"></span>&nbsp;Approve As-Run</button>
                <button 
                    v-if="this.isAsRun && this.execution && (this.execution.status == 'FINALIZED') && this.isAdmin"
                    @click="unfinalizeAsRunModal = !unfinalizeAsRunModal"
                    type="button" 
                    class="btn btn-default"><span class="glyphicon glyphicon-exclamation-sign"></span>&nbsp;Unfinalize</button>
                <button 
                    v-if="this.isAsRun && this.execution && this.execution.status == 'IN_REVIEW'"
                    @click="dataReviewModal = !dataReviewModal"
                    type="button" 
                    class="btn btn-default"><span class="glyphicon glyphicon-thumbs-up"></span>&nbsp;Complete Closeout</button>
                <button 
                    v-if="this.isAsRun && this.execution && this.execution.status == 'IN_REVIEW'"
                    @click="approveAsRunCallback('CLOSED')"
                    type="button" 
                    class="btn btn-default"><span class="glyphicon glyphicon-circle-arrow-left"></span>&nbsp;Undo As-Run Approval</button>
                <button 
                    v-if="this.isAsRun && this.execution"
                    @click="handleSaveAsPdf"
                    type="button" 
                    class="btn btn-default"><span class="glyphicon glyphicon-download"></span>&nbsp;Save as PDF</button>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import IngModal from "../../common/IngModal.vue";
    import ParticipantsModal from "./ParticipantsModal.vue";
    //import dateformat from "dateformat";
    import reportApi from '../../../api/report';
    import { forceFileDownload, isAdmin } from '../utils';

    export default {
        name: "Status",
        data() {
            return {
                current_time: Date.now(),
                approveAsRunModal: false,
                unfinalizeAsRunModal: false,
                approveAsRunText: "",
                unfinalizeAsRunText: "",
                dataReviewModal: false,
                dataReviewText: "",
                display: true,
                showParticipantsModal: false
            };
        },
        components: {
            'ing-modal': IngModal,
            'participants-modal': ParticipantsModal,
        },
        props: {
            isAsRun: {
                type: Boolean,
                default: false,
                required: false
            },
            jumpToStep: {
                type: Function
            },
        },
        created() {
            let self = this;
            setInterval(function() {
                self.current_time = Date.now();
            }, 1000);
        },
        computed: {
            ...mapGetters([
                "execution",
                "executionOpen",
                "reviewers",
                "redlineApprovers",
                "testConductor",
                "isTestConductor",
                "participants",
                "isPending",
            ]),
            redlineApproversText: function() {
                if (this.redlineApprovers && this.redlineApprovers.length > 0) {
                    return this.redlineApprovers.join(', ');
                } else {
                    return 'Add...';
                }
            },
            participantsText: function() {
                if (this.participants && this.participants.length > 0) {
                    return this.participants.join(', ');
                } else {
                    return 'Add...';
                }
            },
            statusText: function() {
                if(this.execution && this.execution.status)
                    return `${this.execution.status.charAt(0)}${this.execution.status.toLowerCase().substring(1)}`;
                return "Idle";
            },
            mode: function() {
                if(this.execution && this.execution.mode)
                    return `${this.execution.mode.charAt(0)}${this.execution.mode.toLowerCase().substring(1)}`;
                return "-";
            },
            time_elapsed: function() {
                if(this.execution && !this.execution.time_completed) {
                    return this.calculateTime((Date.parse(`${this.execution.time_started}`)), this.current_time);
                } else if (this.execution) {
                    return this.calculateTime((Date.parse(`${this.execution.time_started}`)), (Date.parse(`${this.execution.time_completed}`)));   
                } else {
                    return '';
                }
            },
            current_step_id: function() {
                if(this.execution)
                    return this.execution.current_step_id;
                return "-";
            },
            ingenium_version: function() {
                // old execution may not have version info
                if (this.execution && this.execution.version) {
                    return this.execution.version;
                } else {
                    return '';
                }
            },
            current_step_number: function() {
                if(this.execution)
                    return this.execution.current_step_number;
                return "";
            },
            current_step_title: function() {
                if(this.execution)
                    if(this.execution.current_step_title != "")
                        return `${this.execution.current_step_title}`;
                    else
                        return "-";
                return "-";
            },
            current_procedure_id: function() {
                if(this.execution)
                    return this.execution.current_procedure_id;
                return "-";
            },
            current_procedure_title: function() {
                if(this.execution)
                    if(this.execution.current_procedure_title != "")
                        return `${this.execution.current_procedure_title}`;
                    else
                        return "-";
                return "-";
            },
            executed_steps: function() {
                if(this.execution)
                    return this.execution.num_steps_executed;
                return "-";
            },
            passed_steps: function() {
                if(this.execution)
                    return this.execution.num_steps_passed;
                return "-";
            },
            failed_steps: function() {
                if(this.execution)
                    return this.execution.num_steps_failed;
                return "-";
            },
            errored_steps: function() {
                if(this.execution)
                    return this.execution.num_steps_errored;
                return "-";
            },
            test_conductors: function() {
                if(this.execution && this.execution.test_conductors) {
                    return this.execution.test_conductors;
                }
                return ["-"];
            },
            approved_by: function() {
                if (this.execution) {
                    const trans = this.execution.transitions.filter(transition => transition.to_status == "IN_REVIEW");
                    if (trans.length > 0) {
                        return trans[trans.length-1].user_name;
                    } else {
                        return '-';
                    }
                } else {
                    return '-';
                }
            },
            approved_on: function() {
                if (this.execution) {
                    const trans = this.execution.transitions.filter(transition => transition.to_status == "IN_REVIEW");
                    if (trans.length > 0) {
                        return trans[trans.length-1].time_updated;
                    } else {
                        return '-';
                    }
                } else {
                    return '-';
                }
            },
            _reviewers: function() {
                if(this.reviewers && this.reviewers.length) {
                    return this.reviewers;
                }
                return ["-"];
            },
            review_closed_by: function() {
                if (this.execution) {
                    const trans = this.execution.transitions.filter(transition => transition.to_status == "FINALIZED");
                    if (trans.length > 0) {
                        return trans[trans.length-1].user_name;
                    } else {
                        return '-';
                    }
                } else {
                    return '-';
                }
            },
            review_closed_on: function() {
                if (this.execution) {
                    const trans = this.execution.transitions.filter(transition => transition.to_status == "FINALIZED");
                    if (trans.length > 0) {
                        return trans[trans.length-1].time_updated;
                    } else {
                        return '-';
                    }
                } else {
                    return '-';
                }
            },
            isAdmin() {
                return isAdmin();
            },
        },
        methods: {
            ...mapActions([
                "changeExecutionStatus",
                "setPending",
                "displayFeedback"
            ]),
            approveAsRunCallback: async function(status) {
                this.approveAsRunModal = false;

                await this.changeExecutionStatus({
                    executionId: this.execution.execution_id,
                    status: status,
                    comment: this.approveAsRunText
                });
            },
            unfinalizeAsRunCallback: async function(status) {
                this.unfinalizeAsRunModal = false;

                await this.changeExecutionStatus({
                    executionId: this.execution.execution_id,
                    status: status,
                    comment: this.unfinalizeAsRunText
                });
            },
            dataReviewCallback: async function() {
                this.dataReviewModal = false;

                await this.changeExecutionStatus({
                    executionId: this.execution.execution_id,
                    status: 'FINALIZED',
                    comment: this.dataReviewText
                });
            },
            handleSaveAsPdf: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                try {
                    const response = await reportApi.getExecutionInPdf(this.execution.execution_id);
                    forceFileDownload(response, `${this.execution.execution_id}.pdf`);
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            },
            calculateTime: function(startTime, endTime) {
                let difference = parseInt(endTime - startTime);
                
                let days = Math.floor(difference / (1000 * 60 * 60 * 24));
                let hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((difference % (1000 * 60)) / 1000);

                if(days > 0)
                    return days + "d " + hours + ":" + minutes + ":" + seconds;
                if(hours > 0)
                    return hours + " h " + minutes + " m " + seconds + " s";
                if(minutes > 0)
                    return minutes + " m " + seconds + " s";
                if(seconds > 0)
                    return seconds + " s";
                
                return "";
            },
            toggleDisplay: function() {
                this.display = !this.display;
            }
        }
    };
</script>

<style lang="scss" scoped>

    .execution_status {
        font-size: 12px;
    }

    .execution_status .row > div:first-child {
        text-align: right;
    }

    .execution_status .row > div:last-child {
        text-align: left;
    }

    .execution_status .row > div:first-child:after {
        content: ' ';
        height: 1px;
        width: 19px;
        border-bottom: 1px dotted;
        display: block;
        position: absolute;
        right: -10px;
        top: 8px;
    }

    .header {
        margin:0px;
        padding:0px;
        margin-bottom:8px;
        margin-top:10px;
    }

    .header .dotted-line {
        margin:0px;
        padding:0px;
        border-bottom:2px dotted #c8c8c8;
    }

    .overflow-link {
        overflow: hidden;
        white-space: nowrap;
        display:block;
        text-overflow: ellipsis;
    }

    button.btn-default {
        margin-top: 3px;
    }

    .statusExpand {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }
    
    .statusExpand h4 {
        display: inline-block;
    }

    .statusExpand .caret {
        display: inline-block;
    }


    @media print {
        .execution_status .row > div:first-child {
            text-align: left;
        }
        .execution_status .row > div:first-child:after {
            content: ' ';
            height: 1px;
            width: 19px;
            border-bottom: 0px dotted;
            display: block;
            position: absolute;
            right: -10px;
            top: 8px;
        }
        .header .dotted-line {
            margin:0px;
            padding:0px;
            border-bottom:0px dotted #c8c8c8;
        }
    }

</style>
