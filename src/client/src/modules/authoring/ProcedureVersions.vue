<template>
    <div>
        <div style="margin-top: 10px; margin-left: 30px;" v-if="this.hasVersions">
            <!-- NAVIGATION BANNER -->
            <div class="row">
                <div class="col-xs-12">
                    <i class="glyphicon glyphicon-book"></i>
                    <h4 style="display: inline;">Procedure Details &raquo; {{procedureId}} | {{title}}</h4>
                    <i v-if="this.$can(['delete'], 'Admin')" class="actionable glyphicon glyphicon-trash" @click.stop="showDeleteProcedureModal=true"></i>
                </div>
            </div>
            <hr>

            <!-- PROCEDURE DETAIL -->
            <div class="row">
                <div class="col-xs-4">
                    <i>Procedure ID:</i>
                    <span>{{procedureId}}</span>
                </div>
                <div class="col-xs-4">
                    <i>Institutional ID:</i>
                    <template v-if="!updateInstitutionalId">
                        <span @click.stop="handleStartUpdateField({updateInstitutionalId: true})" class="actionable">{{institutionalId}}</span>
                        <i v-if="this.$can(['update'], 'Procedure')" @click.stop="handleStartUpdateField({updateInstitutionalId: true})" class="glyphicon glyphicon-pencil actionable"></i>
                    </template>
                    <template v-else>
                        <input id="institutionalIdInput" @change.prevent.stop="updateProcedureByField('institutionalId', $event.srcElement.value);updateInstitutionalId=false;" v-model="institutionalId">
                    </template>
                </div>
                <div class="col-xs-4">
                    <i>Title:</i>
                    <template v-if="!updateTitle">
                        <span @click.stop="handleStartUpdateField({updateTitle: true})" class="actionable">{{title}}</span>
                        <i v-if="this.$can(['update'], 'Procedure')" @click.stop="handleStartUpdateField({updateTitle: true})" class="glyphicon glyphicon-pencil actionable"></i>
                    </template>
                    <template v-else>
                        <input id="titleInput" @change.prevent.stop="updateProcedureByField('title', $event.srcElement.value);updateTitle=false;" v-model="title">
                    </template>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-8">
                    <i>Description:</i>
                    <i v-if="!updateDescription && this.$can(['update'], 'Procedure')"
                       @click.stop="handleStartUpdateField({updateDescription: true})"
                       class="glyphicon glyphicon-pencil actionable"></i><br>
                    <template v-if="!updateDescription">
                        <span @click.stop="handleStartUpdateField({updateDescription: true})" class="actionable">{{description}}</span>
                    </template>
                    <template v-else>
                        <textarea id="descriptionInput" style="width: 100%;" @change.prevent.stop="updateProcedureByField('description', $event.srcElement.value);updateDescription=false;" v-model="description"></textarea>
                    </template>
                </div>
                <div class="col-xs-4">
                    <i>Authors:</i>
                    <template v-if="!updateAuthor">
                        <span @click.stop="handleStartUpdateField({updateAuthor: true})" class="actionable">{{author}}</span>
                        <i v-if="this.$can(['update'], 'Procedure')" @click.stop="handleStartUpdateField({updateAuthor: true})" class="glyphicon glyphicon-pencil actionable"></i>
                    </template>
                    <template v-else>
                        <input id="authorInput" @change.prevent.stop="updateProcedureByField('author', $event.srcElement.value);updateAuthor=false;" v-model="author">
                    </template>
                </div>
            </div>
            <hr>

            <!-- PROCEDURE MANAGEMENT -->
             <div class="row">
                <div class="col-xs-3 procedure-management-col">
                    Procedure Type:
                    <select class="form-control" style="width: 70%; margin-left: 10px;" v-on:change="handleSelectProcedureType">
                        <option
                            v-for="option in procedureTypeOptions"
                            :key="option.value"
                            :value="option.value"
                            :selected="option.value === procedureType"
                        >
                        {{ option.label }}
                        </option>
                    </select>
                </div>
                <div class="col-xs-3 procedure-management-col">
                    Hazardous: 
                    <ing-toggle
                        onName="Yes"
                        offName="No"
                        :value="isHazardous"
                        :clickHandler="onClickHazardToggle"
                        sizeClass="btn-sm"
                        customStyle="margin-left:10px"
                        >
                    </ing-toggle>
                </div>
                <div class="col-xs-6 procedure-management-col">
                    <procedure-label-inline
                        :availableLabels="availableLabels"
                        :labels="selectedLabels"
                        v-on:deleteLabel="handleDeleteLabel"
                        v-on:addLabel="handleAddLabel"
                    ></procedure-label-inline>
                </div>
                
             </div>
            <hr>
            <!-- VERSION DETAIL -->
            <div class="row">
                <div class="col-xs-4">
                    <div class="row">
                        <div class="col-xs-12">
                            Working Version:&nbsp;
                            <template v-if="canEditProcedureVersion">
                                <a href="#"
                                   @click="routeToAuthoring(procedureId, 0)">
                                    0
                                </a>
                            </template>
                            <template v-else>
                                0
                            </template>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-12">
                            Flight Dictionary:&nbsp;{{authoringProcedureVersionsWorkingVersion.flight_dictionary_version}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-4">
                    <div class="row">
                        <div class="col-xs-12">
                            Last Updated:&nbsp;{{authoringProcedureVersionsWorkingVersion.time_saved}}
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-12">
                            SSE Dictionary:&nbsp;{{authoringProcedureVersionsWorkingVersion.sse_dictionary_version}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-4">
                    <template v-if="lockedBy && lockedBy !== ''">
                        <div class="row">
                            <div class="col-xs-12">
                                <i class="glyphicon glyphicon-lock pull-right" style="font-size: 25px;"></i>
                            </div>
                            <div class="col-xs-12">
                                <button type="button" class="btn btn-default btn-xs pull-right"
                                        @click.stop="unlockProcedure({procedureId: procedureId})"
                                        :disabled="!canUnlock">
                                    Unlock
                                </button>
                            </div>
                            <div class="col-xs-12">
                                <span class="pull-right">Locked by</span>
                            </div>
                            <div class="col-xs-12">
                                <span class="pull-right">{{lockedBy}}</span>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <!-- VERSION DETAIL FUNCTIONAL BUTTONS -->
            <div class="row version-detail-function-buttons">
                <div class="col-xs-1"></div>
                <div class="col-xs-1 utility-button">
                    <i class="glyphicon glyphicon-eye-open actionable"
                       @click.stop="routeToAuthoring(procedureId, 0)">
                        &nbsp;View Working Version (version 0)
                    </i>
                </div>
                <div v-if="$can('update', 'Procedure')" class="col-xs-1 utility-button" :class="{'disabled': !isAllowEdit}">
                    <i class="glyphicon glyphicon-pencil actionable"
                       @click.stop="handleEditWorkingVersion()">
                        &nbsp;Edit Working Version (version 0)
                    </i>
                </div>
                <div v-if="$can('update', 'Procedure')" class="col-xs-1 utility-button" :class="{'disabled': !isAllowEdit}">
                    <i class="glyphicon glyphicon-refresh actionable"
                       @click.stop="showRevertModal=true">
                        &nbsp;Revert
                    </i>
                </div>
                <div v-if="$can('update', 'Procedure')" class="col-xs-2 utility-button" :class="{'disabled': !isAllowEdit}">
                    <i class="glyphicon glyphicon-floppy-disk actionable"
                       @click.stop="showAddVersionModal=true">
                        &nbsp;New Version
                    </i>
                </div>
                <div class="col-xs-2 utility-button">
                    <i class="glyphicon glyphicon-save actionable"
                       @click="showExportModal=true">
                        &nbsp;Export Procedure 
                    </i>
                </div>
                <div class="col-xs-1 utility-button">
                    <i class="glyphicon glyphicon-download actionable"
                       @click.stop="saveAsPdf(procedureId, 0)">
                        &nbsp;PDF
                    </i>
                </div>
            </div>

            <!-- VERSION DATA TABLE -->
            <div class="row">
                <div class="col-xs-12">
                    <ing-table
                        tableId="proceduresVersions"
                        tableTitle=""
                        empty-message="No versions to display."
                        :data="authoringProcedureVersionsData"
                        :columns="tableColumns"
                        :total="authoringProcedureVersionsCount"
                        :limit="limit"
                        :callback="tableCallback"
                        @handleEvent="tableEvent">
                    </ing-table>
                </div>
            </div>

            <!-- ADD VERSION MODAL -->
            <ing-modal v-if="showAddVersionModal" @close="closeAddVersionModal()">
                <template slot="title">
                    <i class="glyphicon glyphicon-floppy-disk"></i><h4 id="modal-title">&nbsp;Save Procedure Version</h4>
                </template>
                <template slot="body">
                    This will save the working version of the procedure as a new version within Ingenium.
                    <div class="form-group">
                        <label for="version-description">
                            Version Description
                        </label>
                        <textarea id="version-description" class="form-control" style="width: 100%" v-model="newVersionDescription"></textarea>
                    </div>
                </template>
                <template slot="footer">
                    <button type="button"
                            class="btn btn-default pull-left"
                            @click.prevent.stop="closeAddVersionModal()">
                        Cancel
                    </button>
                    <button type="button"
                            :disabled="lockAddVersion"
                            class="btn btn-primary pull-right"
                            @click.prevent.stop="newProcedureVersion()">
                        Submit
                    </button>
                </template>
            </ing-modal>

            <!-- EXPORTED PROCEDURE MODAL -->
            <export-modal :show-modal="showExportModal" :procedure-id="procedureId" @close="showExportModal=false"></export-modal>

            <!-- UPDATE PROCEDURE VERSION MODAL -->
            <ing-modal v-if="showVersionDescriptionModal" @close="closeUpdateVersionDescriptionModal()">
                <template slot="title">
                    <i class="glyphicon glyphicon-pencil">&nbsp;Edit</i>
                </template>
                <template slot="body">
                    <div class="form-group">
                        <label for="version-description">
                            Version Description
                        </label>
                        <textarea id="version-description" class="form-control" style="width: 100%" v-model="editProcedureVersionMetaData"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="revision-description">
                            Revision Description
                        </label>
                        <textarea id="revision-description" class="form-control" style="width: 100%" v-model="institutionalReleaseId"></textarea>
                    </div>
                </template>
                <template slot="footer">

                    <button type="button"
                            class="btn btn-default pull-left"
                            @click.prevent.stop="closeUpdateVersionDescriptionModal()">
                        Cancel
                    </button>
                    <button type="button"
                            class="btn btn-primary pull-right"
                            @click.prevent.stop="updateVersionMetaData()">
                        Submit
                    </button>
                </template>
            </ing-modal>

            <!-- REVERT MODAL --->
            <revert-modal :show-modal="showRevertModal" @close="showRevertModal=false"></revert-modal>

            <!-- DELETE CONFIRMATION -->
            <ing-modal v-if="showDeleteProcedureModal || showDeleteVersionModal" @close="showDeleteProcedureModal=false; showDeleteVersionModal=false;">
                <template slot="title">
                    <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                        <span class="glyphicon glyphicon-cog"></span>
                        Confirm Delete?
                    </h4>
                </template>
                <template slot="body">
                    <p v-if="showDeleteProcedureModal">
                        Are you sure you want to delete {{procedureId}} and all its versions. This cannot be reverted.
                    </p>
                    <p v-else-if="showDeleteVersionModal">
                        Are you sure to delete the procedure version {{procedureVersion}} of {{procedureId}}. This cannot be reverted.
                    </p>
                </template>
                <template slot="footer">
                    <button type="button"
                            class="btn btn-default pull-left"
                            @click="showDeleteProcedureModal=false; showDeleteVersionModal=false;">
                        Cancel
                    </button>
                    <button v-if="showDeleteProcedureModal"
                            type="button"
                            class="btn btn-danger pull-right"
                            @click="showDeleteProcedureModal=false; deleteProcedure({procedureId: procedureId})">
                        Delete
                    </button>
                    <button v-else-if="showDeleteVersionModal"
                            type="button"
                            class="btn btn-danger pull-right"
                            @click="showDeleteVersionModal=false; deleteProcedureVersion({procedureId: procedureId, version: procedureVersion})">
                        Delete
                    </button>
                </template>
            </ing-modal>

            <!-- HELPER MODALS -->
            <feedback-modal></feedback-modal>
            <spinner-modal v-if="isBusy"></spinner-modal>
        </div>
        <div class="procedure-not-found" v-if='procedureNotFound'>
            <h1>
                Procedure Not Found
            </h1>
        </div>
        <div class="procedure-not-found" v-else>
            <spinner-modal v-if="loadingProcedure"></spinner-modal>
            <h1 v-if="loadingProcedure">
                Loading Procedure
            </h1>
        </div>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
    
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import IngTable from '../common/IngTable.vue';
    import SelectProcedureVersionButton from './SelectProcedureVersionButton.vue';
    import IngModal from '../common/IngModal.vue';
    import ProcedureVersionDropdownButton from './ProcedureVersionDropdownButton.vue';
    import reportApi from '../../api/report';
    import proceduresApi from '../../api/procedures';
    import { deepCopy, forceFileDownload, getUsername } from '../common/utils';
    import ProcedureVersionRevertModal from './ProcedureVersionRevertModal.vue';
    import FeedbackModal from '../common/FeedbackModal.vue';
    import SpinnerModal from '../common/SpinnerModal.vue';
    import ImportModal from './ImportModal.vue';
    import ExportModal from './ExportModal.vue';
    import IngFooter from "../common/IngFooter.vue";
    import IngToggle from "../common/IngToggle.vue";
    import ProcedureLabelInline from './ProcedureLabelInline.vue';

    export default {
        name: 'ProcedureVersions',
        components: {
            'ing-table': IngTable,
            'ing-modal': IngModal,
            'revert-modal': ProcedureVersionRevertModal,
            'feedback-modal': FeedbackModal,
            'spinner-modal': SpinnerModal,
            'export-modal': ExportModal,
            'ing-footer': IngFooter,
            'ing-toggle': IngToggle,
            'procedure-label-inline': ProcedureLabelInline
        },
        created: async function() {
            await this.setProcedureId({procedureId: this.$route.params.procedureId});

            // Check whether gotten here from a direct URL
            if (this.authoringProcedureIndex === -1) {
                await this.fetchAuthoringProcedureByProcedureId({procedureId: this.procedureId});
            } 
            await this.fetchAuthoringProcedureVersionsWorkingVersion({procedureId: this.procedureId});
            await this.fetchAuthoringProcedureVersions({procedureId: this.procedureId, limit: this.limit, offset: this.offset});
            
            if (this._authoringProcedure) {
                this.updateProcedureDetail();
            }

            await this.getLabels();
        },
        data() {
            return {
                offset: 0,
                limit: 10,
                currentUser: getUsername(),
                updateInstitutionalId: false,
                updateTitle: false,
                updateDescription: false,
                updateAuthor: false,
                showAddVersionModal: false,
                lockAddVersion: false,
                newVersionDescription: '',
                editProcedureVersionMetaData: '',
                institutionalReleaseId: '',
                procedureVersionIndex: null,
                procedureVersion: null,
                showRevertModal: false,
                showImportModal: false,
                showDeleteProcedureModal: false,
                showDeleteVersionModal: false,
                showVersionDescriptionModal: false,
                titleBack: '',
                institutionalIdBack: '',
                descriptionBack: '',
                authorBack: '',
                showExportModal: false,
                tableColumns: [
                    {
                        field: 'version',
                        name: 'Version',
                        component: SelectProcedureVersionButton,
                    },
                    {
                        field: 'status',
                        name: 'Status'
                    },
                    {
                        field: 'institutional_release_id',
                        name: 'Revision',
                    },
                    {
                        field: 'version_description',
                        name: 'Description',
                        wordWrap: true,
                    },
                    {
                        field: 'flight_dictionary_version',
                        name: 'Flight Dictionary',
                    },
                    {
                        field: 'sse_dictionary_version',
                        name: 'SSE Dictionary',
                    },
                    {
                        field: 'comment_summary',
                        name: 'Comments (Unresolved/Total)',
                        html: true
                    },
                    {
                        field: 'time_saved',
                        name: 'Last Updated',
                    },
                    {
                        field: 'dropdown',
                        name: '',
                        component: ProcedureVersionDropdownButton,
                        normalWrap: true,
                    },
                ],
                procedureTypeOptions: [
                    { value: '', label: 'Select Procedure Type' },
                    { value: 'STR', label: 'STR (Special Test Request)' },
                    { value: 'SOP', label: 'SOP (Standard Operating Procedure)' },
                    { value: 'Template', label: 'Template' },
                    { value: 'V&V', label: 'V&V' },
                    { value: 'EIP', label: 'EIP (Electrical Integration Procedure)' },
                    { value: 'Functional', label: 'Functional' }
                ]
            };
        },
        watch: {
            currentProcedureDeleted: function(newVal) {
                if (newVal) {
                    this.updateCurrentProcedureDeleted({currentProcedureDeleted: false});
                    this.$router.push({path: '/procedures'});
                }
            },
            _authoringProcedure: function() {
                if (this._authoringProcedure) {
                    this.updateProcedureDetail();
                }
            },
        },
        computed: {
            ...mapGetters([
                'authoringProcedureVersions',
                'authoringProcedureVersionsWorkingVersion',
                'authoringProcedure',
                'authoringProcedureIndex',
                'currentProcedureDeleted',
                'authoringProcedureVersionsCount',
                'isPending',
                'importingProcedure',
                'loadingProcedure',
                'creatingProcedureVersion',
                'procedureNotFound',
                'procedureId',
                'labels'
            ]),
            isHazardous: function() {
                if (this._authoringProcedure && this._authoringProcedure.hazardous !== undefined) {
                    return this._authoringProcedure.hazardous;
                }
                return false;
            },
            procedureType: function() {
                if (this._authoringProcedure && this._authoringProcedure.procedure_type !== undefined) {
                    if (this._authoringProcedure.procedure_type === '') {
                        return this.procedureTypeOptions[0].value;
                    }
                    return this._authoringProcedure.procedure_type;
                }
                return this.procedureTypeOptions[0];
            },
            availableLabels: function() {
                const defaultLabel = {
                    label_id: -1,
                    name: "Select a label...",
                    description: ""
                };

                return [defaultLabel, ...this.labels];
            },
            selectedLabels: function() {
                if (this._authoringProcedure && this._authoringProcedure.labels !== undefined) {
                    return this._authoringProcedure.labels;
                }
                return [];
            },
            isBusy: function() {
                return this.isPending || this.importingProcedure || this.loadingProcedure || this.creatingProcedureVersion;
            },
            authoringProcedureVersionsData: function() {
                let updatedData = [];
                this.authoringProcedureVersions.forEach(version => {
                    let versionData = {
                        ...version,
                        comment_summary: `<span style="color: orange">${version.unresolved_conversations_count}</span> / <span>${version.conversations_count}</span>`
                    };
                    updatedData.push(versionData);
                }); 
                return updatedData;                
            },
            hasVersions() {
                return this.authoringProcedureVersions && this.authoringProcedureVersions.length > 0;
            },
            isAllowEdit: function() {
                return this.lockedBy === undefined || this.lockedBy === '' || this.lockedBy === this.currentUser;
            },
            _authoringProcedure: function() {
                // Check whether gotten here from a direct URL
                if (this.authoringProcedureIndex === -1) {
                    return this.authoringProcedure(this.procedureId);
                }
                return this.authoringProcedure();
            },
            canUnlock: function() {
                return (this.username !== '' && this.username === this.lockedBy) || this.$can(['update'], 'Procedure');
            },
            canEditProcedureVersion: function() {
                return this.lockedBy === '' || this.lockedBy === this.username;
            },
            username: function() {
                return getUsername();
            },
            lockedBy: function() {
                let retVal = '';
                if (this._authoringProcedure) {
                    retVal = this._authoringProcedure.locked_by;
                }
                return retVal;
            },
            title: {
                get: function() {
                    return this.titleBack;
                },
                set: function(val) {
                    this.titleBack = val;
                },
            },
            institutionalId: {
                get: function() {
                    return this.institutionalIdBack;
                },
                set: function(val) {
                    this.institutionalIdBack = val;
                },
            },
            description: {
                get: function() {
                    return this.descriptionBack;
                },
                set: function(val) {
                    this.descriptionBack = val;
                },
            },
            author: {
                get: function() {
                    return this.authorBack;
                },
                set: function(val) {
                    this.authorBack = val;
                },
            },
        },
        methods: {
            ...mapActions([
                'fetchAuthoringProcedureVersions',
                'fetchAuthoringProcedureVersionsWorkingVersion',
                'fetchAuthoringProcedureByProcedureId',
                'updateProcedure',
                'updateCurrentProcedureDeleted',
                'deleteProcedure',
                'createProcedureVersion',
                'setProcedureId',
                'deleteProcedureVersion',
                'setAuthoringProcedureVersionIndex',
                'updateProcedureVersionStatus',
                'updateProcedureVersionMetaData',
                'unlockProcedure',
                'setPending',
                'displayFeedback',
                'getLabels'
            ]),
            updateProcedureDetail: function() {
                this.titleBack = this._authoringProcedure.title;
                this.institutionalIdBack = this._authoringProcedure.institutional_id;
                this.descriptionBack = this._authoringProcedure.description;
                this.authorBack = this._authoringProcedure.author;
            },
            handleStartUpdateField: function({
                updateInstitutionalId=false, updateTitle=false, updateDescription=false, updateAuthor=false
            }) {
                // Activate input field
                this.updateInstitutionalId = updateInstitutionalId;
                this.updateTitle = updateTitle;
                this.updateDescription = updateDescription;
                this.updateAuthor = updateAuthor;

                // Focus on input field
                if (updateInstitutionalId) {
                    setTimeout(() => {document.getElementById('institutionalIdInput').focus();}, 50);
                }
                else if (updateTitle) {
                    setTimeout(() => {document.getElementById('titleInput').focus();}, 50);
                }
                else if (updateDescription) {
                    setTimeout(() => {document.getElementById('descriptionInput').focus();}, 50);
                }
                else if (updateAuthor) {
                    setTimeout(() => {document.getElementById('authorInput').focus();}, 50);
                }
            },
            closeAddVersionModal: function() {
                this.showAddVersionModal = false;
                this.newVersionDescription = '';
            },
            closeUpdateVersionDescriptionModal: function() {
                this.showVersionDescriptionModal = false;
                this.editProcedureVersionMetaData = '';
                this.institutionalReleaseId = '';
                this.procedureVersion = null;
            },
            updateProcedureByField: function(field=null, val=null) {
                if (field && (val != null)) {
                    const updateObj = { procedureId: this.procedureId};
                    updateObj[field] = val;
                    this.updateProcedure(updateObj);
                }
            },
            handleEditWorkingVersion: function() {
                this.routeToAuthoring(this.procedureId, 0, true);
            },
            releaseProcedureVersion: function() {               
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'RELEASE',
                });
            },
            submitProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'SUBMIT',
                });
            },
            unsubmitProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'UNSUBMIT',
                });
            },
            approveProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'APPROVE',
                });
            },
            unapproveProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'UNAPPROVE',
                });
            },
            obsoleteProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'OBSOLETE',
                });
            },
            unobsoleteProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'UNOBSOLETE',
                });
            },
            updateVersionMetaData: function() {
                this.updateProcedureVersionMetaData({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    versionDescription: this.editProcedureVersionMetaData,
                    institutionalReleaseId: this.institutionalReleaseId
                });
                this.closeUpdateVersionDescriptionModal();
            },
            unreleaseProcedureVersion: function() {
                this.setAuthoringProcedureVersionIndex({index: this.procedureVersionIndex});
                this.updateProcedureVersionStatus({
                    procedureId: this.procedureId,
                    version: this.procedureVersion,
                    action: 'UNRELEASE'
                });
            },
            tableCallback: function({limit, offset}) {
                this.limit = limit;
                this.offset = offset;
                this.fetchAuthoringProcedureVersions({procedureId: this.procedureId, limit: limit, offset: offset});
            },
            tableEvent: function(event) {
                switch(event.action) {
                    case 'selectProcedureVersion':
                        this.routeToAuthoring(this.procedureId, event.data.version);
                        break;
                    case 'submitProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.submitProcedureVersion();
                        break;
                    case 'unsubmitProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.unsubmitProcedureVersion();
                        break;
                    case 'approveProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.approveProcedureVersion();
                        break;
                    case 'unapproveProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.unapproveProcedureVersion();
                        break;
                    case 'releaseProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.releaseProcedureVersion();
                        break;
                    case 'unreleaseProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.unreleaseProcedureVersion();
                        break;
                    case 'obsoleteProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.obsoleteProcedureVersion();
                        break;
                    case 'unobsoleteProcedureVersion':
                        this.procedureVersionIndex = event.data.index;
                        this.procedureVersion = event.data.version;
                        this.unobsoleteProcedureVersion();
                        break;
                    case 'saveAsPdf':
                        this.saveAsPdf(this.procedureId, event.data.version);
                        break;
                    case 'deleteProcedureVersion':
                        this.procedureVersion = event.data.version;
                        this.showDeleteVersionModal = true;
                        break;
                    case 'editProcedureVersionMetaData':
                        this.procedureVersion = event.data.version;
                        this.editProcedureVersionMetaData = event.data.description;
                        this.institutionalReleaseId = event.data.revisionDescription;
                        this.showVersionDescriptionModal = true;
                        break;
                    default:
                        break;
                }
            },
            saveAsPdf: async function(procedureId, version) {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                try {
                    const report = await reportApi.getProcedureInPdf(procedureId, version);
                    forceFileDownload(report, `${procedureId}-v${version}.pdf`);
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            },
            routeToAuthoring: function(procedureId, version, isUpdate=false) {
                this.$router.push({path: `/authoring/${procedureId}/${version}` + (isUpdate ? '?update': '')});
            },
            newProcedureVersion: async function() {
                if (this.lockAddVersion) {
                    return;
                }
                this.lockAddVersion = true;
                this.showAddVersionModal = false;
                await this.createProcedureVersion(this.newVersionDescription);
                this.lockAddVersion = false;
                this.newVersionDescription = '';
            },
            onClickHazardToggle: function() {
                this.updateProcedureByField('hazardous', !this.isHazardous);
            },
            handleSelectProcedureType: function(event) {
                const selectedValue = event.target.value;
                if (selectedValue === this.procedureTypeOptions[0].value) {
                    this.updateProcedureByField('procedureType', '');
                } else {
                    this.updateProcedureByField('procedureType', selectedValue);
                }
            },
            handleAddLabel: async function(event) {
                const labelId = event.target.value;
                const labelInfo = this.availableLabels.find(label => label.label_id == labelId);
                if(labelId != -1 ) {
                    const labelList = [labelInfo, ...this.selectedLabels];
                    this.updateProcedureByField('labels', labelList);
                }
            },
            handleDeleteLabel: async function(label) {
                if(label.label_id != -1 ) {
                    const updatedSelectedLabels = this.selectedLabels.filter(selected => selected.label_id !== label.label_id);
                    this.updateProcedureByField('labels', updatedSelectedLabels);
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #modal-title {
        font-weight: bold;
        display: inline-block;
    }
    .utility-button {
        text-align: center;
    }
    .disabled {
        pointer-events: none;
        opacity: 0.5;
    }
    .actionable {
        cursor: pointer;
    }
    .procedure-not-found {
        display: flex;
        justify-content: center;
        margin: 50px 0;
    }
    .version-detail-function-buttons {
        margin-top: 40px;
    }
    .procedure-management-col {
        display: flex;
        align-items: center;
    }
</style>
