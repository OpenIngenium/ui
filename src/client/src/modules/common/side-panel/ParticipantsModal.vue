<template>
     <ing-modal v-if="showModal" @close="close()" size="medium">
        <template slot="title">
            <span id="modal-title">
                <i class="glyphicon glyphicon-user"></i>
                &nbsp;Manage Redline Approvers and Participants
            </span>
        </template>
        <template slot="body">
            <div style="margin-top: 0px;">
                <label>Redline Approvers:</label>
                <div class="new-participant">
                    <div class="row" style="padding-top: 0px;">
                        <div class="form-group col-md-6">
                            <vue-typeahead-bootstrap
                                class="mb-4"
                                v-model="redlineApproverQuery"
                                :data="redlineApproverUsers"
                                :serializer="item => item.username"
                                :screen-reader-text-serializer="item => `Ingenium user ${item.username}`"
                                highlightClass="special-highlight-class"
                                @hit="newRedlineApprover = $event"
                                :minMatchingChars="2"
                                placeholder="Search Ingenium Users"
                                inputClass="special-input-class"
                                :disabledValues="(newRedlineApprover ? [newRedlineApprover.username] : [])"
                                @input="lookupRedlineApprover"
                            >
                                <template slot="suggestion" slot-scope="{ data }">
                                    <div class="d-flex align-items-center">
                                        <div>{{data.username}}</div>
                                    </div>
                                </template>
                            </vue-typeahead-bootstrap>
                        </div>
                        <div class="form-group col-md-3">
                            <div class="btn-group" role="group" style="float:right;">
                                <button 
                                    @click="addRedlineApprover"
                                    :disabled="disableAddRedlineApproverButton"
                                    type="button"
                                    class="btn btn-primary">
                                    <i class="glyphicon glyphicon-plus"></i>
                                    &nbsp;Add
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-if="duplicateRedlineApproverError" class="row">
                        <div class="col-md-6" style="padding-top: 2px;">
                        </div>
                        <div class="form-group col-md-12">
                        <label class="error-message">Error: {{ this.newRedlineApprover.username }} is already a redline approver.</label>
                        </div>
                    </div>
                </div>
                <div v-for="redlineApprover in redlineApprovers" class="participant" :key="redlineApprover">
                    {{ redlineApprover }}
                    <span v-on:click="removeRedlineApprover(redlineApprover)" class="close">x</span>
                </div>
            </div>

            <div style="margin-top: 40px;">
                <label>Participants:</label>
                <div class="new-participant">
                    <div class="row" style="padding-top: 0px;">
                        <div class="form-group col-md-6">
                            <vue-typeahead-bootstrap
                                class="mb-4"
                                v-model="participantQuery"
                                :data="participantUsers"
                                :serializer="item => item.username"
                                :screen-reader-text-serializer="item => `Ingenium user ${item.username}`"
                                highlightClass="special-highlight-class"
                                @hit="newParticipant = $event"
                                :minMatchingChars="2"
                                placeholder="Search Ingenium Users"
                                inputClass="special-input-class"
                                :disabledValues="(newParticipant ? [newParticipant.username] : [])"
                                @input="lookupParticipant"
                            >
                                <template slot="suggestion" slot-scope="{ data }">
                                    <div class="d-flex align-items-center">
                                        <div>{{data.username}}</div>
                                    </div>
                                </template>
                            </vue-typeahead-bootstrap>
                        </div>
                        <div class="form-group col-md-3">
                            <div class="btn-group" role="group" style="float:right;">
                                <button 
                                    @click="addParticipant"
                                    :disabled="disableAddParticipantButton"
                                    type="button"
                                    class="btn btn-primary">
                                    <i class="glyphicon glyphicon-plus"></i>
                                    &nbsp;Add
                                </button>
                            </div> 
                        </div>
                    </div>
                    <div v-if="duplicateParticipantError" class="row">
                        <div class="col-md-6" style="padding-top: 2px;">
                        </div>
                        <div class="form-group col-md-12">
                        <label class="error-message">Error: {{ this.newParticipant.username }} is already a participant.</label>
                        </div>
                    </div>
                </div>
                <div v-for="participant in participants" class="participant" :key="participant">
                    {{participant}}
                    <span v-on:click="removeParticipant(participant)" class="close">x</span>
                </div>
            </div>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Close
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex';
    import IngModal from '../../common/IngModal.vue';
    import IngTable from '../../common/IngTable.vue';
    import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';
    import authApi from "../../../api/auth";
    import {debounce} from 'lodash';

    export default {
        name: "ParticipantsModal",
        components: {
            'ing-modal': IngModal,
            'ing-table': IngTable,
            'vue-typeahead-bootstrap': VueTypeaheadBootstrap,
        },
        data() {
            return {
                redlineApproverQuery: '',
                participantQuery: '',
                redlineApproverUsers: [],
                participantUsers: [],
                newRedlineApprover: {
                    username: ''
                },
                newParticipant: {
                    username: ''
                },
                duplicateParticipantError: false,
                duplicateRedlineApproverError: false,
            };
        },
        watch: {
            newRedlineApprover: {
                deep: true,
                handler() {
                    this.duplicateRedlineApproverError = false;
                }
            },
            newParticipant: {
                deep: true,
                handler() {
                    this.duplicateParticipantError = false;
                }
            },
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            }
        },
        computed: {
            ...mapGetters([
                "redlineApprovers",
                "participants",
            ]),
            disableAddRedlineApproverButton: function() {
                return this.newRedlineApprover.username === '' ? true : false;
            },
            disableAddParticipantButton: function() {
                return this.newParticipant.username === '' ? true : false;
            },
        },
        methods: {
            ...mapActions([
                "saveExecution",
            ]),
            close: function() {
                this.$emit('close');
            },
            addRedlineApprover: async function() {
                if(!this.checkIfDuplicateRedlineApproverExists(this.newRedlineApprover.username)){
                    if (this.newRedlineApprover.username) {
                        const redline_approvers = [...this.redlineApprovers, this.newRedlineApprover.username];
                        await this.saveExecution({redline_approvers: redline_approvers});
                    }
                    this.newRedlineApprover = {username: ''};
                    this.duplicateRedlineApproverError = false;
                } else {
                    this.duplicateRedlineApproverError = true;
                }
            },
            removeRedlineApprover: async function(userId) {
                const redline_approvers = [];
                for (const redlineApprover of this.redlineApprovers) {
                    if (redlineApprover !== userId) {
                        redline_approvers.push(redlineApprover);
                    }
                }
                await this.saveExecution({redline_approvers: redline_approvers});
            },
            checkIfDuplicateRedlineApproverExists: function(userId) {
                return this.redlineApprovers.some(redlineApprover => redlineApprover === userId);
            },
            addParticipant: async function() {
                if(!this.checkIfDuplicateParticipantExists(this.newParticipant.username)){
                    if (this.newParticipant.username) {
                        const participants = [...this.participants, this.newParticipant.username];
                        await this.saveExecution({participants: participants});
                    }
                    this.newParticipant = {username: ''};
                    this.duplicateParticipantError = false;
                } else {
                    this.duplicateParticipantError = true;
                }
            },
            removeParticipant: async function(userId) {
                const participants = [];
                for (const participant of this.participants) {
                    if (participant !== userId) {
                        participants.push(participant);
                    }
                }
                await this.saveExecution({participants: participants});
            },
            checkIfDuplicateParticipantExists: function(userId) {
                return this.participants.some(participant => participant === userId);
            },
            lookupRedlineApprover: debounce(function() {
                authApi.getLdapUsers(this.redlineApproverQuery)
                    .then(data => {
                        this.redlineApproverUsers = data;
                    }
                );
            }, 500),
            lookupParticipant: debounce(function() {
                authApi.getLdapUsers(this.participantQuery)
                    .then(data => {
                        this.participantUsers = data;
                    }
                );
            }, 500)

        }
    };
</script>

<style lang="scss" scoped>
    .new-participant {
        margin: 15px;
    }
    .new-participant label {
        color: #545454;
    }
    .new-participant input {
        font-weight: normal;
    }
    .new-participant button {
        float: right;
    }
    .button-spacing {
        margin-right: 5px;
    }
    .error-message {
        color:red !important;
    }
    .participant {
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 10px;
        color: #333;
        display: inline-block;
        margin: 0 2px;
        padding: 5px 8px 5px 10px;
        white-space: nowrap;
    }
    .close {
        float: right;
        font-size: 21px;
        font-weight: 700;
        padding-left: 3px;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        filter: alpha(opacity=20);
        opacity: .2;
    }
    .special-input-class {
        background-color: black !important;
        color: white !important;
    }
    .special-highlight-class {
        font-weight: 900;
        color: #585656;
    }
</style>
