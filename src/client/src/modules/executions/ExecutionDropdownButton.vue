<template>
    <div>
        <div class="dropdown">
            <button @click="showDropdown = !showDropdown"
                    class="btn btn-secondary dropdown-toggle"
                    type="button" id="dropdownMenuButton"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="glyphicon glyphicon-option-vertical"></i>
            </button>
            <div v-if="showDropdown" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
                <ul>
                    <li class="actionable" data-toggle="dropdown" 
                        @click="viewExecution">
                        <i class="glyphicon glyphicon-eye-open">
                            &nbsp;View
                        </i>
                    </li>
                </ul>
                <ul>
                    <li class="actionable" data-toggle="dropdown" 
                        @click="getExecutionPdf">
                        <i class="glyphicon glyphicon-save-file">
                            &nbsp;PDF
                        </i>
                    </li>
                </ul>
                <ul>
                    <li class="actionable" data-toggle="dropdown" 
                        @click="getExecutionExport">
                        <i class="glyphicon glyphicon-export">
                            &nbsp;Export
                        </i>
                    </li>
                </ul>
                <ul v-if="data.status === 'SUSPENDED'">
                    <li class="actionable" data-toggle="dropdown" 
                        @click="showResumeModal">
                        <i class="glyphicon glyphicon-save-file">
                            &nbsp;Resume
                        </i>
                    </li>
                </ul>
                <ul v-if="canSuspendThisExecution">
                    <li class="actionable" data-toggle="dropdown" 
                        @click="showSuspendModal">
                        <i class="glyphicon glyphicon-eject">
                            &nbsp;Suspend
                        </i>
                    </li>
                </ul>
                <ul v-if="canCloseThisExecution">
                    <li class="actionable" data-toggle="dropdown" 
                        @click="showCloseModal">
                        <i class="glyphicon glyphicon-log-out">
                            &nbsp;Close
                        </i>
                    </li>
                </ul>
            </div>
        </div>
        
        <div>
            <ing-modal
                v-show="showResumeExecutionModal"
                @close="showResumeExecutionModal = false"
                size="medium-large">
                <template slot="title">
                    <h4>Resume Execution</h4>
                </template>
    
                <template slot="body">
                    Choose which venue you would like to resume <strong>{{this.data.execution_id}}</strong> on. <br>
                    (<strong>{{this.data.execution_id}}</strong> was last executed on <strong>{{this.data.venue_name}}</strong> which is currently <strong>{{this.defaultVenueStatus}}</strong>)<br>
                    <br>
                    
                    <div class="selectionBox">
                        <select class="form-control" v-model="venueToResumeOn" style="width: 500px">
                            <option v-for="choice in filteredAvailableVenues"
                                    :disabled="!choice.venue_id"
                                    :value="choice.venue_id" 
                                    :key="choice.venue_id">
                                {{choice.name}}
                            </option>
                        </select>
                        <button
                            type="button"
                            class="btn btn-primary"
                            :disabled="!venueToResumeOn"
                            @click="onResumeExecution"
                        >
                            Resume Execution
                        </button>
                    </div>
                </template>
    
                <template slot="footer">
                    <button type="button" class="btn pull-right" @click="showResumeExecutionModal = false">Cancel</button>
                </template>
            </ing-modal>
            <ing-modal
                v-show="showSuspendExecutionModal"
                @close="showSuspendExecutionModal = false"
                size="medium-large">
                <template slot="title">
                    <h4>Suspend Execution</h4>
                </template>
    
                <template slot="body">
                    <div>Do you want to suspend <strong>{{data.execution_id}}</strong></div>
                    <ul style="list-style-type:disc; margin-left: 20px;">
                        <li>Description: {{data.description}}</li>
                        <li>Test conductor: {{data.conductors.join(', ')}}</li>
                        <li>Venue: {{this.data.venue_name}}</li>
                    </ul>
                </template>
    
                <template slot="footer">
                    <button type="button" class="btn btn-primary" @click="onSuspendExecution()">Confirm</button>
                    <button type="button" class="btn pull-right" style="margin-left: 15px;" @click="showSuspendExecutionModal = false">Cancel</button>
                </template>
            </ing-modal>
            <ing-modal
                v-show="showCloseExecutionModal"
                @close="showCloseExecutionModal = false"
                size="medium-large">
                <template slot="title">
                    <h4>Close Execution</h4>
                </template>
    
                <template slot="body">
                    <div>Do you want to close <strong>{{data.execution_id}}</strong> that has been suspended.</div>
                    <ul style="list-style-type:disc; margin-left: 20px;">
                        <li>Description: {{data.description}}</li>
                        <li>Test conductor: {{data.conductors.join(', ')}}</li>
                        <li>Venue: {{this.data.venue_name}}</li>
                    </ul>
                    <div>Once the execution is closed, you won't be able to resume it any more.</div>
                </template>
    
                <template slot="footer">
                    <button type="button" class="btn btn-primary" @click="onCloseExecution()">Confirm</button>
                    <button type="button" class="btn pull-right" style="margin-left: 15px;" @click="showCloseExecutionModal = false">Cancel</button>
                </template>
            </ing-modal>
        </div>
    </div>
