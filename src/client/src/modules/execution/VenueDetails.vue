<template>
    <div>
        <ing-modal v-if="isExecutionDescriptionEmpty && this.showExecutionDescriptionModal && !disableDescription" @close="closeExecutionDescriptionModal()">
            <template slot="body">
                <div class="form-group">
                    <label for="version-description">
                        Provide a short description of this execution
                    </label>
                    <textarea id="version-description" class="form-control" style="width: 100%" v-model="modalDescriptionValue" placeholder="Click to add description"></textarea>
                </div>
            </template>
            <template slot="footer">
                <button type="button"
                        class="btn btn-primary pull-right"
                        :disabled="disableSubmit"
                        @click.prevent.stop="updateDescription(modalDescriptionValue)">
                    Submit
                </button>
            </template>
        </ing-modal>

        <!-- Resume Confirmation Modal -->
        <ing-modal v-if="showSuspendResumeConfirmation" @close="showSuspendResumeConfirmation = false" size="small">
            <template slot="title">
                <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                        <span class="glyphicon glyphicon-cog"></span>
                        Confirm Resume?
                    </h4>
            </template>
            <template slot="body">
                <p>Are you sure you want to resume?</p>
                <p>This will suspend the current execution and resume the parent execution <b>{{parentExecutionId ? parentExecutionId : ''}}</b>
                    in the <b>{{venueName}}</b>
                </p>
            </template>
            <template slot="footer">
                <div>
                    <button type="button" class="btn btn-default pull-left" @click="showSuspendResumeConfirmation = false">Cancel</button>
                    <button class="btn btn-primary" @click="onResumeParentExecution">Confirm</button>
                </div>
            </template>
        </ing-modal>

        <div :id="followExecToolbar" style="width:78%;">
            <div class="col-xs-6">
                <div class="row">
                    <h5><a href="#">{{ venueName }}</a> | {{ executionInfoStr }}</h5>
                    <ing-editable-froala
                       v-if="executionItem"
                       v-model="executionItem.description"
                       v-on:save="updateDescription"
                       :value="executionItem.description"
                       :disabled="disableDescription"
                       :execution="true"
                       :use-froala="false"
                       input-classes="full-width-2-line-description">
                    </ing-editable-froala>
                </div>
            </div>
            <div class="col-xs-6">
                <div class="row">
                    <div class="col-xs-5" style="padding-left: 0px;">
                        <span 
                            :class="audioMuted ? 'glyphicon glyphicon glyphicon-volume-off' : 'glyphicon glyphicon glyphicon-volume-up'"
                            style="cursor:pointer; display: table-cell; vertical-align: top; padding-top: 10px; padding-right: 5px;"
                            @click="toggleMute">
                        </span>
                        <multiselect
                            v-model="audioTriggerSelected"
                            :options="audioTriggerOptions"
                            placeholder="Play audio on"
                            style="cursor:pointer; font-size:10px; display: table-cell;"
                            :multiple="true"
                            :taggable="false"
                            :searchable="false"
                            :showPointer="false"
                            v-on:select="addAudioTrigger"
                            v-on:remove="removeAudioTrigger">
                            <template slot="selection" slot-scope="{ values, search, isOpen }"></template>
                        </multiselect>
                    </div>
                    <div class="col-xs-5">
                        <span 
                            :class="'glyphicon glyphicon-filter'"
                            style="font-size:15px; display: table-cell; vertical-align: top; padding-top: 10px; padding-right: 5px;">
                        </span>
                        <multiselect
                            :value="filterNames"
                            :options="filterTriggerOptions"
                            placeholder="Filter on"
                            style="font-size:10px; display: table-cell;"
                            :multiple="true"
                            :taggable="false"
                            :searchable="false"
                            :showPointer="false"
                            v-on:select="filterTrigger"
                            v-on:remove="filterTrigger"
                            >
                            <template slot="selection" slot-scope="{ values, search, isOpen }"></template>
                        </multiselect>
                    </div>
                    <div class="col-xs-2">
                        <div class="follow-toggle">
                            <div style="margin-top: 10px;">
                                <span>Follow</span>
                                <ing-toggle
                                    :value="followExecution"
                                    onName="On"
                                    offName="Off"
                                    sizeClass="btn-xs"
                                    :clickHandler="toggleFollowExecution"
                                    :disabled="false">
                                </ing-toggle>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div v-if="parentExecutionId" style="display: inline-block;font-weight: bold; margin-top: 10px;">
                        Parent Execution:
                        <a :href="callProcedureParentExecutionUrl">
                            {{parentExecutionId ? parentExecutionId : ''}}
                        </a>
                        <button 
                            v-if="showSuspendResume" 
                            type="button" 
                            :disabled="disableSuspendResume"  
                            class="btn btn-default" 
                            style="font-weight:bold; width:100px; margin-left: 5px; padding: 0px;" 
                            @click="showSuspendResumeConfirmation = true">
                            Resume
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { commonDateTime, commonTimestamp, doyTimestamp, timesince } from "../common/filters";
    import IngEditableWithFroala from "../common/IngEditableWithFroala.vue";
    import { mapActions, mapGetters } from "vuex";
    import Multiselect from 'vue-multiselect';
    import IngToggle from '../common/IngToggle.vue';

    // Scrolls the outline side panel so that the given outline entry is visible.
    // Only #outline-container is scrolled on purpose: el.scrollIntoView() scrolls every
    // scrollable ancestor including the document, which would drag the main canvas away
    // from the step that is currently being executed.
    function scrollOutlineView(el) {
        return new Promise((resolve, reject) => {
            if (el == null) {
                reject();
                return;
            }

            const container = document.getElementById('outline-container');
            if (!container) {
                resolve();
                return;
            }

            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();

            if (elRect.top < containerRect.top || elRect.top > containerRect.bottom) {
                // offset of the entry from the top of the scrollable content
                const offsetTop = (elRect.top - containerRect.top) + container.scrollTop;
                // leave some context above the entry instead of pinning it to the very top
                const topMargin = Math.min(150, containerRect.height / 3);
                container.scrollTop = Math.max(0, offsetTop - topMargin);
            }

            resolve();
        });
    }

    export default {
        name: "VenueDetails",
        components: {
            Multiselect,
            'ing-editable-froala': IngEditableWithFroala,
            'ing-toggle' : IngToggle,
        },
        props: {
            venueId: {
                type: String,
                default: '',
                required: true
            },
            isAsRun: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                shown: false,
                scrollY: 0,
                audioTriggerOptions: ['ON_PAUSE', 'ON_FAIL', 'ON_PASS', 'ON_ERROR'],
                filterTriggerOptions: ['General Comments', 'Activity Report Comments', 'Data Review/Closeout Comments', 'Resolved Comments', 'Unresolved Comments', 'Redline', 'Blueline'],
                audioTriggerSelected: [],
                audioMuted: true,
                venueStartedOn: "-",
                showExecutionDescriptionModal: true,
                modalDescriptionValue: '',
                showSuspendResumeConfirmation: false
            };
        },
        async created() {
            await this.fetchVenue(this.venueId);
            window.addEventListener('scroll', this.handleScroll);

            // handle localStorage for audio
            if(localStorage.getItem('ingeniumTriggerAudioOn')) 
                this.audioTriggerSelected = JSON.parse(localStorage.getItem('ingeniumTriggerAudioOn')); 
            else
                localStorage.setItem('ingeniumTriggerAudioOn', JSON.stringify([])); 

            if(localStorage.getItem('ingeniumMute')) 
                this.audioMuted = (localStorage.getItem('ingeniumMute') == "true");
            else
                localStorage.setItem('ingeniumMute', true); 

            //handle localStorage for followExecution
            if(localStorage.getItem('followExecution'))
                this.followExecution = localStorage.getItem('followExecution') === 'true'; 
            else 
                localStorage.setItem('followExecution', false);

        },
        destroyed() {
            window.removeEventListener('scroll', this.handleScroll);
        },
        watch: {
            current_step: async function(id) {
                if(id !== "" && (this.executionMode === "AUTO" || this.isAsRun) && this.followExecution) {
                    let el = document.getElementById(`outline-container-${id}`); // steps in outline

                    if(this.outlineFollow) {
                        await scrollOutlineView(el);
                    }
                    // Note: the main canvas is scrolled by websocket message handler in execution-store.js 
                }
            },
            dataInitialized: function(val) {
                let filtersValue = null;
                if (this.$route && this.$route.query.hasOwnProperty('filters')) {
                    filtersValue = this.$route.query.filters.trim();
                }

                if (filtersValue === null) {
                    // by default if query parameter filters doesnt exist we turn step filter on
                    this.setElemFilter({filter: 'step', value: true});
                } else if (filtersValue === "") {
                    // if filter is blank, set no filter (do nothing)
                } else {
                    const filterItems = filtersValue.split(',');

                    for (const filterItem of filterItems) {
                        this.setElemFilter({filter: filterItem, value: true});
                    }
                }
            }
        },
        computed: {
            ...mapGetters([
                "execution",
                "venue",
                "venueKey",
                "follow",
                "outlineFollow",
                "mode",
                "pageTitle",
                "commentFilter",
                "resolvedFilter",
                "unresolvedFilter",
                "dataReviewFilter",
                "activityReportFilter",
                "redlineFilter",
                "bluelineFilter",
                "isTestConductor",
                "parentExecutionId",
                "dataInitialized",
            ]),
            status: function() {
                if(this.execution && this.execution.status)
                    return this.execution.status;
                return "IDLE";
            },
            callProcedureParentExecutionUrl: function() {
                return `${window.location.origin}/execute_spa/${this.venueId}/${this.parentExecutionId ? this.parentExecutionId :  ''}`;
            },
            filterNames: function() {
                let filters = [];

                if (this.commentFilter) {
                    filters.push('General Comments');
                }

                if (this.activityReportFilter) {
                    filters.push('Activity Report Comments');
                }

                if (this.dataReviewFilter) {
                    filters.push('Data Review/Closeout Comments');
                }

                if (this.resolvedFilter) {
                    filters.push('Resolved Comments');
                }

                if (this.unresolvedFilter) {
                    filters.push('Unresolved Comments');
                }

                if (this.redlineFilter) {
                    filters.push('Redline');
                }

                if (this.bluelineFilter) {
                    filters.push('Blueline');
                }

                return filters;
            },
            filterNamesQueryParamStr: function() {
                let filters = [];
                
                if (this.commentFilter) {
                    filters.push('comment');
                }

                if (this.activityReportFilter) {
                    filters.push('activityReport');
                }

                if (this.dataReviewFilter) {
                    filters.push('dataReview');
                }

                if (this.resolvedFilter) {
                    filters.push('resolved');
                }

                if (this.unresolvedFilter) {
                    filters.push('unresolved');
                }

                if (this.redlineFilter) {
                    filters.push('redline');
                }

                if (this.bluelineFilter) {
                    filters.push('blueline');
                }

                return filters.join(',');
            },
            showSuspendResume: function() {
                return this.parentExecutionId ? true : false;
            },
            getExecutionStatus: function() {
                return this.execution ? this.execution.status : '';
            },
            disableSuspendResume: function() {
                return (!this.isTestConductor) || (this.getExecutionStatus == 'IDLE' ? false : true);
            },
            venueName: function() {
                // Get venue name from venue info. 
                // If the venue is not found (ex, migrated execution or deleted venue), get the venue from execution meta data.
                return (this.venue && this.venue.name) ? this.venue.name : (this.execution ? this.execution.venue_name : '');
            },
            executionInfoStr: function() {
                return `${this.execution ? this.execution.execution_id : '-'} (${this.pageTitle}) - ${this.executionMode}`;
            },
            followExecution: {
                get() { return this.follow; },
                set(val) {
                    this.toggleExecutionFollow(val); 
                    localStorage.setItem('followExecution', val);
                }
            },
            executionMode: function(){
                if(this.execution)
                    return this.execution.mode;
            },
            isAuto: function() {
                if(this.execution)
                    return this.execution.mode == "AUTO";
                return false;
            },
            yPos: function() {
                return this.scrollY;
            },
            current_step: function() {
                if(this.execution)
                    return this.execution.current_step_id;
            },
            followExecToolbar: function() {
                return "follow-header-active";
                // return (this.scrollY >= 160) ? "follow-header-active" : "follow-header";
            },
            statusText: function() {
                if(this.execution && this.execution.status)
                    return `${this.execution.status.charAt(0)}${this.execution.status.toLowerCase().substring(1)}`;
                return "Idle";
            },
            visualMode: function() {
                if(this.execution && this.execution.mode)
                    return `${this.execution.mode.charAt(0)}${this.execution.mode.toLowerCase().substring(1)}`;
                return "-";
            },
            time_elapsed: function() {
                // 16 hour offset for time zone difference
                // return dateformat(this.current_time - Date.parse(`${this.execution.time_started}`), "hh:MM:ss");
                if(!this.isAsRun) {
                    if(this.execution){
                        let difference = parseInt(
                            (this.current_time) -
                                (Date.parse(`${this.execution.time_started}`))
                        );
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
                    }
                    return "-";
                } else 
                    return "Completed";
            },
            current_step_id: function() {
                if(this.execution)
                    return this.execution.current_step_id;
                return "-";
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
            isExecutionDescriptionEmpty: function() {
                if(this.mode !== 'authoring' && this.executionItem) {
                    return this.executionItem.description.trim() === '';
                } 
            },
            disableDescription: function() {
                if(this.mode === 'as-run') {
                    return true;
                }
                return false;
            },
            disableSubmit: function() {
                return this.modalDescriptionValue.trim() === '';
            },
            executionItem: {
                get() { return this.execution; },
                set(val) {
                    this.saveExecution({description: val}); 
                }
            },
        },
        methods: {
            ...mapActions([
                "fetchVenue",
                "toggleExecutionFollow",
                "toggleElemFilter",
                "setElemFilter",
                "saveExecution",
                "suspendResume"
            ]),
            handleScroll: function() {
                this.scrollY = window.scrollY;
            },
            addAudioTrigger: async function(selectedOption, id) {
                let items = JSON.parse(localStorage.getItem('ingeniumTriggerAudioOn'));
                items.push(selectedOption);
                localStorage.setItem('ingeniumTriggerAudioOn', JSON.stringify(items));
            },
            removeAudioTrigger: function(removedOption, id) {
                let items = JSON.parse(localStorage.getItem('ingeniumTriggerAudioOn'));
                items = items.filter(i => i !== removedOption);
                localStorage.setItem('ingeniumTriggerAudioOn', JSON.stringify(items));
            },
            filterTrigger: function(selectedOption) {
                switch(selectedOption) {
                    case 'General Comments':
                        this.toggleElemFilter('comment');
                        break;
                    case 'Activity Report Comments':
                        this.toggleElemFilter('activityReport');
                        break;
                    case 'Data Review/Closeout Comments':
                        this.toggleElemFilter('dataReview');
                        break;
                    case 'Resolved Comments':
                        this.toggleElemFilter('resolved');
                        break;
                    case 'Unresolved Comments':
                        this.toggleElemFilter('unresolved');
                        break;
                    case 'Redline':
                        this.toggleElemFilter('redline');
                        break;
                    case 'Blueline':
                        this.toggleElemFilter('blueline');
                        break;
                }
                
                this.updateQueryParams();
            },
            onResumeParentExecution: async function() {
                let targetExecutionId = this.parentExecutionId ? this.parentExecutionId :  '';
                
                await this.suspendResume(targetExecutionId);
                // Note: switch to parent execution page happens by processing Web Socket message
            },
            toggleMute: function() {
                this.audioMuted = !this.audioMuted;
                localStorage.setItem('ingeniumMute', this.audioMuted);
            },
            toggleVenueDetails: function() {
                this.shown = !this.shown;
            },
            toggleFollowExecution: function() {
                this.followExecution = !this.followExecution;
            },
            closeExecutionDescriptionModal: function() {
                this.showExecutionDescriptionModal = false;
            },
            updateDescription: function(value) {
                this.executionItem = value;
                this.modalDescriptionValue = '';
            },
            updateQueryParams: function() {
                this.$router.replace({
                    path: this.$route.path,
                    query: { ...this.$route.query, ...{filters: this.filterNamesQueryParamStr} },
                });
            },
        },
        filters: {
            timesince: timesince,
            doyTimestamp: doyTimestamp, 
            commonDateTime: commonDateTime,
        }
    };
