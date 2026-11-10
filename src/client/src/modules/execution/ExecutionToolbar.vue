<template>
    <div class="exec_toolbar">
        <div class="step_execution_box_button_container">
            <button v-if="showSelectButton"
                    title="Select As Current Step"
                    @click="activateExecuteableElementCallback"
                    :disabled="!clearForExecution || isStepPending"
                    class="glyphicon glyphicon-screenshot">
            </button>
            <button v-if="showExecuteButton"
                    title="Run Step"
                    @click="onExecuteElement"
                    :disabled="isPending || !clearForExecution || isStepPending || updatingElementInput"
                    class="glyphicon glyphicon-flash">
            </button>
            <button v-if="showReExecuteButton"
                    title="To Re-Execute"
                    :disabled="isStepPending"
                    @click="prepareReExecuteConfirmationCallback"
                    class="glyphicon glyphicon-repeat">
            </button>
        </div>
        <ing-modal v-if="showRerunModal" @close="showRerunModal = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Re-execute?</h4>
            </template>
            <template slot="body">
                This step has already been executed. Are you sure you want to run it again?
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    style=""
                    @click="prepareExecuteNextStepCallback">
                    No
                </button>
                <button
                    type="button"
                    class="btn btn-primary"
                    @click="prepareReExecuteElementCallback"
                >
                    Yes
                </button>
            </template>
        </ing-modal>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    
    export default {
        name: "ExecutionToolbar",
        props: {
            // remove this V
            elementId: {
                type: String,
                required: true
            },
            element: {
                type: Object,
                required: true
            },
            executionId: {
                type: String,
                required: true
            },
            executed: {
                type: Boolean,
                required: true
            },
            executable: {
                // Possible values are EXECUTED, and COMPUTED
                type: String,
                required: true
            },
            isStepPending: {
                type: Boolean,
                required: true
            },
            clearForExecution: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                showRerunModal: false,  // TODO: move this to vuex app-wide store
            };
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
            ]),
            hasUnExecutedAbove: function() {
                return Boolean(this.directionalUnExecutedElement(this.element.elem_id, "before"));
            },
            hasUnExecutedBelow: function() {
                return Boolean(this.directionalUnExecutedElement(this.element.elem_id, "after"));
            },
            showSelectButton: function() {
                return (this.elementId !== this.currentStepId) && (this.executed === false || this.executable === 'COMPUTED');
            },
            showExecuteButton: function() {
                return (this.elementId === this.currentStepId) && (this.executed === false || this.executable ==='COMPUTED');
            },
            showReExecuteButton: function() {
                return (this.executed === true) && (this.executable === 'EXECUTED');
            },
            isVIS: function() {
                let stepType = this.elementId ? this.elementKey(this.elementId, "step_type") : "";
                return stepType === "VERIFICATION_ITEM_STATUS";
            },
        },
        methods: {
            ...mapActions([
                "setPending",
                "executeElement",
                "prepareReExecuteElement",
                "updateCurrentElement",
            ]),
            activateExecuteableElementCallback: async function() {
                await this.updateCurrentElement({
                    executionId: this.executionId,
                    element: this.element
                });
            },
            onExecuteElement: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.executeElement({
                    elementId: this.element.elem_id
                });
                this.setPending(false);
            },
            prepareReExecuteConfirmationCallback: function() {
                this.showRerunModal = true;
            },
            prepareReExecuteElementCallback: async function() {
                this.showRerunModal = false;
                await this.prepareReExecuteElement({
                    elementId: this.element.elem_id
                });
            },
            prepareExecuteNextStepCallback: function() {
                this.showRerunModal = false;
                this.scrollToNextExecutable('after');
            },
            scrollToNextExecutable: function(direction) {
                const elementId = this.directionalUnExecutedElement(this.element.elem_id, direction);
                const elementAnchor = document.getElementById(elementId);
                window.scrollTo({
                    top: elementAnchor.getBoundingClientRect().top + window.scrollY,
                    behavior: "smooth"
                });
            }
        }
    };
</script>

<style scoped>

    .pre-formatted {
        white-space: pre;
    }

    .invalid {
        border-color: red;
    }
    
    .step_execution_box_button_container {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        position: absolute;
        background-color: #FFFFFF;
        min-height: 46px;
        margin-top: -11px;
        padding: 6px 8px;
        right: -49px;
        border: 1px solid #D8D6D6;
        border-radius: 0 4px 4px 0;
        border-left: none;
    }

    .step_execution_box_button_container button {
        width: 32px;
        height: 28px;
        margin-bottom: 1px;
        padding-top: 4px;
        border-radius: 4px;
        background-color: #A4DC67;
        color: #000000;
    }

    .step_execution_box_button_container button:disabled {
        width: 32px;
        height: 28px;
        margin-bottom: 1px;
        padding-top: 4px;
        border-radius: 4px;
        background-color: #cecece;
        color: #000000;
    }

    button:focus { outline: none; }

    @media print {
        .exec_toolbar {
            display:none;
        }
    }
</style>
