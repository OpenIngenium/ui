<template>
    <div id="as-run-spa">
        <div class="row">
            <side-panel></side-panel>
            <div class="resizer" id="resize-line"></div>
            <main-panel :execution="execution"></main-panel>
            <feedback-modal></feedback-modal>
            <spinner-modal v-if="isPending"></spinner-modal>
        </div>
        <footer v-html="footerText"></footer>
    </div>
</template>

<script>
    import SidePanel from "./side-panel/SidePanel.vue";
    import MainPanel from "./MainPanel.vue";
    import FeedbackModal from "../common/FeedbackModal.vue";
    import { mapActions, mapGetters } from "vuex";
    import { updateRequestHeader } from "../../modules/common/utils";
    import canvasMixin from '../common/mixins/canvas-mixin';
    import SpinnerModal from "../common/SpinnerModal.vue";

    export default {
        name: "AsRun",
        mixins: [canvasMixin],
        components: {
            SidePanel,
            MainPanel,
            FeedbackModal,
            SpinnerModal,
        },
        beforeRouteEnter(to, from, next) {
            try {
                next(async vm => {
                    // connect web socket
                    vm.$socket.connect();

                    await vm.fetchExecution(vm.executionId);
                    await Promise.all([
                        vm.fetchStepPaletteBuiltIn(),
                        vm.fetchStepPaletteCustom()
                    ]);
                    const elements = await vm.fetchElements({executionId: vm.executionId});
                    await vm.initConversations({elements: elements});

                    document.title = vm.pageTitle;
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
        data() {
            return {
                executionId: this.$route.params.executionId,
                routeLeaving: false,  // flag to indicate this page is being switch to another page
                footerText: window.uiCustomFooter || ""
            };
        },
        sockets: {
            connect() {
                this.$socket.emit('set-execution-id', { execution_id: this.executionId });
                console.info(`Execution Monitor Service was connected for AsRun: ${this.executionId}`);
            },
            reconnect() {
                console.info("Execution Monitor Service was reconnected.");
            },
            reconnecting() {
                console.info("Execution Monitor Service is reconnecting.");
            },
            connect_error() {
                console.error("Execution Monitor Service has connection error.");
            },
            reconnect_error() {
                console.error("Execution Monitor Service has reconnection error.");
            },
            disconnected() {
                if (!this.routeLeaving) {
                    this.$toasted.show("Execution Monitor Service was disconnected.", { 
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
            }
        },
        methods: {
            ...mapActions([
                "fetchElements",
                "fetchExecution",
                "fetchStepPaletteBuiltIn",
                "fetchStepPaletteCustom",
                "initConversations",
                "setMode",
                "setBooleanKey",
                "loadDebugEnabled"
            ]),
        },
        computed: {
            ...mapGetters([
                "elements",
                "elementIds",
                "execution",
                "mode",
                "pageTitle",
                "notificationMessage",
                "callProcedureRedirectUrl",
                "venue",
                "isPending"
            ]),
            venueId: function() {
                return this.venue ? this.venue.venue_id : '';
            },            
        },
        watch: {
            notificationMessage: function(newValue) {
                if (newValue.msg) {
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
            },
            callProcedureRedirectUrl: function(value) {
                // go to watcher's page
                window.location.href=`${window.location.origin}/execute/as_run/${value}`;
            }
        },
        created() {
            updateRequestHeader();
            this.setMode({'mode': 'as-run'});
        },
        mounted() {
            // js dom ready equivalent
            this.resizeListener();
            this.loadDebugEnabled();
        }
    };
</script>

<style lang="scss" scoped>
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