</template>

<script>
    import { getUsername, isAdmin } from '../common/utils';
    import reportApi from "../../api/report";
    import {mapActions, mapGetters} from "vuex";
    import IngModal from "../common/IngModal.vue";
    import {exportExecutionInGzip} from "../../api/execution";
    import {forceFileDownload} from "../common/utils";

    export default {
        name: 'ExecutionActions',
        props: {
            data: {
                execution_id: String,
                status: String,
                venue_id: String
            },
        },
        
        data() {
            return {
                showDropdown: false,
                showResumeExecutionModal: false,
                showSuspendExecutionModal: false,
                showCloseExecutionModal: false,
                defaultVenueStatus: 'UNAVAILABLE',
                venueToResumeOn: '',
                filteredAvailableVenues: [],
                canCloseThisExecution: false,
                canSuspendThisExecution: false,
            };
        },
        components: {
            'ing-modal': IngModal
        },
        computed: {
            ...mapGetters([
                "availableVenues",
                "isPending"
            ]),
        },
        watch: {
            data : {
                async handler(newVal, oldVal) {
                    const adminFlag = isAdmin();
                    const username = getUsername();
                    const tcFlag = this.data.conductors.includes(username);

                    // update canCloseThisExecution
                    let canClose = false;
                    if (this.data.status === 'SUSPENDED' && (adminFlag || tcFlag)) {
                        canClose = true;
                    }
                    this.canCloseThisExecution = canClose;

                    // update canSuspendThisExecution
                    let canSuspend = false;
                    if (['IDLE', 'RUNNING', 'PAUSED', 'HALTED'].includes(this.data.status)) {
                        if (adminFlag || tcFlag) {
                            const currentVenue = await this.getVenueInfo(this.data.venue_id);
                            if (currentVenue && currentVenue.venue_status) {
                                if (currentVenue.venue_status.execution_id !== this.data.execution_id) {
                                    // The execution is active but it is not on the venue, which is not consistent.
                                    // Allow to suspend the execution to get out of the inconsistent status.
                                    canSuspend = true;
                                }
                            }
                        }
                    }
                    this.canSuspendThisExecution = canSuspend;
                },
                immediate: true,
                deep: true, // watch deep to detect changes of execution id via pagination or change of status of execution.
            }
        },
        methods: {
            ...mapActions([
                "fetchAvailableVenues",
                "getVenueInfo",
                "setPending",
                "suspendExecution",
                "closeExecution",
                "resumeExecution",
                "fetchExecutionInfo",
                "displayFeedback",
            ]),
            async getExecutionExport() {
                this.showDropdown = false;
                this.setPending(true);
                const response = await exportExecutionInGzip(this.data.execution_id);
                if (response) {
                    const timestamp = (new Date()).toISOString();
                    forceFileDownload(response, `execution-export-${this.data.execution_id}_${timestamp}.tar.gz`);
                }
                this.setPending(false);
            },
            async getExecutionPdf() {
                if (this.isPending) {
                    return;
                }
                this.showDropdown = false;
                this.setPending(true);
                try {
                    const response = await reportApi.getExecutionInPdf(this.data.execution_id);
                    const timestamp = (new Date()).toISOString();
                    forceFileDownload(response, `${this.data.execution_id}_${timestamp}.pdf`);
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            },
            async onResumeExecution() {
                // prevent double click
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                if (this.venueToResumeOn) {  // make sure not trying to run on -- select --
                    const response = await this.resumeExecution({executionId: this.data.execution_id, venueId: this.venueToResumeOn});
                    if (response && response.status === 200) {
                        location.href = `/execute_spa/${response.data.venue_id}/${response.data.execution_id}`;
                    }
                }
                this.setPending(false);
            },
            showResumeModal() {
                this.showDropdown = false;
                this.updateDefaultVenueStatus();
                this.updateFilteredAvailableVenues();
                this.showResumeExecutionModal = true;
            },
            showSuspendModal() {
                this.showDropdown = false;
                this.showSuspendExecutionModal = true;
            },
            showCloseModal() {
                this.showDropdown = false;
                this.showCloseExecutionModal = true;
            },
            async onSuspendExecution() {
                // prevent double click
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                this.showSuspendExecutionModal = false;
                await this.suspendExecution({executionId: this.data.execution_id});
                await this.fetchExecutionInfo({executionId: this.data.execution_id});
                this.setPending(false);
            },
            async onCloseExecution() {
                // prevent double click
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                this.showCloseExecutionModal = false;
                await this.closeExecution({executionId: this.data.execution_id});
                await this.fetchExecutionInfo({executionId: this.data.execution_id});
                this.setPending(false);
            },
            async updateDefaultVenueStatus() {
                const venue = await this.getVenueInfo(this.data.venue_id);
                if (venue) {
                    if (venue.venue_status.status === 'AVAILABLE') {
                        this.defaultVenueStatus = this.$can(['create'], `Execution:${venue.type}#${venue.venue_group_id}`) ? venue.venue_status.status : 'Not Allowed';
                    } else {
                        this.defaultVenueStatus = venue.venue_status.status;
                    } 
                } else {
                    this.defaultVenueStatus = 'Not Found';
                }
            },
            async updateFilteredAvailableVenues() {
                await this.fetchAvailableVenues();
                const allowedVenues = [];
                for (const venue of this.availableVenues) {
                    const allowed = this.$can(['create'], `Execution:${venue.type}#${venue.venue_group_id}`);
                    if (allowed) {
                        allowedVenues.push(venue);
                    }
                }

                if (this.defaultVenueStatus === "AVAILABLE") {
                    this.venueToResumeOn = this.data.venue_id;
                    this.filteredAvailableVenues = allowedVenues;
                } else {
                    this.venueToResumeOn = '';
                    this.filteredAvailableVenues = [
                        {
                            venue_name: '-- select --',
                            venue_id: ''
                        },
                        ...allowedVenues
                    ];
                }
            },
            viewExecution() {
                this.showDropdown = false;
                location.href = `/execute/as_run/${this.data.execution_id}`;
            },
            handleClickOutside(event) {
                if (!this.$el.contains(event.target)) {
                    this.showDropdown = false;
                }
            },
        },
        mounted() {
            document.addEventListener('click', this.handleClickOutside);
        },
        destroyed() {
            document.removeEventListener('click', this.handleClickOutside);
        },
    };
</script>

<style lang="scss" scoped>
    .selectionBox {
        display: flex;
    }
    ul {
        margin-bottom: 0px;
        right: 0;
        list-style-type: none;
        padding: 12px;
    }
    .actionable {
        cursor: pointer;
    }
    .actionable:hover {
        background-color: yellow;
    }
</style>
