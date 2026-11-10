<template>
    <div
        :style="currentStepIndicator"
        :id="stepData.elem_id"
        class="page-break">

        <!-- Delete element confirmation modal {{{ -->
        <ing-modal v-show="confirmRemoveElement" @close="confirmRemoveElement = false" size="small">
            <template slot="title">
                <h4>Confirm Delete</h4>
            </template>

            <template slot="body">
                <p>Do you want to delete the section and all its children? This action cannot be reverted.</p>
            </template>

            <template slot="footer">
                <button type="button" class="btn btn-primary pull-right" @click="handleRemoveElement(true)">Delete</button>
                <button type="button" class="btn pull-right" @click="confirmRemoveElement = false">Cancel</button>
            </template>
        </ing-modal>
        <!-- }}} -->

        <li class="step" :class="elementCssClass">
            <div
                class="step-draggable-area step-draggable"
                v-drag-and-drop="{ elemId: stepData.elem_id, disabled: disableDragElement }"
                :style="disableCursor"
                ref="dragDropArea">
                <a :id="stepData.elem_id" class="anchor"></a>
                <execution-toolbar
                    v-if="showExecutionToolbar"
                    :execution-id="stepData.execution_id"
                    :element="stepData"
                    :executed="Boolean(elementKey(stepData.elem_id, 'executed'))"
                    :executable="elementKey(stepData.elem_id, 'executable')"
                    :is-step-pending="isStepPending"
                    :clear-for-execution="clearForExecution"
                    :element-id="stepData.elem_id">
                </execution-toolbar>
                <div class="header">
                    <div
                        v-if="deletedTitle"
                        class="deleted-title">DELETED</div>
                    <div :class="elementTypeTitleStyle">{{ elementKey(stepData.elem_id, 'number') }}</div>
                    <div
                        class="step_title ing-tooltip"
                        :class="elementTypeTitleStyle"
                        data-toggle="tooltip"
                        data-placement="top"
                        data-trigger="hover"
                        onclick="$(this).tooltip('hide');"
                        :title="canEditElement ? tooltips.auth_exec_all_title : ''" >
                        <ing-editable
                            :disabled="!canEditElement"
                            :color="elementColor"
                            v-on:save="updateTitle"
                            :value="stepData.title"
                            v-on:disableDragDrop="disableTitleDragDrop"
                            :inputClasses="modStyle(stepData.elem_id, 'title', false)"
                        >
                        </ing-editable>
                    </div>
                    <div class="step-icons">
                        <span
                            v-if="showConsistencyFlag"
                            class="consistency-flag-pill ing-tooltip"
                            :class="consistencyFlagClass"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="consistencyFlagTooltip">
                            <span :class="consistencyFlagIconClass"></span>
                            {{ consistencyFlagLabel }}
                        </span>
                        <button
                            v-if="showAutoSelectCustomScriptButton"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            title="Update this step with the latest custom script definition."
                            @click.stop="autoSelectCustomScript"
                            type="button"
                            class="btn btn-xs btn-warning auto-select-custom-script ing-tooltip">
                            <span class="glyphicon glyphicon-refresh"></span> Update
                        </button>
                        <button
                            v-if="debugEnabled"
                            class="step-button ing-tooltip"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_print_step_contents"
                            @click="printStepContents">
                            <span class="glyphicon glyphicon-info-sign"></span>
                        </button>
                        <button
                            v-if="showDataEntryIcon"
                            class="step-button ing-tooltip"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            :title="tooltips.auth_exec_data_grid"
                            @click="showTableEntry = !showTableEntry">
                            <span class="glyphicon glyphicon-th-list"></span>
                        </button>
                        <button
                            v-if="showReplaceElementButton"
                            class="step-button ing-tooltip"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="tooltips.auth_replace_element"
                            @mouseenter="onMouseEnter"
                            @click="onReplaceElement()">
                            <img 
                                src='/static/images/copy_replace_icon.png' 
                                width='24px' 
                                height='24px' 
                                :class="replaceElementButtonClass"
                            >
                        </button>
                        <button
                            v-if="this.mode !== 'authoring' && this.mode !== 'as-run' && this.isTestConductor"
                            class="step-button ing-tooltip"
                            :class="breakpointClass"
                            @click="setBreakpoint()"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="tooltips.breakpoint">
                            <span class="glyphicon glyphicon-record"></span>
                        </button>
                        <button
                            v-if="shouldShowComments"
                            class="step_comment_button step-button ing-tooltip"
                            @click="toggleComments"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="tooltips.comments">
                            <span 
                                style="position: relative;" 
                                class="glyphicon glyphicon-comment"
                                :class="commentResolvedStatusClass"
                            >
                                <span :class="commentNumberClass">{{ numConversations }}</span>
                            </span>
                        </button>
                        <view-state-buttons
                            :level="elementLevelDetail"
                            v-on:setViewState="setViewState">
                        </view-state-buttons>
                        <button
                            @click="handleToggleSelectedElement($event, { elementId: stepData.elem_id })"
                            :class="`step-button ing-tooltip ${isElementSelected ? 'selected-element': ''}`"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="tooltips.select_element"
                        >
                            <span class="glyphicon glyphicon-ok-circle"></span>
                        </button>
                        <button
                            :disabled="!canDeleteElement"
                            @click="handleRemoveElement(false)"
                            class="step_remove_button step-button ing-tooltip"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            :title="tooltips.auth_exec_all_delete"
                        >
                            <span class="glyphicon glyphicon-remove"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <ing-tag-inline
                    :available-tags="availableTags"
                    :tags="this.tags"
                    :mode="mode"
                    :isSection="this.stepData.elem_type == 'PROCEDURE_SECTION' || this.stepData.elem_type == 'SECTION' || this.stepData.elem_type == 'PARAGRAPH'"
                    v-on:deleteTag="handleDeleteTag"
                    v-on:addTag="handleAddTag"
                ></ing-tag-inline>
            </div>
            
            <div class="step_execution_details">
                <div :class="['step_type ' + elementCssClass]"><span :class="['step_type_text ' + elementCssClass]">{{ elementTitle }}</span></div>
                <div v-if="elementKey(stepData.elem_id, 'executed') && elementKey(stepData.elem_id, 'execution')">
                    <span class="glyphicon glyphicon-time">
                        &nbsp;Started:
                        <span data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            class="ing-tooltip"
                            :title="`Started: ${tooltipTimestampStarted}`"
                        >
                            &nbsp;{{executionMetaDataKey(stepData.elem_id, 'time_started') | doyTimestamp}}&nbsp;(UTC)
                        </span>
                    </span>
                    <br>
                    <span class="glyphicon glyphicon-time">
                        &nbsp;Completed:
                        <span data-toggle="tooltip"
                            data-placement="top"
                            data-trigger="hover"
                            onclick="$(this).tooltip('hide');"
                            class="ing-tooltip"
                            :title="`Completed: ${tooltipTimestampCompleted}`"
                        >
                            &nbsp;{{executionMetaDataKey(stepData.elem_id, 'time_completed') | doyTimestamp}}&nbsp;(UTC)
                        </span>
                    </span>
                </div>
                <div v-if="elementKey(stepData.elem_id, 'executed') && elementKey(stepData.elem_id, 'execution')">
                    <span class="glyphicon glyphicon-user">&nbsp;{{executionMetaDataKey(stepData.elem_id, 'test_conductor')}}</span>
                </div>
                <div v-if="elementKey(stepData.elem_id, 'executed') && elementKey(stepData.elem_id, 'execution')"  data-toggle="collapse" :data-target="'.' + stepData.elem_id">
                    <execution-status-dot 
                        :element-id="stepData.elem_id"
                        :element="stepData"
                        :is-step-pending="isStepPending"
                        :status="executionMetaDataKey(stepData.elem_id, 'status')" 
                        :justification="executionMetaDataKey(stepData.elem_id, 'override_justification')"
                    >
                    </execution-status-dot>
                </div>
            </div>
            <div
                v-if="elementLevelDetail > 1"
                class="step_description ing-tooltip"
                data-toggle="tooltip"
                data-placement="top"
                data-trigger="hover"
                style="width:100%; padding-right:20px;"
                onclick="$(this).tooltip('hide');"
                :title="canEditElement ? tooltips.auth_exec_all_description : ''">
                <ing-editable-froala
                    :value="stepDescription"
                    v-on:save="updateDescription"
                    :elementId="stepData.elem_id"
                    :disabled="!canEditElement"
                    :inputClasses="modStyle(stepData.elem_id, 'description', false)"
                >
                </ing-editable-froala>
            </div>

            <execution-status
                v-if="showStatusMessage"
                :status="elementStatusMessage">
            </execution-status>

            <execution-step-error
                v-if="showErrorMessage"
                :metaData="executionMetaData(stepData.elem_id)"
            ></execution-step-error>

            <div class="clearfix"></div>
            <div class="step_detail step_show_details">
                <component
                    v-if="getElementMap(stepData)"
                    ref="elementComponent"
                    :key="componentKey"
                    :is="elementMap.comp"
                    :mode="mode"
                    :element-map="getElementMap(stepData)"
                    :element-id="stepData.elem_id"
                    v-on:dataEntryEvent="handleDataEntryEvent"
                    :show-table-entry="showTableEntry">
                </component>
            </div>
            <div
                v-if="(elementKey(stepData.elem_id, 'run_for_score') && !isElementSection) || (elementKey(stepData.elem_id, 'run_for_score') && redlinedProcedureSection)"
                v-bind:class="[ noEntryElement ? 'no-entry-element-additional-margin' : '' ]">
                <ing-redline
                    v-if="showRedBlueline && elementKey(stepData.elem_id, 'procedure_modification_status') != 'ORIGINAL'"
                    :step-redline-data="stepData"
                    :mode="mode"
                    :element-map="elementMap"></ing-redline>
                <font-awesome-icon
                    class="procedure-modification-status"
                    :icon="this.unlock"
                    v-if="lockUnlockIcon"
                    size="1x"></font-awesome-icon>
                <font-awesome-icon
                    class="procedure-modification-status"
                    :icon="this.lock"
                    v-if="!lockUnlockIcon"
                    size="1x"></font-awesome-icon>
                <span
                    :title="elementKey(stepData.elem_id, 'procedure_modification_status')"
                    class="procedure-title">{{ elementKey(stepData.elem_id, 'procedure_title') }}</span>
                <span class="pull-right">
                    <span
                        v-if="showRedlineDiffToggle"
                        class="btn btn-light redline-diff"
                        :class="toggleDiffsClass"
                        @click="toggleRedlineDiff">
                        <i class="glyphicon glyphicon-flag"></i>
                        {{ toggleDiffsLabel }}
                    </span>
                    <span
                        v-if="showModify && mode !== 'as-run'"
                        class="btn btn-light redline-modify"
                        @click="handleModify">
                        <i class="glyphicon glyphicon-edit"></i>
                        Modify
                    </span>
                    <button v-if="showRedlineBulkSelection"
                        class="step_bulkredline_button glyphicon glyphicon-exclamation-sign"
                        style="background-color: transparent; float: right; height: 28px;border-radius: 4px; opacity: 0.5; margin-top: 4px; margin-left: 5px; line-height: 1; border: 1px solid gray;"
                        :class="redlineIconClasses"
                        @click="handleRedlineStepSelection"
                        title="Select Redline">
                    </button>
                    <span
                        v-if="showRedBlue"
                        v-on:click="toggleRedBlue()"
                        :class="'btn btn-light redline-blueline-indicator ' + redBlueLineClass">
                            <i
                                class="glyphicon glyphicon-chevron-up"
                                v-if="showRedBlueline"></i>
                            <i
                                class="glyphicon glyphicon-chevron-down"
                                v-if="!showRedBlueline"></i>
                            {{ redBlueLine }}
                        </span>
                    <i
                        v-if="showApprovalCheckmark"
                        class="glyphicon glyphicon-ok approve-checkmark"></i>
                </span>
            </div>
            <div
                v-else
                :style="elementKey(stepData.elem_id, 'procedure_title').length === 0 ? 'height: 0px;' : ''">
                <span
                    :title="elementKey(stepData.elem_id, 'procedure_modification_status')"
                    class="procedure-title-non-icon">{{ elementKey(stepData.elem_id, 'procedure_title') }}
                </span>
            </div>
            <div :id="'conversation-' + stepData.elem_id" :class="'comments-container-' + elementCssClass">
                <ing-conversations
                    v-show="showComments"
                    :version="procedureInfo.version || -1"
                    :executionId="stepData.execution_id || stepData.procedure_id"
                    :elementId="stepData.elem_id"></ing-conversations>
            </div>
        </li>
    </div>
