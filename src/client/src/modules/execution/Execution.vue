<template>
    <div id="execution-spa">
        <div class="row" style="margin-top: -30px;" v-if="$can('read', 'Execution')">
            <side-panel></side-panel>
            <div class="resizer" id="resize-line"></div>
            <main-panel :execution="execution"></main-panel>
            <feedback-modal></feedback-modal>
            <kickout-modal></kickout-modal>
            <spinner-modal v-if="isBusy"></spinner-modal>
        </div>
        <div class="row" style='text-align:center;' v-else>
            <h3>Insufficient Permissions</h3>
            <p>Execution</p>
        </div>
        <footer v-html="footerText"></footer>
    </div>
</template>

<script>
    import canvasMixin from '../common/mixins/canvas-mixin';
    import SidePanel from "../common/side-panel/SidePanel.vue";
    import MainPanel from "./MainPanel.vue";
    import FeedbackModal from "../common/FeedbackModal.vue";
    import { mapActions, mapGetters} from "vuex";
    import { updateRequestHeader, getUsername, getJwt } from "../common/utils";
    import SpinnerModal from "../common/SpinnerModal.vue";
    import { deleteSwitchWaitFlag, getExecution } from "../../api/execution";
    import venueApi from "../../api/venue";
    import KickoutModal from './KickoutModal.vue';

    export default {
        name: "Execution",
        mixins: [canvasMixin],
        components: {
            SidePanel,
            MainPanel,
            FeedbackModal,
            SpinnerModal,
            KickoutModal,
        },
        beforeRouteEnter(to, from, next) {
            try {
                next(async vm => {
                    // connect web socket
                    vm.$socket.connect();

                    await vm.fetchExecution(vm.executionId);
                    const elements = await vm.fetchElements({executionId: vm.executionId});
                    await vm.initConversations({elements: elements});

                    document.title = "Execution (TC)";
                    
                    // Due to a race condition, call fetchVenue again here.
                    // Venue info is needed to check for test conductor below
                    await vm.fetchVenue(vm.execution.venue_id);
                    // Now the page is loaded and let automatic execution start running steps 
                    // This is needed when execution was switched during automatic execution (e.g., call procedure).
                    // But it does not hurt calling it for all cases
                    if (vm.isTestConductor) {
                        await deleteSwitchWaitFlag(vm.executionId);
                    }

                    vm.setBooleanKey({key: 'dataInitialized', bool: true});
                });
            } catch (err) {
                next(false);
            }
        },
        beforeRouteLeave(to, from, next) {
            // disconnect web socket
            this.routeLeaving = true;
            // beforeRouteLeave callback has access to "this"
            this.$socket.disconnect();
            next();
        },
        watch: {
            status: function() {
                switch(this.execution.status) {
                    case "CLOSED":
                    case "IN_REVIEW":
                    case "FINALIZED": 
                    case "SUSPENDED":
                        window.location.href = `${window.location.origin}/execute/as_run/${window.location.href.split('/')[5]}`;
                }
            },
            notificationMessage: function(newValue) {
                if (newValue.msg) {
                    if (newValue.level === 'INFO') {
                        this.$toasted.info(newValue.msg, { 
                            theme: 'toasted-primary', 
                            position: "top-right", 
                            duration : null,
                            action : {
                                text : 'Dismiss',
                                onClick : (e, toastObject) => {
                                    toastObject.goAway(0);
                                }
                            },
                        });
                    } else {
                        this.$toasted.error(newValue.msg, {
                            theme: 'toasted-primary',
                            position: "top-right",
                            duration : null,
                            action : {
                                text : 'Dismiss',
                                onClick : (e, toastObject) => {
                                    toastObject.goAway(0);
                                }
                            },
                        });  
                    }
                }
            },
            callProcedureRedirectUrl: function(value) {
                window.location.href=`${window.location.origin}/execute_spa/${this.venueId}/${value}`;
            }            
        },
        computed: {
            ...mapGetters([
                "isPending",
                "venue",
                "testConductor",
                "isTestConductor",
                "elements",
                "elementIds",
                "execution",
                "importingProcedure",
                "creatingElement",
                "movingElement",
                "copyingElement",
                "updatingElementInput",
                "mode",
                "pageTitle",
                "notificationMessage",
                "callProcedureRedirectUrl"
            ]),
            status: function() {
                if(this.execution)
                    return this.execution.status;
                else "-";
            },
            isBusy: function() {
                return this.isPending || this.importingProcedure || this.creatingElement || this.movingElement || this.copyingElement || this.updatingElementInput;
            },
            venueId: function() {
                return this.venue ? this.venue.venue_id : '';
            },
        },
        data() {
            return {
                executionId: this.$route.params.executionId,
                currentUser: getUsername(),
                routeLeaving: false,  // flag to indicate this page is being switch to another page
                footerText: window.uiCustomFooter || ""
            };
        },
        sockets: {
            connect() {
                this.$socket.emit('set-execution-id', { execution_id: this.executionId });
                console.info(`Execution Monitor Service was connected for Execution: ${this.executionId}`);
            },
            reconnect() {
                console.info("Execution Monitor Service was reconnected.");
            },
            reconnecting() {
                console.info("Execution Monitor Service is reconnecting.");
                // refresh the auth token before the reconnect attempt opens a new
                // transport, otherwise a rotated/expired token keeps failing forever
                if (this.$socket && this.$socket.io && this.$socket.io.opts) {
                    this.$socket.io.opts.query = { token: getJwt() };
                }
            },
            connect_error() {
                console.error("Execution Monitor Service has connection error.");
            },
            reconnect_error() {
                console.error("Execution Monitor Service has reconnection error.");
            },
            disconnect() {
                if (!this.routeLeaving) {
                    this.$toasted.error("Execution Monitor Service was disconnected.", { 
                        theme: "toasted-primary", 
                        position: "top-right", 
                        duration : null,
                        action : {
                            text : 'Reload Page',
                            onClick : (e, toastObject) => {
                                toastObject.goAway(0);
                                location.reload();
                            }
                        },
                    });
                }
            },
        },
        methods: {
            ...mapActions([
                "fetchExecution",
                "fetchElements",
                "initConversations",
                "setMode",
                "fetchVenue",
                "setBooleanKey",
                "loadDebugEnabled"
            ]),
        },
        created() {
            updateRequestHeader();
            this.setMode({mode: 'execution'});
        },
        async mounted() {
            // js dom ready equivalent
            this.resizeListener();
            const execution = await getExecution(this.executionId);
            if (execution && execution.venue_id) {
                await this.fetchVenue(execution.venue_id);
                const venue = this.venue;
                const testConductor = venue.venue_status ? venue.venue_status.test_conductor : '';
                const participants = execution && execution.participants ? execution.participants : [];
                const redline_approvers = execution && execution.redline_approvers ? execution.redline_approvers : [];

                if (testConductor !== this.currentUser && !participants.includes(this.currentUser) && !redline_approvers.includes(this.currentUser)) {
                    window.location.href = `${window.location.origin}/execute/as_run/${window.location.href.split('/')[5]}`;
                }
            } else {
                console.error(`Failed to get execution info. Redirect to as run page`);
                window.location.href = `${window.location.origin}/execute/as_run/${window.location.href.split('/')[5]}`;
            }
            this.loadDebugEnabled();
        }
    };
</script>

<style lang="css" scoped>
    @import '../../assets/styles/elements.css';
    .row {
        display: flex;
    }
    .resizer { 
        background-color: white;
        cursor: ew-resize;
        min-height: 100%;
        user-select: none;
        min-width: 20px;
    }
    footer {
        font-size: 9px;
        color: black;
        text-align: center;
        display: none;
    }

    @page {
        size: A4;
        margin: 11mm 17mm 17mm 17mm;
    }

    @media print {
        footer {
            position: fixed;
            bottom: 0;
            display: table;
        }

        .content-block, p {
            page-break-inside: avoid;
        }

        html, body {
            width: 210mm;
            height: 297mm;
        }
    }
</style>
