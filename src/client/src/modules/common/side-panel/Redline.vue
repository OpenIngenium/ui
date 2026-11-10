<template>
    <div class="row header">
        <div class="col-sm-12 dotted-line">
            <h5 style="margin: 1px;">Redline Changes To Apply</h5>
        </div>
        <!--Radio Button Block for Redline/Blueline-->
        <div class="col-sm-12 no-margin" style="padding-top:5px">
            <p class="no-margin">Select Redline/Blueline</p>
        </div>
        <div class="col-sm-12 radio-box">
            <template v-for="(option,index) in REDLINE_RADIO_OPTIONS">
                <div :key="index" style="display: flex; align-items: center;">
                    <input 
                        class="radio-button" 
                        :disabled="!redlineTypeChangeEnabled" 
                        type="radio" 
                        :value=option.value 
                        v-model="redlineOption" >
                    <label class="radio-label">{{option.label}}</label>
                </div>
            </template>
        </div>
        <div v-if="showJustificationMessage">
            <div class="col-sm-12 no-margin">
                <p class="no-margin">Justification for Redline/Blueline</p>
            </div>
            <div class="col-sm-12">
                <textarea class="form-control" v-model="redlineJustification" placeholder="Add justification here or leave blank for no change"></textarea>
            </div>
        </div>
        <!---->
        <!--Radio Button Block for Approval-->
        <div class="col-sm-12 no-margin">
            <p class="no-margin">Select Approval Status</p>
        </div>
        <div class="col-sm-12 radio-box">
            <template v-for="(option,index) in APPROVAL_STATUS_RADIO_OPTIONS">
                <div :key="index" style="display: flex; align-items: center;">
                    <input 
                        class="radio-button" 
                        :disabled="!redlineApprovalEnabled" 
                        type="radio" 
                        :value=option.value 
                        v-model="approvalOption" >
                    <label class="radio-label">{{option.label}}</label>
                </div>
            </template>
        </div>
        <div v-if="showApprovalMessage">
            <div class="col-sm-12 no-margin">
                <p class="no-margin">Approval Description</p>
            </div>
            <div class="col-sm-12">
                <textarea class="form-control" v-model="approvalDescription" placeholder="Add approval description here or leave blank for no change"></textarea>
            </div>
        </div>
        <!---->
        <div class="col-sm-12 no-margin">
            <p class="no-margin">Discard Redline/Blueline</p>
        </div>
        <div class="col-sm-12 radio-box no-margin">
            <input class="radio-button" type="checkbox" id="discard" value="false" v-model="discardOption">
            <label class="radio-label" for="Discard">Discard</label>
        </div>
        <div class="col-sm-12 dotted-line no-margin" style="padding-bottom: 5px;">
            <div class="btn-group" role="group" style="float:right;">
                <button 
                    @click="handleApplyChanges"
                    type="button"
                    :disabled="!enableApplyButton"
                    class="btn btn-primary">
                    <i class="glyphicon glyphicon-ok"></i>
                    &nbsp;Apply
                </button>
            </div>
        </div> 
        <div class="col-sm-12" style="margin-top:10px">
            <button
                v-if="bulkRedlineElementIds.length"   
                @click="removeRedlineElementSelections"
                type="button"
                style="margin-bottom:10px"
                class="btn btn-default btn-sm">Remove All Selection
            </button>
            <template v-for="(elementId,index) in bulkRedlineElementIds">
                <div :key="index" class="alert alert-dismissible" :class="getRedlineStyle(elementId)">
                    <button type="button" class="close" @click="removeRedlineElementSelection(elementId)"><span aria-hidden="true">&times;</span></button>
                    <a href="#" style="color:inherit" @click.prevent="editScrollToElementId({id: elementId})">
                        <i v-if="showApprovalCheckmark(elementId)"
                        class="glyphicon glyphicon-ok approve-checkmark">
                        </i><strong>{{getElementNumber(elementId)}}</strong> {{getElementTitle(elementId)}}
                    </a>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from "vuex";

    const REDLINE_RADIO_OPTIONS = [ 
        {label: 'No Change', value: 'No Change'},
        {label: 'Redline', value: 'REDLINE'}, 
        {label: 'Blueline', value: 'BLUELINE'} 
    ];
    const APPROVAL_STATUS_RADIO_OPTIONS = [ 
        {label: 'No Change', value: 'No Change'}, 
        {label: 'Approved', value: 'APPROVED'}, 
        {label: 'Unapproved', value: 'PENDING'} 
    ];
    export default {
        name: "Redline",
        data() {
            return {
                REDLINE_RADIO_OPTIONS: REDLINE_RADIO_OPTIONS,
                APPROVAL_STATUS_RADIO_OPTIONS: APPROVAL_STATUS_RADIO_OPTIONS,
                redlineSelection: 'No Change',
                redlineJustification: '',
                approvalSelection: 'No Change',
                approvalDescription: '',
                discardSelection: false,
                showJustificationMessage: false,
                showApprovalMessage:false
            };
        },
        computed: {
            ...mapGetters([
                "bulkRedlineElementIds",
                "elementKey",
                "canApproveRedline",
                "isTestConductor",
                "executionRedlineInputKey"
            ]),
            discardOption: {
                get() {
                    return this.discardSelection;
                },
                set(val) {
                    this.discardSelection = val;
                    if(val) {
                        this.redlineOption = 'No Change';
                        this.redlineJustification = '';
                        this.approvalOption = 'No Change';
                        this.approvalDescription = '';
                        this.showJustificationMessage = false;
                        this.showApprovalMessage = false;
                    }
                }
            },
            redlineOption: {
                get() {
                    return this.redlineSelection;
                },
                set(val) {
                    this.redlineSelection = val;
                    if(val == 'No Change'){
                        this.redlineJustification = '';
                        this.showJustificationMessage = false;
                    } else {
                        this.showJustificationMessage = true;
                    }
                }
            },
            approvalOption: {
                get() {
                    return this.approvalSelection;
                },
                set(val) {
                    this.approvalSelection = val;
                    if(val == 'No Change'){
                        this.approvalDescription = '';
                        this.showApprovalMessage = false;
                    } else {
                        this.showApprovalMessage = true;
                    }
                }
            },
            redlineTypeChangeEnabled: function() {
                return !this.discardOption;
            },
            redlineApprovalEnabled: function() {
                if (this.discardOption) {
                    return false;
                }
                return this.canApproveRedline;
            },
            enableApplyButton: function() {
                if(this.bulkRedlineElementIds.length > 0 && (this.discardOption || this.redlineOption != 'No Change' || this.approvalOption != 'No Change')) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        methods: {
            ...mapActions([
                "saveBulkRedlineElementIds",
                "saveBulkRedlineJustificationChanges",
                "saveBulkRedlineApprovalChanges",
                "saveBulkRedlineDiscardChanges",
                "editScrollToElementId",
            ]),
            getElementNumber: function(elementId) {
                return this.elementKey(elementId, 'number');
            },
            getElementTitle: function(elementId) {
                return this.elementKey(elementId, 'title');
            },
            showApprovalCheckmark: function(elementId) {
                return this.executionRedlineInputKey(elementId, "approval.status") === "APPROVED";
            },
            removeRedlineElementSelection: function(elementId) { 
                let filteredElements = this.bulkRedlineElementIds.filter(item => item !== elementId); 
                this.saveBulkRedlineElementIds(filteredElements); 
            },
            removeRedlineElementSelections: function() { 
                this.saveBulkRedlineElementIds([]); 
            },
            getRedlineStyle: function(elementId) {
                let modificationType = this.elementKey(elementId, 'procedure_modification').justification.modification_type;
                return modificationType == 'REDLINE' ? 'redline' : 'blueline';
            },
            handleApplyChanges: function() {
                let payload = {elem_ids: this.bulkRedlineElementIds};
                if(this.redlineOption !== 'No Change') {
                    payload.justification_input = {modification_type: this.redlineOption};
                    if(this.redlineJustification.trim() !== '') {
                        payload.justification_input = {
                            modification_type: this.redlineOption ,
                            content: this.redlineJustification
                        };
                    } 
                    this.saveBulkRedlineJustificationChanges({ payload });
                }
                if(this.approvalOption !== 'No Change') {
                    payload.approval_input = {status: this.approvalOption};
                    if(this.approvalDescription.trim() !== '') {
                        payload.approval_input = {
                            status: this.approvalOption, 
                            content: this.approvalDescription
                        };
                    } 
                    this.saveBulkRedlineApprovalChanges({ payload });
                }
                if(this.discardOption) {
                    this.saveBulkRedlineDiscardChanges({ payload });
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .dotted-line {
        margin:0px;
        padding:0px;
        border-bottom:2px solid #c8c8c8;
    }

    .radio-box {
        display: flex;
    }

    .radio-button {
        margin: 4px
    }

    .radio-label {
        margin-top: 4px;
    }

    .approve-checkmark {
        color:#92a57c;
        padding-right:5px;
    }
    
</style>