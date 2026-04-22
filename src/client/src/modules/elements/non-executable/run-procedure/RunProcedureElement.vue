// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <div>
        <form>
            <div v-if="!isAuthoring" class="row">
                <div class="col-xs-6" style="text-align: right; font-weight: bold; padding-top:15px; padding-right:5px">{{childExecutionId ? 'Execution:' : ''}}</div>
                <div class="col-xs-3" style="font-weight: bold; padding-top:15px; padding-left:0px">
                    <a :href="callProcedureChildExecutionUrl">
                        {{childExecutionId ? childExecutionId : ''}}
                    </a>
                </div>
                <div  class="col-xs-3" style="padding-left:0px">
                    <button 
                        v-if="showSuspendResume" 
                        type="button" 
                        :disabled="disableSuspendResume" 
                        class="btn btn-default" 
                        style="font-weight:bold; width:100px" 
                        @click="showSuspendResumeConfirmation = true">
                        Resume
                    </button>
                </div>
            </div>
            <div v-if="isLevelTwoDetail" class="container-element">
                <div @dblclick="toggleViewLevelTwoThree" style="border-bottom: 1px solid #D8D6D6;">
                    <div class="row data-bar-element condensed">
                        <div class="col-xs-4" :class="modStyle(elementId, 'reference_procedure_id')">
                            {{ referenceProcedureId ? referenceProcedureId : '&lt;Procedure ID&gt;' }}
                            <!-- AUTHORING -->
                            <a :href="`/authoring/${referenceProcedureId}/${referenceProcedureVersion}/?run_procedure_element_id=${elementId}&procedure_id=${referenceProcedureId}&version=${referenceProcedureVersion}`" 
                                v-if="isAuthoring && referenceProcedureId !== '' && referenceProcedureVersion !== ''"
                                target="_blank"
                                id="previewImportButton">
                                <span class="glyphicon glyphicon-eye-open"></span> Preview Import
                            </a>

                            <!-- EXECUTION -->
                            <a :href="`/authoring/${referenceProcedureId}/${referenceProcedureVersion}/?run_procedure_element_id=${elementId}&procedure_id=${referenceProcedureId}&version=${referenceProcedureVersion}&execution_id=${this.executionId}`" 
                                v-if="!isAuthoring && referenceProcedureId !== '' && referenceProcedureVersion !== ''"
                                target="_blank"
                                id="previewImportButton">
                                <span class="glyphicon glyphicon-eye-open"></span> Preview Import
                            </a>
                        </div>
                        <div class="col-xs-4" :class="modStyle(elementId, 'reference_procedure_title')">{{ referenceProcedureTitle ? referenceProcedureTitle : '&lt;Procedure Title&gt;' }}</div>
                        <div class="col-xs-1" :class="modStyle(elementId, 'reference_procedure_version')">{{ referenceProcedureVersion >= 0 ? referenceProcedureVersion : "&lt;Procedure Version&gt;" }}</div>
                        <div class="col-xs-3">Create execution: <span :class="modStyle(elementId, 'callable')">{{callable}}</span></div>
                    </div>
                    <div v-if="unreleasedProcedureForR4R" class="row">
                        <div class="r4r-warning">
                        Warning: The selected procedure version has not been released. 
                        For Run for Record execution, released procedures shall be used in compliance with JPL rules (Reference DocID 78645). 
                        For testbed, standard operating procedures such as power on/off procedure may be exceptions.
                        </div>
                    </div>
                </div>
                <div v-if="isLevelThreeDetail" class="edit-container">
                    <div class="row">
                        <div class="col-xs-4 form-group">
                            <label title="Procedure title." style="display: inline-block;"> Procedure</label>
                            <button :disabled="disableProcedureLookup" @click="showProcedureModal = true" type="button" class="btn btn-xs btn-info pull-right procedure-lookup">
                                <span class="glyphicon glyphicon-search"></span> Lookup
                            </button>
                            <input name="reference_procedure_title" 
                                :value="referenceProcedureTitle" 
                                disabled="disabled" 
                                type="text" 
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'reference_procedure_title')"
                            >
                            <div class="procedure_cm_container title" style="min-height: 200px; overflow: hidden;">
                                <div v-if="procedureNotFound" class="bold-red-text">
                                    Procedure does not exist. You may need to select another procedure.
                                </div>
                                <div v-else class="procedure_section_form procedure_config_management">
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Title</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.title }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Author</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.author }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Proc. ID</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.procedure_id }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>JPL ID</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.institutional_id }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Cur. Ver.</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.current_version }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Created</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.time_created | commonDateTime }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Procedure Last Edited</strong></div>
                                        <div class="col-sm-8">{{ procedureDetails.time_saved | commonDateTime }}</div>
                                    </div>
                                    <div class="row" style="margin-top: 10px;">
                                        <div class="col-sm-12">
                                            <strong class="description">Description</strong>
                                        </div>
                                        <div class="col-sm-12">
                                            <p>{{ procedureDetails.description }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xs-4 form-group">
                            <label title="Procedure version." style="display: inline-block;"> Version</label>
                            <button :disabled="disableVersionsLookup" @click="showVersionModal = true" type="button" class="btn btn-xs btn-info pull-right version-lookup">
                                <span class="glyphicon glyphicon-search"></span> Lookup
                            </button>
                            <input name="reference_procedure_version" 
                                :value="referenceProcedureVersionDisplay" 
                                disabled="disabled" 
                                type="text" 
                                class="form-control execution-input"
                                :class="modStyle(elementId, 'reference_procedure_version')"
                            >
                            <div v-if="versionNotFound" class="bold-red-text">
                                Procedure version does not exist. You may need to select another version.
                            </div>
                            <div v-else
                                class="procedure_cm_container version" style="max-height: 200px; overflow: hidden; margin-bottom: 10px;">
                                <div class="procedure_config_management">
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Author</strong></div>
                                        <div class="col-sm-8">{{ versionDetails.version_author }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Proc. ID</strong></div>
                                        <div class="col-sm-8">{{ versionDetails.procedure_id }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Revision ID</strong></div>
                                        <div class="col-sm-8">{{ versionDetails.institutional_release_id }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Ver.</strong></div>
                                        <div class="col-sm-8">{{ versionDetails.version }}</div>
                                    </div>
                                    <div class="row">
                                        <div class="col-sm-4"><strong>Version Created</strong></div>
                                        <div class="col-sm-8">{{ versionDetails.time_versioned | commonDateTime }}</div>
                                    </div>
                                    <div class="row cm_description">
                                        <div class="col-sm-12">
                                            <strong>Description</strong>
                                            <p>{{ versionDetails.version_description }}</p>
                                        </div>
                                    </div>
                                    <div style="margin-top: 10px;"></div>
                                </div>
                            </div>
                            <tags-selected :tags="selectedTags">
                            </tags-selected>
                        </div>
                        <div class="col-xs-4 form-group">
                            <label title="Choose steps." style="display: inline-block;"> Sections</label>
                            <button :disabled="disableSectionsChooser" @click="showSectionChooserModal = true;" type="button" class="btn btn-xs btn-info pull-right choose-steps">
                                <span class="glyphicon glyphicon-ok"></span> Choose
                            </button>
                            <div class="procedure_cm_container choose-steps-container" style="clear: right;">
                                <div class="procedure_config_management choose-steps" 
                                    :class="modStyle(elementId, 'elements')" 
                                    style="min-height: 250px; max-height: 250px; overflow-y: scroll;"
                                >
                                    <template v-for="selectedElement in selectedElements">
                                        <selected-elements-outline
                                            v-if="selectedElement.selected"
                                            :key="selectedElement.elem_id"
                                            :element-id="selectedElement.elem_id"
                                            :title="selectedElement.title"
                                            :tags="versionDetails.tags"
                                            :tag_ids="selectedElement.tag_ids"
                                            :run-procedure-element-id="elementId"
                                            :number="selectedElement.number">
                                        </selected-elements-outline>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div v-if="!isAuthoring" class="col-xs-7" style="height: 34px;">
                            <div class="run-for-score">
                                <input type="checkbox" :disabled="disableRunForScore" :checked="isRunForScore" @change="toggleRunForScore">
                                <label>Run For Record</label>
                            </div>
                        </div>
                        <div class="col-xs-3" style="text-align: right;" :style="{marginLeft: isAuthoring ? '55%' :'' }">
                            <div class="create-execution" :class="modStyle(elementId, 'callable')">
                                <input 
                                    type="checkbox" 
                                    :disabled="disableCreateExecution" 
                                    :checked="callable" 
                                    @change="toggleCallProcedure"
                                >
                                <label>Create Execution</label>
                            </div>
                        </div>
                        <div v-if="!isAuthoring" class="col-xs-2" style="text-align: right;">
                            <button :disabled="disableImport" @click.stop.prevent="onImportProcedure" class="btn btn-primary" id="importProcedureButton">Import</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <ing-modal v-if="showProcedureModal" @close="showProcedureModal = false" size="large" overflow-y="visible">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Select Procedure</h4>
            </template>
            <template slot="body">
                <select-procedure-table v-on:setProcedure="setProcedure"></select-procedure-table>
            </template>
            <template slot="footer">
                <div></div>
            </template>
        </ing-modal>
        <ing-modal v-if="showVersionModal" @close="showVersionModal = false" size="large" overflow-y="visible">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Select Version</h4>
            </template>
            <template slot="body">
                <select-version-table v-on:setVersion="setVersion" :procedureId="referenceProcedureId">
                </select-version-table>
            </template>
            <template slot="footer">
                <div></div>
            </template>
        </ing-modal>
        <ing-modal v-if="showSectionChooserModal" @close="showSectionChooserModal = false" size="large">
            <template slot="title">
                <h4 class="modal-title"><span class="glyphicon glyphicon-search"></span> Choose Steps</h4>
            </template>
            <template slot="body">
                <select-procedure-sections
                    :element-id="elementId"
                    v-on:selectTag="handleSelectTag"
                    :run-procedure-element-id="referenceProcedureId"
                    :show="mode == 'authoring' || mode == 'execution' || mode == 'as-run'">
                </select-procedure-sections>
            </template>
            <template slot="footer">
                <div>
                    <button type="button" class="btn btn-default pull-left" @click="handleCancel">Cancel</button>
                    <button @click="setSteps" id="persistOutlineSelectionsButton" class="btn btn-primary">Done</button>
                </div>
            </template>
        </ing-modal>
        <ing-modal v-if="showSuspendResumeConfirmation" @close="showSuspendResumeConfirmation = false" size="small">
            <template slot="title">
                <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                        <span class="glyphicon glyphicon-cog"></span>
                        Confirm Resume?
                    </h4>
            </template>
            <template slot="body">
                <p>Are you sure you want to resume?</p>
                <p>This will suspend the current execution and resume the child execution <b>{{childExecutionId ? childExecutionId : ''}}</b> 
                    in the <b>{{venueName}}</b>
                </p>
            </template>
            <template slot="footer">
                <div>
                    <button type="button" class="btn btn-default pull-left" @click="showSuspendResumeConfirmation = false">Cancel</button>
                    <button class="btn btn-primary" @click="onResumeChildExecution">Confirm</button>
                </div>
            </template>
        </ing-modal>
    </div>
</template>

<script>
    import SelectProcedureTable from "./SelectProcedureTable.vue";
    import SelectVersionTable from "./SelectVersionTable.vue";
    import SelectProcedureSections from "./SelectProcedureSections.vue";
    import SelectedElementsOutline from "./SelectedElementsOutline.vue";
    import { mapActions, mapGetters } from "vuex";
    import procedureApi from "../../../../api/procedures";
    import { commonDateTime } from "../../../common/filters.js";
    import SwitchSlider from "../../../common/SwitchSlider.vue";
    import TagsSelected from './TagsSelected.vue';

    export default {
        name: "RunProcedureElement",
        components: {
            SelectProcedureTable,
            SelectVersionTable,
            SelectProcedureSections,
            SelectedElementsOutline,
            'switch-slider': SwitchSlider,
            'tags-selected': TagsSelected
        },
        data() {
            return {
                showProcedureModal: false,
                showVersionModal: false,
                showSectionChooserModal: false,
                procedureDetails: {},
                versionDetails: {},
                showSuspendResumeConfirmation: false
            };
        },
        computed: {
            ...mapGetters([
                "selectedElementsByParent",
                "elementsByParent",
                "parentsByChild",
                "executionInputKey",
                "executionInput",
                "elementKey",
                "selectedStepIds",
                "element",
                "runProcedureTagSelections",
                "procedureTagSelections",
                "reloadProcedureOutline",
                "venue",
                "isTestConductor",
                "execution",
                "updatingElementInput",
                "modStyle",
                "executionId"
            ]),
            procedureNotFound: function() {
                return (this.referenceProcedureId && this.procedureDetails.error) ? true : false;
            },
            versionNotFound: function() {
                return (!this.procedureNotFound && this.referenceProcedureVersion && this.versionDetails.error) ? true : false;
            },
            unreleasedProcedureForR4R: function() {
                return this.isRunForScore && this.versionDetails && this.versionDetails.status && this.versionDetails.status !== 'RELEASED';
            },
            tagSelections: function() {
                return this.runProcedureTagSelections(this.elementId);  
            },
            initTagSelections: function() {
                let initTagSelections = null;
                if (this.versionDetails && this.versionDetails.tags) {
                    // Get selection status from procedure version info
                    initTagSelections = this.versionDetails.tags.map(tag => {
                        return {...tag, selected: false};
                    });
                } else {
                    initTagSelections = [];
                }        

                return initTagSelections;        
            },
            selectedTags: function() {
                if (this.tagSelections) {
                    return this.tagSelections.filter(tagSelection => tagSelection.selected);
                } else {
                    return [];
                }
            },
            referenceProcedureId: {
                get() {
                    const rpi = this.getExecutionInputKey("reference_procedure_id");
                    return rpi !== undefined ? rpi : "";
                },
                set(value) { this.setElementInput("reference_procedure_id", value); }
            },
            referenceProcedureVersion: {
                get() {
                    return this.executionInputKey(this.elementId, "reference_procedure_version") == -1 ? 0 : this.executionInputKey(this.elementId, "reference_procedure_version");
                },
                set(value) { this.setElementInput("reference_procedure_version", value); }
            },
            referenceProcedureVersionDescription: {
                get() {
                    const value = this.getExecutionInputKey("reference_procedure_version_description");
                    return value !== undefined ? value : "";                                        
                },
                set(value) {
                    this.setElementInput("reference_procedure_version_description", value); 
                }
            },            
            referenceProcedureVersionDisplay: function() {
                return this.executionInputKey(this.elementId, "reference_procedure_version") == -1 ? 0 : this.executionInputKey(this.elementId, "reference_procedure_version");
            },
            referenceProcedureTitle: {
                get() {
                    const rpt = this.getExecutionInputKey("reference_procedure_title");
                    return rpt !== undefined ? rpt : "";
                },
                set(value) { this.setElementInput("reference_procedure_title", value); }
            },
            referenceProcedureInstitutionalId: {
                get() {
                    const value = this.getExecutionInputKey("reference_procedure_institutional_id");
                    return value !== undefined ? value : "";
                },
                set(value) { this.setElementInput("reference_procedure_institutional_id", value); }
            },
            referenceProcedureInstitutionalReleaseId: {
                get() {
                    const value = this.getExecutionInputKey("reference_procedure_institutional_release_id");
                    return value !== undefined ? value : "";
                },
                set(value) {
                    this.setElementInput("reference_procedure_institutional_release_id", value); 
                }
            },            
            isRunForScore: {
                get() { return this.getExecutionInputKey("run_for_score"); },
                set(value) { this.setElementInput("run_for_score", value); }
            },
            childExecutionId: function() {
                return this.getElementKey('child_execution_id');
            },
            callable: {
                get() { return this.getExecutionInputKey("callable") === true; },
                set(value) { this.setElementInput("callable", value); }
            },
            getExecutionStatus: function() {
                return this.execution ? this.execution.status : '';
            },
            disableRunForScore: function() {
                return this.disableFields || 
                    this.getElementKey('run_for_score') ||   // if this is R4R, child procedures will be R4R
                    this.mode === 'as-run' ||
                    this.getElementKey('imported') ||
                    this.getElementKey('executed') ||
                    this.elementsByParent(this.elementId).length > 0 ||
                    this.isParentRPExecuted(this.elementId);
            },
            disableCreateExecution: function() {
                return this.disableFields || 
                    this.mode === 'as-run' ||
                    this.getElementKey('imported');
            },
            selectedElements: function() {
                if(this.referenceProcedureId) {
                    return this.selectedElementsByParent({
                        elementId: this.elementId,
                        parentId: ''
                    });
                }

                return [];
            },
            disableProcedureLookup: function() {
                return this.disableFields || this.elementKey(this.elementId, "imported") || (this.isAuthoring && this.version !== '0');
            },
            // disable the import button on run procedure step when:
            // 1) a redline has been started on it (procedure_modification_status == "MODIFIED")
            // 2) or it's been imported already (imported == true)
            disableImport: function() {
                return this.updatingElementInput || 
                    this.referenceProcedureId === "" || 
                    this.selectedElements.length === 0 || 
                    this.mode === 'as-run' ||
                    this.getExecutionStatus !== 'IDLE' || 
                    (!this.isTestConductor) || 
                    this.elementKey(this.elementId, "procedure_modification_status") == "MODIFIED" ||
                    this.elementKey(this.elementId, "imported") ||
                    ((this.elementKey(this.elementId, "procedure_modification_status") === "MODIFYING" || this.elementKey(this.elementId, "procedure_modification_status") === "ADDED") 
                    && 
                    this.elementKey(this.elementId, "procedure_modification.approval.status") !== "APPROVED") || 
                    this.procedureNotFound ||
                    this.versionNotFound;
            },
            disableSectionsChooser: function() {
                return this.procedureNotFound || this.versionNotFound || this.disableFields || this.referenceProcedureId === "" || 
                    this.referenceProcedureVersion < 0 || (this.isAuthoring && this.referenceProcedureVersion === 0) || this.elementKey(this.elementId, "imported") || (this.isAuthoring && this.version !== '0');
            },
            disableVersionsLookup: function() {
                return this.procedureNotFound || this.disableFields || this.referenceProcedureId === "" || this.elementKey(this.elementId, "imported") || (this.isAuthoring && this.version !== '0');
            },
            disableSuspendResume: function() {
                return (!this.isTestConductor) || (this.getExecutionStatus == 'IDLE' ? false : true);
            },
            showSuspendResume: function() {
                return this.childExecutionId ? true : false;
            },
            callProcedureChildExecutionUrl: function() {
                return `${window.location.origin}/execute_spa/${this.venueId}/${this.childExecutionId ? this.childExecutionId :  ''}`;
            },
            venueId: function() {
                return this.venue ? this.venue.venue_id : '';
            },
            venueName: function() {
                return this.venue ? this.venue.name : '';
            }
        },
        watch: {
            isLevelThreeDetail: function(isLevelThree) {
                // only make API calls when the details are visible
                if(isLevelThree) {
                    this.populateDetails();
                }
            },
            reloadProcedureOutline: {
                deep: true,
                handler(value) {
                    if(value.elementId === this.elementId) {
                        this.populateDetails();
                    }
                }
            },
        },
        created: function() {
            if (this.referenceProcedureId) {
                this.initializeProcedureState(this.referenceProcedureId);
            }
            this.populateDetails();
        },
        methods: {
            ...mapActions([
                "setPending",
                "fetchRunProcedureOutline",
                "initializeProcedureState",
                "importProcedure",
                "resetRunProcedureInput",
                "setSelectedSteps",
                "updateRunProcedureTagSelections",
                "toggleTag",
                "suspendResume",
                "displayFeedback"
            ]),
            handleCancel: function() {
                this.showSectionChooserModal = false;
                // reset the state
                this.populateDetails();
            },
            onResumeChildExecution: async function() {
                
                let targetExecutionId = this.childExecutionId ? this.childExecutionId :  '';
                await this.suspendResume(targetExecutionId);
                // Note: switch to child execution page happens by processing Web Socket message
            },
            handleSelectTag: function(tag) {
                const tagSelections = [...this.tagSelections];
                
                for (let i=0; i < tagSelections.length; i++) {
                    const tagSelection = tagSelections[i];
                    if (tagSelection.tag_id === tag.tag_id) {
                        tagSelections[i] = {...tagSelection, selected: tag.selected};
                        break;
                    }
                }

                this.updateRunProcedureTagSelections({runProcedureElementId: this.elementId, tagSelections: tagSelections});
                // update element selections based on the tag selection change
                this.toggleTag({runProcedureElementId: this.elementId, tagId: tag.tag_id, selected: tag.selected});
            },
            onImportProcedure: async function() {
                // prevent double click
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                await this.importProcedure({elementId: this.elementId, callable: this.callable});
                this.setPending(false);
            },
            populateDetails: async function() {
                if (this.referenceProcedureId === "") {
                    return;
                }

                const warnings = [];

                // Update procedureDetails
                const response = await procedureApi.getProcedure(this.referenceProcedureId);
                this.procedureDetails = response;

                if (!this.procedureNotFound) {                    
                    // This call is not needed for the execution page.
                    // But this call is needed for watcher's page. 
                    const response = await procedureApi.getProcedureVersion(this.referenceProcedureId, this.referenceProcedureVersion);
                    this.versionDetails = response;

                    const procedureTagMap = {};
                    if (this.versionDetails.tags) {
                        for (const tag of this.versionDetails.tags) {
                            procedureTagMap[tag.tag_id] = tag;
                        }
                    }
                    
                    if (this.referenceProcedureVersion >= 0) {
                        const tagSelections = this.executionInputKey(this.elementId, "tag_selections") || [];
                        for (const tagSelection of tagSelections) {
                            if (!procedureTagMap.hasOwnProperty(tagSelection.tag_id)) {
                                const msg = `Referenced tag was not found in procedure. procedure_id: ${this.referenceProcedureId} ` + 
                                    `version: ${this.referenceProcedureVersion} tag name: ${tagSelection.name} tag_id: ${tagSelection.tag_id}`;
                                console.warn(msg);
                                warnings.push(msg);
                            }
                        }
                        this.updateRunProcedureTagSelections({runProcedureElementId: this.elementId, tagSelections: tagSelections});
                    }

                    // Update procedureOutlines and procedureOutlineIds if the fetchprocedure version didn't blow up
                    if (!this.versionNotFound && this.referenceProcedureVersion >= 0) {
                        const stepWarnings = await this.fetchRunProcedureOutline({
                            elementId: this.elementId,
                            procedureId: this.referenceProcedureId,
                            version: this.referenceProcedureVersion
                        });
                        if (stepWarnings) {
                            warnings.push(...stepWarnings);
                        }
                    }
                }

                if (warnings.length) {
                    this.displayFeedback({type: 'warning', messageObj: {message: 'Warning in nested procedure. May need to re-select tags/steps.', details: warnings}});
                }
            },
            setProcedure: async function(event) {
                this.referenceProcedureId = event.data.procedure_id;
                this.referenceProcedureTitle = event.data.title;
                this.referenceProcedureInstitutionalId = event.data.institutional_id;
                this.referenceProcedureVersion = 0;
                // update procedureVersions
                this.initializeProcedureState(this.referenceProcedureId);
             
                // update procedureDetails, versionDetails
                await this._setVersion(0);
                // save inputs to Core
                this.save();
                this.showProcedureModal = false;
            },
            setVersion: async function(event) {
                await this._setVersion(event.data.version);
                // save inputs to Core
                this.save();
                this.showVersionModal = false;
            },
            _setVersion: async function(version) {
                const response = await procedureApi.getProcedureVersion(this.referenceProcedureId, version);
                this.versionDetails = response;
                this.referenceProcedureVersion = this.versionDetails.version;
                this.referenceProcedureVersionDescription = this.versionDetails.version_description;
                this.referenceProcedureInstitutionalReleaseId = this.versionDetails.institutional_release_id;

                const tags = this.versionDetails.tags || [];
                // get tags from procedure version and assume they are not selected
                const tagSelections = tags.map(tag => {
                    return {...tag, selected: false};
                });
                // reset user input
                this.resetRunProcedureInput({elementId: this.elementId, tagSelections: tagSelections});    
                await this.populateDetails();
            },
            setSteps: function() {
                // possible solutions:
                // 1. pass in the id of the run procedure step
                // 2. pass in the index and use the outline to grab the id (looks promising)
                // 3. using the run procedure id correlate it to the step id
                this.setSelectedSteps({runProcedureElementId: this.elementId});
                this.save();
                this.showSectionChooserModal = false;
            },
            toggleRunForScore: function() {
                this.isRunForScore = !this.isRunForScore;
                this.save();
            },
            toggleCallProcedure: function() {
                this.callable = !this.callable;
                this.save();
            },
            isParentRPExecuted: function(elementId) {
                return this.parentsByChild(elementId).filter((parent) => parent.elem_type === "PROCEDURE_SECTION" && parent.executed).length > 0;
            },
            // recursively go through each and extract out children
            getAllChildren: function({children, elementId}) {
                let extracted = [];
                const _getAllChildren = ({children, elementId}) => {
                    if(children.length > 0) {
                        let innerChildren = [];
                        children.forEach(el => {
                            innerChildren = this.selectedElementsByParent({ parentId: el.elem_id, elementId });
                            extracted = [...extracted, ...innerChildren];
                        });

                        _getAllChildren({children: innerChildren, elementId});
                    }
                };
                _getAllChildren({children, elementId});
                // add the first original step back on
                return [...extracted, ...children];
            }
        },
        filters: {
            commonDateTime: commonDateTime
        }
    };
</script>

<style scoped>
    .bold-red-text {
        color: red;
    }
    .r4r-warning {
        color: red;
        margin-left: 30px;
        margin-right: 30px;
    }
    /* Run for score button */
    .run-for-score {
        height: 34px;
        width: fit-content;
        background-color: #d9534f;
        padding-left: 12px;
        padding-right: 12px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }
    .run-for-score > label {
        display: inline-block;
        margin-top: 8px;
        color: #fff;
        font-weight: inherit;
    }
    /* Create Execution button*/ 
    .create-execution {
        height: 34px;
        width: fit-content;
        background-color: #337ab7;
        border-color: #2e6da4;
        padding-left: 12px;
        padding-right: 12px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
    }
    .create-execution > label {
        display: inline-block;
        margin-top: 8px;
        color: #fff;
        font-weight: inherit;
    }
</style>