</template>

<script>
    import _ from "lodash";
    import {mapActions, mapGetters} from "vuex";
    import ExecutionStatusDot from "../execution/ExecutionStatusDot.vue";
    import ExecutionToolbar from "../execution/ExecutionToolbar.vue";
    import ExecutionStepError from "../execution/ExecutionStepError.vue";
    import ExecutionStatus from "../execution/ExecutionStatus.vue";
    import IngEditable from "../common/IngEditable.vue";
    import IngEditableWithFroala from "../common/IngEditableWithFroala.vue";
    import IngConversations from "../common/IngConversations.vue";
    import ViewStateButtons from "./ViewStateButtons.vue";
    import IngRedline from "./IngRedline.vue";
    import IngModal from "../common/IngModal.vue";
    import IngTagInline from "./IngTagInline.vue";
    import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
    import lock from "@fortawesome/fontawesome-free-solid/faLock";
    import unlock from "@fortawesome/fontawesome-free-solid/faUnlock";

    import {commonTimestampWithTimezone, doyTimestamp, titlecase} from "../common/filters";
    import {getElementDisplayName} from "../common/elem_types";
    let TOOLTIPS = require('../common/tooltip-config');

    export default {
        name: "IngElement",
        data() {
            return {
                editorComment: '',
                showComments: false,
                showRedBlueline: false,
                unlock: unlock,
                lock: lock,
                showTableEntry: false,
                confirmRemoveElement: false,
                lockModifyButton: false,
                lockRemoveButton: false,
            };
        },
        created() {
            this.fetchStepPaletteBuiltIn();
            this.fetchStepPaletteCustom();
        },
        components: {
            'ing-redline': IngRedline,
            'font-awesome-icon': FontAwesomeIcon,
            'execution-toolbar': ExecutionToolbar,
            'execution-status-dot': ExecutionStatusDot,
            'ing-editable': IngEditable,
            'ing-conversations': IngConversations,
            'view-state-buttons': ViewStateButtons,
            'ing-editable-froala': IngEditableWithFroala,
            'execution-step-error': ExecutionStepError,
            'execution-status': ExecutionStatus,
            'ing-modal': IngModal,
            'ing-tag-inline': IngTagInline
        },
        props: {
            stepData: {
                type: Object,
                required: true
            },
            elementMap: {
                type: Object,
                required: true
            }
        },
        computed: {
            ...mapGetters([
                "isPending",
                "execution",
                "currentStepId",
                "elementViewStateKey",
                "elementViewState",
                "executionInputKey",
                "executionRedlineInputKey",
                "elementKey",
                "executionMetaData",
                "executionMetaDataKey",
                "elementsByParent",
                "conversations",
                "anyFilter",
                "mode",
                "procedureDetails",
                "procedureTagsObj",
                "tag",
                "executionTags",
                "copyElemIdMap",
                "fetchOutlinePrecomputed",
                "elementIds",
                "isTestConductor",
                "canParticipate",
                "bulkRedlineElementIds",
                "elemDiffsShown",
                "canBulkRedlineElement",
                "replaceElementSource",
                "hasReplaceElementSource",
                "modStyle",
                "copyParams",
                "debugEnabled",
                "stepPaletteBuiltIn",
                "stepPaletteCustom",
            ]),
            isStepPending: function() {
                return this.execution.status === 'RUNNING' || this.execution.status === 'PAUSED';
            },
            showReplaceElementButton:   function() {
                return this.mode === 'authoring' ? true : false;
            },
            consistencyFlag: function() {
                return this.elementKey(this.stepData.elem_id, "consistency_flag");
            },
            showConsistencyFlag: function() {
                return this.consistencyFlag && this.consistencyFlag !== "CONSISTENT";
            },
            consistencyFlagLabel: function() {
                const labels = {
                    DELETED: "DELETED",
                    MISSING_IN_PALLETTE: "MISSING IN PALLETTE",
                    SPEC_HASH_MISMATCHED: "STEP MODIFIED",
                    LEGACY: "LEGACY",
                    CONSISTENT: ""
                };
                return labels[this.consistencyFlag] || this.consistencyFlag;
            },
            consistencyFlagClass: function() {
                return this.consistencyFlag === "LEGACY" ? "consistency-flag-warning" : "consistency-flag-error";
            },
            showAutoSelectCustomScriptButton: function() {
                if (this.elementKey(this.stepData.elem_id, "run_for_score") && !this.lockUnlockIcon) {
                    return false;
                }
                return this.consistencyFlag === "SPEC_HASH_MISMATCHED" && !this.elementKey(this.stepData.elem_id, "executed") && this.canParticipate;
            },
            consistencyFlagIconClass: function() {
                return this.consistencyFlag === "DELETED" ? "glyphicon glyphicon-trash consistency-flag-icon" : "glyphicon glyphicon-warning-sign consistency-flag-icon";
            },
            consistencyFlagTooltip: function() {
                const tooltips = {
                    DELETED: "This step references a custom script that has been deleted.",
                    MISSING_IN_PALLETTE: "This step references a custom script that is missing from the current palette.",
                    SPEC_HASH_MISMATCHED: "This step references a custom script whose specification has changed since it was selected.",
                    LEGACY: "This step references a legacy custom script. Please reselect it from the lookup modal."
                };
                return tooltips[this.consistencyFlag];
            },
            replaceElementButtonClass: function() {
                return this.hasReplaceElementSource ? 'replace-elem-active' : 'replace-elem-inactive';
            },
            isRedlineElementSelected: function() {
                return this.bulkRedlineElementIds.includes(this.stepData.elem_id);
            },
            isElementSelected: function() {
                if (this.copyParams && this.copyParams.copyElemIdMap) {
                    return this.copyParams.copyElemIdMap.hasOwnProperty(this.stepData.elem_id);
                } else {
                    return false;
                }  
            },
            checkApprovedRedlineForParticipant: function() {
                //Participant can not select approve redline
                if(!this.isTestConductor && this.canParticipate && this.showApprovalCheckmark) {
                    return false;
                } else {
                    return true;
                }
            },
            hasEntries: {
                get() {
                    const entries = this.executionInputKey(this.stepData.elem_id, "entries");
                    return entries && entries.length > 0;
                }
            },
            rootElements: function() {
                return this.elementsByParent('');
            },
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            childElements: function() {
                return this.elementsByParent(this.stepData.elem_id);
            },
            elementTitle: function() {
                return getElementDisplayName(this.stepData,this.stepPaletteBuiltIn, this.stepPaletteCustom);
            },
            elementTypeTitleStyle: function() {
                return this.stepData.elem_type === 'SECTION' ? 'section_title' : '';
            },
            elementCssClass: function() {
                let classes = [`step_${this.elementMap.category}`];
                if (this.enableExecution) {
                    if (this.currentStepId === this.stepData.elem_id) {
                        classes.push("active");
                    }
                }
                
                return classes.reduce((acVal, val) => {
                    return `${acVal} ${val}`;
                });
            },
            stepDescription: function() {
                return this.elementKey(this.stepData.elem_id, "description");
            },
            showStatusMessage: function() {
                if (this.stepData.elem_type === "STEP") {
                    return this.executionMetaDataKey(this.stepData.elem_id, "status") === 'RUNNING';
                } else {
                    return false;
                }
            },
            showErrorMessage: function() {
                if (this.stepData.elem_type === "STEP") {
                    const status = this.executionMetaDataKey(this.stepData.elem_id, "status");
                    const errorMessage = this.executionMetaDataKey(this.stepData.elem_id, "error.message");
                    if (status === 'ERROR') {
                        return true;
                    } else if (status === 'FAIL' && errorMessage) {
                        // Most steps do not set error.message when they fail.
                        // Custom script step sets error.message when it fails.
                        return true;
                    }
                }
                return false;
            },
            elementStatusMessage: function() {
                return this.executionMetaDataKey(this.stepData.elem_id, "status_message");
            },
            elementLevelDetail: function() {
                return this.elementViewStateKey(this.stepData.elem_id, "detailLevel");
            },
            isLoading: function() {
                return this.elementViewStateKey(this.stepData.elem_id, "loading");
            },
            showExecutionToolbar: function() {
                return this.mode !== 'authoring' && this.mode !== 'as-run' && this.elementMap.category === "executable" && this.isTestConductor;
            },
            elementColor: function() {
                if (this.elementMap.category === 'organization') {
                    return "#31708f";
                } else if (this.elementMap.category === 'non_executable') {
                    return "#8a6d3b";
                } else {
                    return "#3c763d";
                }
            },
            lockUnlockIcon: function() {
                const status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                const approval_status = this.executionRedlineInputKey(this.stepData.elem_id, "approval.status") === "APPROVED";

                switch(status) {
                    case "MODIFYING":
                    case "ADDED":
                        if(approval_status)
                            return false;
                        else
                            return true;
                    case "NONE":
                        return true;
                    case "ORIGINAL":
                    case "MODIFIED":
                    case "MODIFYING_OLD":
                    case "DELETED":
                        return false;
                }
            },
            showModify: function() {
                const elementType = this.stepData.elem_type;
                const status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");

                if(elementType == "PROCEDURE_SECTION" && status == "ORIGINAL" && this.stepData.imported)
                    return false;

                switch(status) {
                    case "NONE":
                    case "MODIFYING_OLD":
                    case "ADDED":
                    case "DELETED":
                        return false;
                    case "ORIGINAL":
                    case "MODIFIED":
                        return true;
                }
            },
            showRedlineDiffToggle: function() {
                const status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                switch(status) {
                    case "NONE":
                    case "ORIGINAL":
                    case "DELETED":
                    case "ADDED":
                    case "MODIFIED":
                        return false;
                    case "MODIFYING":
                    case "MODIFYING_OLD":
                        return true;
                }
            },
            showRedBlue: function() {
                const status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                switch(status) {
                    case "NONE":
                    case "ORIGINAL":
                    case "MODIFIED":
                        return false;
                    case "MODIFYING":
                    case "MODIFYING_OLD":
                    case "DELETED":
                    case "ADDED":
                        return true;
                }
            },
            showRedlineBulkSelection: function() {
                //if there is multiple modificaiton of redline then only allow selection of the final redline step.
                const status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                switch(status) {
                    case "NONE":
                    case "ORIGINAL":
                    case "MODIFIED":
                    case "MODIFYING_OLD":
                        return false;
                    case "MODIFYING":
                    case "DELETED":
                    case "ADDED":
                        if (!this.canBulkRedlineElement(this.stepData.elem_id)) {
                            return false;
                        }
                        if (this.stepData.executed && this.stepData.executable === 'EXECUTED') {
                            return false;
                        }
                        if (this.stepData.elem_type === 'PROCEDURE_SECTION' && this.stepData.imported) {
                            return false;
                        }
                        return true;
                }
            },
            showApprovalCheckmark: function() {
                return this.executionRedlineInputKey(this.stepData.elem_id, "approval.status") === "APPROVED";
            },
            redBlueLineClass: function() {
                return this.executionRedlineInputKey(this.stepData.elem_id, "justification.modification_type") === "REDLINE" ? "redline" : "blueline";
            },
            redBlueLine: function() {
                return this.executionRedlineInputKey(this.stepData.elem_id, "justification.modification_type") === "REDLINE" ? "Redline" : "Blueline";
            },
            isElementSection: function() {
                return this.stepData.elem_type == "SECTION" || this.stepData.elem_type == "PROCEDURE_SECTION";
            },
            redlinedProcedureSection: function() {
                return this.stepData.elem_type == "PROCEDURE_SECTION" && this.stepData.procedure_modification_status != "NONE";
            },
            deletedTitle: function() {
                if (this.stepData.procedure_modification_status) {
                    return this.stepData.procedure_modification_status === "DELETED";
                }
            },
            clearForExecution: function() {
                const status = this.elementKey(this.stepData.elem_id, "procedure_modification_status");
                const approval_status = this.executionRedlineInputKey(this.stepData.elem_id, "approval.status") === "APPROVED";
                switch(status) {
                    case "NONE":
                    case "ORIGINAL":
                        return true;
                    case "MODIFYING":
                    case "ADDED":
                        return approval_status;
                    case "MODIFIED":
                    case "MODIFYING_OLD":
                    case "DELETED":
                        return false;
                }
            },
            //Hacky workaround to get consistent spacing for steps that do not have entry elements steps without entry elements hardcoded here.
            noEntryElement: function() {
                const noEntryElement = ['QUERY_EVR', 'WAIT', 'MANUAL_VERIFICATION', 'ENVIRONMENT_MANUAL', 'VENUE_CONFIG_MANUAL'];
                for (let i = 0; i < noEntryElement.length; i++) {
                    if (noEntryElement[i] === this.stepData.step_type) {
                        return true;
                    }
                }
                return false;
            },
            breakpointClass: function() {
                return this.stepData.break_point && this.stepData.break_point === "ACTIVE" ? "step_breakpoint active_breakpoint" : "step_breakpoint";
            },
            procedureInfo: function() {
                // procedureDetails is available only for elements of procedure.
                // procedure_id may be defined for imported element.
                // need to check both execution_id and procedure_id
                if (!this.stepData.execution_id && this.stepData.procedure_id)
                    return this.procedureDetails;
                return {};
            },
            showPasteInProcedure: function() {
                if(this.mode == 'authoring') {
                    let a = this.$route.path.split("/");
                    return a[a.length - 2] == 0;
                }

                return true;
            },
            tooltipTimestampStarted: function() {
                return commonTimestampWithTimezone(this.executionMetaDataKey(this.stepData.elem_id, 'time_started'));
            },
            tooltipTimestampCompleted: function() {
                return commonTimestampWithTimezone(this.executionMetaDataKey(this.stepData.elem_id, 'time_completed'));
            },
            numConversations: function() {
                const conversations = this.conversations(this.stepData.elem_id);
                return conversations ? Object.keys(conversations).length : 0;
            },
            numUnresolvedConversations: function() {
                const conversations = this.conversations(this.stepData.elem_id);
                return conversations ? Object.values(conversations).filter((conversation) => conversation.status === 'UNRESOLVED').length : 0;
            },
            commentResolvedStatusClass: function() {
                return this.numConversations === 0 ? '' : (this.numUnresolvedConversations > 0 ? 'comment-resolved-not-all' : 'comment-resolved-all');
            },
            commentNumberClass: function() {
                return this.numConversations >= 10 ? 'comment-number2' : 'comment-number';
            },
            shouldShowComments: function() {
                return this.stepData.execution_id || (this.procedureInfo && (this.procedureInfo.status != 'WORKING'));
            },
            disableCursor: function() {
                // is element actions are disabled, the hand cursor icon will be removed, else hand cursor appears
                return this.canMoveElement ? "cursor:pointer;" : "cursor:auto;";
            },
            disableDragElement: function() {
                // disable drag element for move if filters are active
                return (!this.canMoveElement) || this.anyFilter;
            },
            currentStepIndicator: function() {
                if(this.execution)
                    return this.execution.current_step_id === this.stepData.elem_id ? "position: relative; border: 4px solid #ffd700; border-radius: 8px;" : "position: relative;";
                return "position: relative;";
            },
            availableTags: function() {
                if(this.procedureDetails && this.procedureDetails.tags) {
                    const defaultTag = {
                        tag_id: -1,
                        name: "Add tag...",
                        description: ""
                    };
                    // return this.procedureDetails.tags.unshift() || [];
                    return [defaultTag, ...this.procedureDetails.tags];
                }

                return [];
            },
            tags: function() {
                const elemTags = [];
                if (this.stepData.execution_id) {
                    // element in execution
                    if (this.stepData.tag_ids && this.executionTags) {
                        for (const tag_id of this.stepData.tag_ids) {
                            if (this.executionTags.hasOwnProperty(tag_id)) {
                                elemTags.push(this.executionTags[tag_id]);
                            } else {
                                console.warn(`tag info was not found. elem_id: ${this.stepData.elem_id} tag_id: ${tag_id}`);
                            }
                        }
                    }
                } else {
                    // element in authoring
                    if (this.stepData.tag_ids && this.procedureDetails && this.procedureDetails.tags) {
                        for (const tag_id of this.stepData.tag_ids) {
                            if (this.procedureTagsObj.hasOwnProperty(tag_id)) {
                                elemTags.push(this.procedureTagsObj[tag_id]);
                            } else {
                                console.warn(`tag info was not found. elem_id: ${this.stepData.elem_id} tag_id: ${tag_id}`);
                            }
                        }
                    }
                }

                return elemTags;
            },
            showDataEntryIcon: function() {
                return this.hasEntries;
            },
            redlineIconClasses: function() {
                return this.isRedlineElementSelected ? 'elem-selected' : '';
            },            
            toggleDiffsLabel: function() {
                return this.elemDiffsShown(this.stepData.elem_id) ? 'Diffs On' : 'Diffs Off';
            },
            toggleDiffsClass: function() {
                return this.elemDiffsShown(this.stepData.elem_id) ? 'diffs-active' : 'diffs-inactive';
            },
            componentKey: function() {
                // Generate unique key to force component re-render when element data changes
                // Include spec_hash and consistency_flag to trigger updates
                const specHash = this.executionInputKey(this.stepData.elem_id, 'spec_hash') || '';
                const consistencyFlag = this.consistencyFlag || '';
                return `${this.stepData.elem_id}-${specHash}-${consistencyFlag}`;
            }
        },
        methods: {
            ...mapActions([
                "setPending",
                "toggleAllEntryViewState",
                "updateElement",
                "saveElementInput",
                "setElementViewStateDetailLevel",
                "modifyElement",
                "addProcedureElementTag",
                "removeProcedureElementTag",
                "addCutElemId",
                "addCopyElemId",
                "removeCopyElemId",
                "removeCutElemId",
                "addElemIdRange",
                "addCutElemIdRange",
                "removeCutElemIdRange",
                "setCopyParams",
                "resetElementSelections",
                "resetCutParams",
                "saveBulkRedlineElementIds",
                "toggleRedlineDiffElement",
                "loadReplaceElementSource",
                "replaceElement",
                "hasSelectedElements",
                "hasSelectedElementsForThis",
                "fetchStepPaletteBuiltIn",
                "fetchStepPaletteCustom",
            ]),
            printStepContents: function() {
                const stepData = _.cloneDeep(this.stepData);
                let numPreviousRuns = 0;
                if (stepData.run_records) {
                    numPreviousRuns = stepData.run_records.length;
                    for (const [i, run_record] of stepData.run_records.entries()) {
                        delete run_record.specification;
                        console.log(`Number: ${run_record.number} Previous run ${i+1}`);
                        console.log(JSON.stringify(run_record, null, 2));
                    }
                }
                console.log(`Number: ${stepData.number} numPreviousRuns: ${numPreviousRuns}`);
                delete stepData.specification;
                delete stepData.run_records;
                console.log(JSON.stringify(stepData, null, 2));
            },
            autoSelectCustomScript: async function() {
                if (this.$refs.elementComponent && this.$refs.elementComponent.autoSelectCustomScript) {
                    this.setPending(true);
                    await this.$refs.elementComponent.autoSelectCustomScript();
                    this.setPending(false);
                }
            },
            handleRedlineStepSelection: function() {
                if(this.isRedlineElementSelected) {
                    let filteredElements = this.bulkRedlineElementIds.filter(item => item !== this.stepData.elem_id);
                    this.saveBulkRedlineElementIds(filteredElements);
                } else {
                    let redlineElementIds = [...this.bulkRedlineElementIds, this.stepData.elem_id];
                    this.saveBulkRedlineElementIds([...new Set(redlineElementIds)]);
                }
            },
            handleRemoveElement: async function(now) {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);

                if (now) {
                    this.confirmRemoveElement = false;
                    await this.removeElementCallback();
                } else {
                    if (['SECTION', 'PROCEDURE_SECTION'].includes(this.stepData.elem_type)) {
                        this.confirmRemoveElement = true;
                    } else {
                        await this.removeElementCallback();
                    }
                }
                this.setPending(false);
            },
            disableTitleDragDrop: function(status) {
                // When edit title for step is active then disable dragdrop.
                // We need this work around because v-drag-and-drop is not reactive.
                if(status) {
                    this.$nextTick(() => this.$refs.dragDropArea.setAttribute('draggable', false));
                } else {
                    this.$nextTick(() => this.$refs.dragDropArea.setAttribute('draggable', true));
                }
            },
            getExecutionMetaDataKey: function(keyString) {
                if (this.stepData.execution.meta_data) {
                    return this.stepData.execution.meta_data[keyString];
                }
            },
            toggleComments: function(event) {
                this.showComments = !this.showComments;

                if (this.showComments) {
                    let conversationElemId = `conversation-${this.stepData.elem_id}`;
                    let el = document.getElementById(conversationElemId);
                    if (el) {
                        let box = el.getBoundingClientRect();
                        let inView = box.top < window.innerHeight && box.bottom >= 0;
                        // if conversations are not visible, scroll down to show the conversation
                        // at the click location.
                        if (!inView) {
                            let scrollY = box.bottom - event.y;
                            window.scrollBy({
                                top: scrollY,
                                left: 0,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        console.warn(`conversation element was not found: ${conversationElemId}`);
                    }
                }
            },
            updateTitle: function(value){
                this.updateElement({
                    elementPath: this.elementMap.path,
                    elementId: this.stepData.elem_id,
                    element: {
                        'title': value
                    }
                });
            },
            updateDescription: function(value) {
                this.updateElement({
                    elementPath: this.elementMap.path,
                    elementId: this.stepData.elem_id,
                    element: {
                        'description': value
                    }
                });
            },
            setBreakpoint: function() {
                this.updateElement({
                    elementPath: this.elementMap.path,
                    elementId: this.stepData.elem_id,
                    element: {
                        'break_point': this.stepData.break_point == 'NONE' ? 'ACTIVE' : 'NONE'
                    }
                });
            },
            setTableEntry: function() {
                this.$emit('tableEntry', {
                    elementId: this.stepData.elem_id
                });
            },
            setViewState: function(detailLevel) {
                this.setElementViewStateDetailLevel({
                    elementId: this.stepData.elem_id,
                    detailLevel: detailLevel
                });
            },
            toggleRedlineDiff: function() {
                this.toggleRedlineDiffElement({modifyingElementId: this.stepData.elem_id});
            },
            toggleRedBlue: function() {
                this.showRedBlueline = !this.showRedBlueline;
            },
            handleModify: async function() {
                // prevent double click
                if (this.lockModifyButton) {
                    return;
                }
                this.lockModifyButton = true;
                // modifyElement handles exceptions internally. No try/catch is needed.
                await this.modifyElement({
                    elementId: this.stepData.elem_id
                });
                this.lockModifyButton = false;
            },
            handleToggleSelectedElement: async function(event, data) {
                // reset element selections if it doenst match current exec or proc id
                if (this.hasSelectedElements && !this.hasSelectedElementsForThis) {
                    this.resetElementSelections();
                }
                
                if (event.shiftKey) {
                    if (!this.isElementSelected) {
                        // select
                        this.addElemIdRange({ elementId: this.stepData.elem_id });
                    } else {
                        // unselect
                        this.removeCopyElemId({ elementId: this.stepData.elem_id });
                    }
                } else if (event.ctrlKey || event.metaKey) { // CONTROL + CLICK (Windows) or COMMAND + CLICK (Mac)
                    if (!this.isElementSelected) {
                        // select
                        this.addCopyElemId({ elementId: this.stepData.elem_id });
                    } else {
                        // unselect
                        this.removeCopyElemId({ elementId: this.stepData.elem_id });
                    }
                } else {
                    if (!this.isElementSelected) {
                        this.resetElementSelections();
                        // select
                        this.addCopyElemId({ elementId: this.stepData.elem_id });
                    } else {
                        // unselect all
                        this.resetElementSelections();
                    }
                }

                const copyParams = {
                    copyElemIdMap: this.copyElemIdMap,
                    execution_id: this.executionId ? this.executionId : undefined,
                    procedure_id: this.procedureId ? this.procedureId : undefined,
                    procedure_version: this.procedureId ? this.procedureInfo.version : undefined,
                };

                this.setCopyParams({copyParams});
            },
            handleDataEntryEvent: function(event) {
                // save and close modal
                if (event.type == 'showModal') {
                    if (event.save === true) {
                        this.saveElementInput({
                            elementPath: this.elementMap.path,
                            elementId: this.stepData.elem_id
                        });
                    }
                    this.showTableEntry = event.val;
                }
            },
            handleAddTag: async function(event) {
                const tagId = event.target.value;
                if(tagId != -1 ) {
                    await this.addProcedureElementTag({
                        procedureId: this.procedureDetails.procedure_id,
                        elementId: this.stepData.elem_id,
                        tagId
                    });
                }
            },
            handleDeleteTag: async function(tag) {
                if(tag.tag_id != -1 ) {
                    await this.removeProcedureElementTag({
                        procedureId: this.procedureDetails.procedure_id,
                        elementId: this.stepData.elem_id,
                        tagId: tag.tag_id  
                    });
                }
            },
            onMouseEnter: function() {
                this.loadReplaceElementSource();
            },
            onReplaceElement: function() {
                if (this.hasReplaceElementSource) {
                    this.replaceElement({
                        elementId: this.stepData.elem_id,
                        replaceElementPayload: this.replaceElementSource
                    });
                }
            },
        },
        filters: {
            doyTimestamp,
            titlecase
        }
    };
</script>

<style lang="scss" scoped>
    .header {
        display: flex;
        align-items: flex-start;
    }
    
    .step_title {
        padding-left: 10px;
    }
    
    .section_title {
        font-size: 20px !important;
        font-weight: bold !important;
    }
    
    .step_execution_details {
        padding-left: 0px;
        margin-left: 0px;
    }

    .step-draggable-area:hover {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
    }

    .step-draggable-area:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }

    li.step_organization > div.step-draggable-area {
        margin: 10px 10px 0px 10px;
    }

    .step_description {
        padding-top:5px;
    }

    .step_type_text {
        font-weight:bold;
    }

    span.step_type_text.step_organization {
        color:#31708f;
    }

    span.step_type_text.step_executable {
        color:#3c763d;
    }

    span.step_type_text.step_non_executable {
        color:#8a6d3b;
    }

    li.step_organization > div.step-draggable-area + div.step_description {
        margin-left: 10px;
    }

    a.anchor {
        display: block;
        position: relative;
        top: -70px;
        visibility: hidden;
    }
    .no-dnd-events {
        pointer-events : none;
    }

    .procedure-modification-status{
        margin-top:10px;
    }

    .replace-elem-active {
        cursor: default;
    }
    .replace-elem-active:hover {
        cursor: pointer;
        border: solid 2px red;
    }

    .replace-elem-inactive {
        cursor: default;
    }

    .diffs-active {
        border:1px solid olive;
        background-color:yellow;
        color:olive;
    }

    .diffs-inactive {
        border:1px solid gray;
        background-color: gainsboro;
        color:gray;
    }

    .redline-blueline-indicator{
        font-weight:bold;
        padding:3px 5px;
        margin-top:5px;
        margin-bottom:5px;
        border-radius:3px;
    }

    .approve-checkmark{
        color:#A3DE5F;
        margin-top:10px;
        padding-right:5px;
    }

    .redline-edit{
        font-weight:bold;
        padding:3px 5px;
        margin-top:5px;
        border-radius:3px;
        border:1px solid gray;
        color:gray;
    }

    .redline-diff{
        font-weight:bold;
        padding:3px 5px;
        margin-top:5px;
        margin-bottom:5px;
        border-radius:3px;
    }

    .redline-modify{
        font-weight:bold;
        padding:3px 5px;
        margin-top:5px;
        margin-bottom:5px;
        border-radius:3px;
        border:1px solid gray;
        color:gray;
        background-color: gainsboro;
    }

    .procedure-modification-status-debugger{
        color:black;
        background-color:lightyellow;
        border:1px dashed black;
        border-radius:3px;
        padding:3px 5px;
        margin-top:5px;
        font-weight:bold;
    }

    .procedure-title {
        font-size:12px;
    }

    .procedure-title-non-icon {
        font-size: 12px;
        margin-left: 10px;
    }

    .deleted-title {
        border-bottom:2px dashed gray;
        color:gray;
        font-weight:bold;
        margin-bottom:-15px;
        text-align:center;
    }

    //some pure hackery to account for consistent spacing
    .no-entry-element-additional-margin {
        margin-top: 15px;
    }

    .comments-container-step_organization {
        padding: 0px 10px 10px 10px;
    }

    .active_breakpoint {
        color:red;
    }

    // button already has opacity of 0.5.
    // Use a lower opacity explicitly for disabled button.
    button:disabled {
        opacity: 0.1 !important;
    }

    div.copy {
        margin: -40px 0 11px 0;
        border-bottom: 2px dotted #3c763d;
        position: relative;
        bottom: 15px;
        width: 100%;
        display: none;
    }

    .elem-selected {
        border: 2px solid red !important;
        border-radius: 5px;
        box-shadow: 0px 0px 5px red;
    }
    


    .selected-element {
        color: fuchsia;
    }

    .comment-resolved-all {
        color: green;
    }

    .comment-resolved-not-all {
        color: red;
    }

    .step-icons {
        display: flex;
        align-items: center;
        margin-left: auto;
    }

    .consistency-flag-pill {
        border-radius: 999px;
        font-size: 11px;
        font-weight: bold;
        line-height: 1;
        margin-right: 6px;
        padding: 4px 8px;
        white-space: nowrap;
    }

    .consistency-flag-icon {
        margin-right: 4px;
    }

    .consistency-flag-error {
        background-color: #d9534f;
        color: #fff;
    }

    .consistency-flag-warning {
        background-color: #f0ad4e;
        color: #fff;
    }

    .step-button {
        background: none;
        border: none;
        font-size: 16px;
        padding-inline: 4px;
        opacity: 0.7; 
    }
</style>

