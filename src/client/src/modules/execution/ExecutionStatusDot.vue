<template>
    <div>
        <div :style="{display: 'inline'}" @click="toggleErrorButton()">
            <button 
                v-if="canOverride"
                title="Override Result"
                @click="onOverrideResult"
                :class="getOverrideIconClass"
            >
            </button>
            <span :class="[statusColorClass, lightRed, 'execution-status-dot', dotWidthClass]" :title="getTooltipText">{{status | titlecase}}</span>
        </div>
        <ing-modal v-if="showOverrideModal" @close="showOverrideModal = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Override</h4>
            </template>
            <template slot="body">
                <div class="pre-formatted">{{ overrideModalMessage }}</div>
                <textarea class="override_justification_box" 
                          :class="invalidJustification ? 'invalid' : ''" v-model="overrideJustification" 
                          placeholder="Please provide justification for override here...">
                </textarea>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    style=""
                    @click="showOverrideModal = false">
                    Cancel
                </button>
                <div v-if="isOverridden">
                    <button
                        type="button"
                        class="btn btn-danger pull-left"
                        style="margin-left: 10px"
                        @click="discardOverride"
                    >
                        Discard
                    </button>   
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="updateOverride"
                        :disabled="invalidJustification"
                    >
                        Update
                    </button>
                </div>
                <div v-else>
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="applyOverride"
                        :disabled="invalidJustification"
                    >
                        Override
                    </button>
                </div>
            </template>
        </ing-modal>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import { titlecase } from "../common/filters";

    export default {
        name: "ExecutionStatusDot",
        data() {
            return {
                lightRed: 'light',
                showOverrideModal: false,  // TODO: move this to vuex app-wide store
                overrideJustification: "",
            };
        },
        created() {
            this.overrideJustification = this.getOverrideJustification ? this.getOverrideJustification : '';
        },
        props: {
            elementId: {
                type: String,
                required: true
            },
            element: {
                type: Object,
                required: true
            },            
            status: {
                type: String,
                required: true
            },
            justification: {
                type: String
            },
            isStepPending: {
                type: Boolean,
                required: true
            },
        },
        computed: {
            ...mapGetters([
                "isPending",
                "currentStepId",
                "directionalUnExecutedElement",
                "elementKey",
                "execution",
                "executionMetaDataKey",
                "updatingElementInput",
                "isOneOfTestConductors",
                "executionHasBeenClosed",
            ]),
            statusColorClass: function() {
                let color_class = ""; 
                switch (this.status) {
                    case "PASS":
                    case "OVERRIDE_PASS":
                        color_class = "green";
                        break;
                    case "FAIL":
                    case "OVERRIDE_FAIL":
                        color_class = "orange";
                        break;
                    case "ERROR":
                        color_class = "red";
                        break;
                    default:
                        // ignore other status such as RUNNING
                        color_class = "";
                }
                return color_class;
            },
            dotWidthClass: function() {
                switch (this.status) {
                    case "OVERRIDE_PASS":
                    case "OVERRIDE_FAIL":
                        return "override-width";
                    default:
                        return "default-width";
                }
            },
            getTooltipText: function() {
                return this.justification ? `Override Justification: ${this.justification}` : "";
            },
            stepStatus: function() {
                return this.element.execution && this.element.execution.meta_data ? this.element.execution.meta_data.status : '';
            },
            canOverride: function() {
                if (this.execution && this.execution.status === 'FINALIZED') {
                    return false;
                }
                if (!this.isOneOfTestConductors && !this.$can(['update'], 'Admin')) {
                    return false;
                }
                switch (this.stepStatus) {
                    case "PASS":
                    case "FAIL":
                    case "OVERRIDE_PASS":
                    case "OVERRIDE_FAIL":
                        return true;
                    default:
                        return false;
                }
            },
            invalidJustification: function() {
                return this.overrideJustification.trim() === '';
            },
            isOverridden: function() {
                switch (this.stepStatus) {
                    case "OVERRIDE_PASS":
                    case "OVERRIDE_FAIL":
                        return true;
                    default:
                        return false;
                }
            },
            getOverrideStatus: function() {
                switch (this.stepStatus) {
                    case "PASS":
                    case "OVERRIDE_FAIL":
                        return "OVERRIDE FAIL";
                    case "FAIL":
                    case "OVERRIDE_PASS":
                        return "OVERRIDE PASS";
                    default:
                        console.warn(`Step Status is of unexpected type: ${this.stepStatus}}`);
                        return "";
                }
            },
            getOverrideJustification: function() {
                return this.executionMetaDataKey(this.elementId, 'override_justification');
            },
            getOverrideIconClass: function() {
                switch (this.stepStatus) {
                    case "PASS":
                    case "OVERRIDE_PASS":
                        return "glyphicon glyphicon-thumbs-down";
                    case "FAIL":
                    case "OVERRIDE_FAIL":
                        return "glyphicon glyphicon-thumbs-up";
                    default:
                        return "";
                }
            },
            overrideModalMessage: function() {
                return `${this.isOverridden ? 
                    `Step ${this.element.number}${this.element.title ? `: ${this.element.title}` : ''} has already been overridden.
To discard the overridden status please press the 'Discard' Button.
To update the override please provide a new justification below:` : 
                    `You are overriding the status of step ${this.element.number}${this.element.title ? `: ${this.element.title}` : ''}.
Status will be changed from ${this.stepStatus} to ${this.getOverrideStatus}
Please provide your justification for this override:`
                }`;
            }
        },
        methods: {
            ...mapActions([
                "setPending",
                "overrideStepStatus",
                "updateOverrideStepStatus",
                "discardOverrideStepStatus",
                "refreshExecution",
            ]),
            toggleErrorButton: function() {
                if (this.status === "ERROR") {
                    if (this.lightRed === '') {
                        this.lightRed = 'light';
                    } else if (this.lightRed === 'light') {
                        this.lightRed = '';
                    }
                }
            },
            onOverrideResult: function() {
                this.overrideJustification = this.getOverrideJustification ? this.getOverrideJustification : '';
                this.showOverrideModal = true;
            },
            applyOverride: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.overrideStepStatus({
                    elementId: this.elementId,
                    justification: this.overrideJustification,
                });

                // Refresh computed steps (such as VI Status) only when the execution has been closed,
                // since execution is automatically refreshed when it is closed.
                if (this.executionHasBeenClosed) {
                    await this.refreshExecution(this.execution.execution_id);
                }

                this.setPending(false);
                this.showOverrideModal = false;
            },
            updateOverride: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.updateOverrideStepStatus({
                    elementId: this.elementId,
                    justification: this.overrideJustification,
                });
                this.setPending(false);
                this.showOverrideModal = false;
            },
            discardOverride: async function() {
                // prevent double click
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.discardOverrideStepStatus({
                    elementId: this.elementId
                });

                // Refresh computed steps (such as VI Status) only when the execution has been closed,
                // since execution is automatically refreshed when it is closed.
                if (this.executionHasBeenClosed) {
                    await this.refreshExecution(this.execution.execution_id);
                }

                this.setPending(false);
                this.showOverrideModal = false;
            },
        },
        filters: {
            titlecase
        }
    };
</script>

<style lang="scss" scoped>
    .execution-status-dot {
        display: inline-block;
        height: 24px;
        text-align: center;
        padding: 2px;
        border-radius: 10px;
        color: #FFFFFF;
    }
    
    .default-width {
        width: 70px;
    }
    
    .override-width {
        width: 100px;
    }

    .green {
        background-color: #A3DE5F;
    }

    .orange {
        background-color: #F2A900;
    }

    .red {
        background-color: #FF585C;
    }
    
    .red.light {
        color: #a94442 !important;
        background-color: #f2dede !important;
        border-color: #ebccd1 !important;
    }

    .override_justification_box {
        width: 100%;
        min-height: 100px;
    }

</style>
