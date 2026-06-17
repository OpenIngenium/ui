<template>
    <div id="authoring-spa" :style="`margin-top: ${topNavbarHeight - 29}px;`">
        <div class="row" v-if="$can('read', 'Authoring')">
            <side-panel></side-panel>
            <div class="resizer" id="resize-line"></div>
            <main-panel></main-panel>
            <feedback-modal></feedback-modal>
            <spinner-modal v-if="isBusy"></spinner-modal>
        </div>
        <div class="row" style='text-align:center;' v-else>
            <h3>Insufficient Permissions</h3>
            <p>Authoring</p>
        </div>
        <footer v-html="footerText"></footer>
    </div>
</template>

<script>
    import SidePanel from "./side-panel/SidePanel.vue";
    import MainPanel from "./MainPanel.vue";
    import FeedbackModal from "../common/FeedbackModal.vue";
    import { mapActions, mapGetters } from "vuex";
    import { updateRequestHeader } from "../common/utils";
    import canvasMixin from '../common/mixins/canvas-mixin';
    import SpinnerModal from "../common/SpinnerModal.vue";

    export default {
        name: "Authoring",
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
                    
                    // fetchProcedureVersion set procedureId and version, which will be used by isWorkingCopy
                    await vm.fetchProcedureVersion({procedureId: vm.procedureId, version: vm.version});
                    const elements = await vm.fetchElements({procedureId: vm.procedureId, version: vm.version});

                    if (vm.isWorkingCopy) {
                        if (to.query.hasOwnProperty('update')) {
                            vm.setEditMode({editMode: true});
                        } else {
                            vm.setEditMode({editMode: false});
                        }                
                    } else {
                        vm.setEditMode({editMode: false});
                    }                    
                    
                    if (vm.workingCopy) {
                        if (to.query.hasOwnProperty('update') && vm.procedureDetails.locked_by == "") {
                            await vm.lockProcedure({procedureId: vm.procedureId});
                        }
                    } else {
                        await vm.initConversations({elements: elements});
                    }

                    vm.setBooleanKey({key: 'dataInitialized', bool: true});

                    document.title = vm.pageTitle;
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
                version: this.$route.params.version,
                procedureId: this.$route.params.procedureId,
                routeLeaving: false,  // flag to indicate this page is being switch to another page
                topNavbarHeight: 0,
                footerText: window.uiCustomFooter || ""
            };
        },
        sockets: {
            connect() {
                this.$socket.emit('set-procedure-id', { procedure_id: this.procedureId, version: this.version });
                console.info(`Execution Monitor Service was connected for Procedure: ${this.procedureId}:${this.version}`);
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
                "fetchElements",
                "fetchProcedureVersion",
                "initConversations",
                "lockProcedure",
                "setEditMode",
                "setBooleanKey",
                "loadDebugEnabled"
            ]),
        },

        computed: {
            ...mapGetters([
                "isPending",
                "procedureDetails",
                "importingProcedure",
                "creatingElement",
                "movingElement",
                "copyingElement",
                "updatingElementInput",
                "isWorkingCopy",
                "mode",
                "editMode",
                "pageTitle"
            ]),
            workingCopy: function() {
                return this.version === "0";
            },
            isBusy: function() {
                return this.isPending || this.importingProcedure || this.creatingElement || this.movingElement || this.copyingElement || this.updatingElementInput;
            },
        }, 

        created() {
            if (document.getElementsByClassName('header-navbar')[0]) {
                this.topNavbarHeight = document.getElementsByClassName('header-navbar')[0].offsetHeight;
            }
            
            updateRequestHeader();
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
