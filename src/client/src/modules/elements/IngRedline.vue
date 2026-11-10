<template>
    <form v-if="stepRedlineData.procedure_modification.justification !== undefined">
        <div class="row">
            <div class="col-md-8">
                <h5>{{ stepRedlineData.procedure_modification.justification.modification_type === "REDLINE" ? "Redline" : "Blueline" }}</h5>
                <div class="form-group">
                    <label class="justification-label" for="redline-justification">
                        Justification
                        <span style="float:right">
                            <span v-if="justificationTimestamp">
                                <i class="glyphicon glyphicon-time"></i> Requested at {{ justificationTimestamp }}
                            </span>
                            <span v-if="justificationUsername">
                                <i class="glyphicon glyphicon-user"></i> {{ justificationUsername }}
                            </span>
                        </span>
                    </label>
                    <div class="justification-input">
                        <textarea 
                            :disabled="!toEditRedline"
                            v-if="mode !== 'as-run'"
                            class="form-control"
                            id="redline-justification"
                            v-model="justificationText"
                            @change="saveJustificationComment"></textarea>
                        <p
                            v-if="mode === 'as-run'">{{ justificationText }}</p>
                    </div>

                    <label class="approval-label" for="redline-approval">
                        Approval Comments
                        <span style="float:right">
                            <span v-if="approvalTimestamp">
                                <i class="glyphicon glyphicon-time"></i> Approved at {{ approvalTimestamp }}
                            </span>
                            <span v-if="approvalUsername">
                                <i class="glyphicon glyphicon-user"></i> {{ approvalUsername }}
                            </span>
                        </span>
                    </label>
                    <div class="approval-input">
                        <textarea
                            :disabled="!toEditApprovalComment"
                            class="form-control"
                            id="redline-approval"
                            v-model="approvalText"
                            v-if="mode !== 'as-run'"
                            @change="saveApprovalComment"></textarea>
                        <p
                            v-if="mode === 'as-run'">{{ approvalText }}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div 
                    v-if="mode !== 'as-run'"
                    class="toggles">
                    <div class="redline-blueline-toggle">
                        <div class="btn-group btn-group-toggle">
                          <label 
                            class="label-btn-radius btn" 
                            :class="`${isRedline? 'redline-btn' : 'default-btn'}`"
                            :style="makeRedlineStyle"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="redlineTooltip">
                            <input 
                                class="hide-radio-circle"
                                type="radio" 
                                v-bind:value="true" 
                                id="redline" 
                                v-model="isRedline"
                                :disabled="makeRedlineDisabled"> Redline
                          </label>
                          <label 
                            class="label-btn-radius btn" 
                            :class="`${!isRedline? 'blueline-btn' : 'default-btn'}`"
                            :style="makeBluelineStyle"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="bluelineTooltip">
                            <input 
                                class="hide-radio-circle"
                                type="radio" 
                                v-bind:value="false" 
                                id="blueline" 
                                v-model="isRedline" 
                                :disabled="makeBluelineDisabled"> Blueline
                          </label>
                        </div>
                    </div>
                    <div class="redline-approval-toggle">
                        <div class="btn-group btn-group-toggle">
                          <label 
                            class="label-btn-radius btn" 
                            :class="`${!approved? 'pending-btn' : 'default-btn'}`"
                            :style="unapproveStyle"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            title="Unapprove changes">
                            <input 
                                class="hide-radio-circle"
                                type="radio" 
                                v-bind:value="false" 
                                id="pending" 
                                v-model="approved"
                                :disabled="unapproveRedlineDisabled"> Unapproved
                          </label>
                          <label 
                            class="label-btn-radius btn" 
                            :class="`${approved? 'approve-btn' : 'default-btn'}`" 
                            :style="approveStyle"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            title="Approve Changes">
                            <input 
                                class="hide-radio-circle"
                                type="radio" 
                                v-bind:value="true" 
                                id="approve" 
                                v-model="approved" 
                                :disabled="approveRedlineDisabled"> Approved
                          </label>
                        </div>
                    </div>
                    <div class="redline-discard">
                        <button 
                            type="button" 
                            class="btn btn-sm btn-danger"
                            :disabled="canDiscard || !modificationActive"
                            @click="discardRedline">
                            <span class="glyphicon glyphicon-remove"></span>&nbsp;Discard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>

    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "IngRedline",
        data() {
            return {   
                redlineTooltip: 'Redlines are modifications to the procedure that represent changes to be made to the released procedure.',
                bluelineTooltip: 'Bluelines are modifications to the procedure that are specific to this execution and do not need to be incorporated in the released procedure.'
            };
        },
        props: {
            stepRedlineData: {
                type: Object,
                required: true
            },
            elementMap: {
                type: Object,
                required: true
            },
            mode: {
                type: String,
                required: true
            }
        },
        computed: {
            ...mapGetters([
                "executionRedlineInputKey",
                "elementKey",
                "canApproveRedline"
            ]),
            toEditRedline: function() {
                if (!this.modificationActive || this.approved) {
                    return false;
                }
                if (this.stepRedlineData.executed && this.stepRedlineData.executable === 'EXECUTED') {
                    return false;
                }
                if (this.stepRedlineData.elem_type === 'PROCEDURE_SECTION' && this.stepRedlineData.imported) {
                    return false;
                }
                return true;
            },
            makeRedlineDisabled: function() {
                return this.isRedline || !this.toEditRedline;
            },
            makeBluelineDisabled: function() {
                return !this.isRedline || !this.toEditRedline;
            },
            makeRedlineStyle: function() {
                return this.makeRedlineDisabled ? 'cursor: default; pointer-events: none;' : '' ;
            },
            makeBluelineStyle: function() {
                return this.makeBluelineDisabled ? 'cursor: default; pointer-events: none;' : '' ;
            },
            toEditApprovalComment: function() {
                if (!this.modificationActive || !this.canApproveRedline || this.approved) {
                    return false;
                }
                if (this.stepRedlineData.executed && this.stepRedlineData.executable === 'EXECUTED') {
                    return false;
                }
                if (this.stepRedlineData.elem_type === 'PROCEDURE_SECTION' && this.stepRedlineData.imported) {
                    return false;
                }
                return true;
            },
            toApproveRedline: function() {
                if (!this.modificationActive || !this.canApproveRedline) {
                    return false;
                }
                if (this.stepRedlineData.executed && this.stepRedlineData.executable === 'EXECUTED') {
                    return false;
                }
                if (this.stepRedlineData.elem_type === 'PROCEDURE_SECTION' && this.stepRedlineData.imported) {
                    return false;
                }
                return true;
            },
            approveRedlineDisabled: function() {
                return this.approved || !this.toApproveRedline;
            },
            unapproveRedlineDisabled: function() {
                return !this.approved || !this.toApproveRedline;
            },
            approveStyle: function() {
                return this.approveRedlineDisabled ? 'cursor: default; pointer-events: none;' : '';
            },
            unapproveStyle: function() {
                return this.unapproveRedlineDisabled ? 'cursor: default; pointer-events: none;' : '';
            },
            justificationTimestamp: function() {
                return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "justification.time_updated");
            },
            approvalTimestamp: function() {
                if (this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.status") === "APPROVED") {
                    return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.time_updated");
                } else {
                    return "";
                }
            },
            justificationUsername: function() {
                return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "justification.user_name");
            },
            approvalUsername: function() {
                if (this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.status") === "APPROVED") {
                    return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.user_name");
                } else {
                    return "";
                }
            },
            isRedline: {
                get() { return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "justification.modification_type") === "REDLINE"; },
                set(value) {
                    this.saveJustificationElement({
                        elementId: this.stepRedlineData.elem_id,
                        justificationInput: {
                            modification_type: value ? "REDLINE" : "BLUELINE"
                        }
                    });
                }
            },
            approved: {
                get() { 
                    // return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.status") === "APPROVED" || 
                    // ["ORIGINAL","NONE","MODIFIED","MODIFYING_OLD","DELETED"].includes(this.elementKey(this.stepRedlineData.elem_id, "procedure_modification_status")); 
                    return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.status") === "APPROVED";
                },
                set(value) {
                    this.saveApprovalElement({
                        elementId: this.stepRedlineData.elem_id,
                        approvalInput: {
                            status: value ? "APPROVED" : "PENDING"
                        }
                    });
                }
            },
            justificationText: {
                get() { return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "justification.content"); },
                set(value) {
                    this.editRedlineInput({
                        elementId: this.stepRedlineData.elem_id,
                        keyString: "justification.content",
                        value: value
                    });
                }
            },
            approvalText: {
                get() { return this.executionRedlineInputKey(this.stepRedlineData.elem_id, "approval.content"); },
                set(value) {
                    this.editRedlineInput({
                        elementId: this.stepRedlineData.elem_id,
                        keyString: "approval.content",
                        value: value
                    });
                }
            },
            canDiscard: function() {
                return this.elementKey(this.stepRedlineData.elem_id, "executed");
            },
            modificationActive: function() {
                return ['MODIFYING', 'ADDED', 'DELETED'].includes(this.elementKey(this.stepRedlineData.elem_id, "procedure_modification_status"));
            }
        },
        methods: {
            ...mapActions([
                "editRedlineInput",
                "saveJustificationElement",
                "saveApprovalElement",
                "discardRedlineElement"
            ]),
            saveJustificationComment() {
                this.saveJustificationElement({
                    elementId: this.stepRedlineData.elem_id,
                    justificationInput: {
                        content: this.justificationText ? this.justificationText : ""
                    }
                });
            },
            saveApprovalComment() {
                this.saveApprovalElement({
                    elementId: this.stepRedlineData.elem_id,
                    approvalInput: {
                        content: this.approvalText ? this.approvalText : ""
                    }
                });
            },
            discardRedline: function() {
                this.discardRedlineElement({
                    elementId: this.stepRedlineData.elem_id
                });
            }
        }
    };