</script>
<style>
    .multiselect__tags {
        padding-right: 0px !important;
        font-size: 10px !important;
    }
    .multiselect__tag {
        margin-right: 2px !important;
        margin-bottom: 0px !important;
    }
    .multiselect__tag-icon {
        line-height: 16px !important;
    }
</style>

<style lang="scss" scoped>
    #follow-header {
        width:100%;
    }
    #follow-header-active{
        //This is related to the sidepanel width
        max-width: calc(100vw - 515px);
        min-width: calc(50% - 50px);
        height:100px;

        z-index:1;
        
        padding-top:3px;
        padding-left:10px;
        padding-right:10px;
        padding-bottom: 0px;

        background-color:#eee;
        border-bottom:1px solid #ccc;
        border-left:1px solid #ccc;
        border-right:1px solid #ccc;
        border-bottom-right-radius:4px;
        border-bottom-left-radius:4px;

        position: -webkit-fixed;
        position: fixed;
        top:50px;
        right:45px;
    }
    .follow-toggle {
        width: 100px;
        margin-left: -20px;
    }
    .venue-table-print {
        display:none;
    }
    .status-area-print {
        display:none;
    }
    .approval-review {
        float: right;
    }
    .subNav {
       width: 100%; 
    }

    @media print {
        .venue-table{
            display:none;
        }
        .venue-table-print {
            display: table;
        }
        div.status-area-print {
            display: contents;
        }
        #follow-header {
            display: none;
        }
        #follow-header-active {
            display: none;
        }
        .follow-toggle{
            display: none;
        }
        .status_mini_toolbar{
            display: none;
        }
    }
</style>