</script>

<style lang="scss" scoped>
    .approval-label{
        font-weight:400;
        font-size:12px;
    }
    
    .justification-label{
        font-weight:400;
        font-size:12px;
    }

    #redline-justification{
        margin-bottom:10px;
    }

    .redline-blueline-toggle{
        width:50%;
    }

    .redline-approval-toggle{
        padding-top: 15px;
        width:50%;
    }

    .redline-discard {
        margin-top: 20px;
        margin-left: 65px;
    }

    .label-btn-radius {
        border-radius: 0 4px 4px 0 !important;
    }

    label[data-toggle="tooltip"] {
        height: inherit;
    }

    .redline-btn {
        background-color:#ffe7e7;
        color:#ff4d4d;
        font-weight:bold !important;
        border-color:#ff4d4d;
    }

    .blueline-btn {
        background-color: #e7f3ff;
        color: #4da6ff;
        font-weight:bold !important;
        border-color:#4da6ff;
    }

    .pending-btn {
        background-color: #b1b1b17a;
        color: rgb(117, 117, 117);
        font-weight:bold !important;
        border-color:rgb(121, 121, 121);
    }

    .approve-btn {
        background-color: #a3de5f46;
        color: #5d9613;
        font-weight: bold !important;
        border-color: #58980f;
    }

    .default-btn {
        background-color: #ffffff;
        color: #999;
        font-weight:bold !important;
        border-color:#999;
    }

    .toggles {
        margin-top:63px;
    }

    .hide-radio-circle {
        display:none;
    }

    .justification-input {
        position:relative;
    }

    .justification-saved {
        position:absolute;
        bottom:0;
        right:5px;
        color:lightgray;
    }

    .approval-input {
        position:relative;
    }

    .approval-saved {
        position:absolute;
        bottom:0;
        right:5px;
        color:lightgray;
    }
</style>

