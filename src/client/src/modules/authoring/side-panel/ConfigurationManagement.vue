<template>
    <div>
        <h4>Configuration Management</h4>
        <div class="procedure_config_management">
            <div class="authoring_cm_details">
                <template v-if="isAllowEdit">
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
                        <a :href="this.procedureUrl" class="col-sm-8">{{ procedureDetails.procedure_id }}</a>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Proc. Type</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.procedure_type }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Hazardous</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.hazardous }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Inst. ID</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.institutional_id }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Cur. Ver.</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.current_version }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Cur. Rel.</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.current_released_version }}</div>
                    </div>
                </template>
                <template v-else>
                    <div class="row">
                        <div class="col-sm-4"><strong>Title</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.title }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Author</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.version ? procedureDetails.version_author : procedureDetails.author }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Proc. ID</strong></div>
                        <a :href="this.procedureUrl" class="col-sm-8">{{ procedureDetails.procedure_id }}</a>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Proc. Type</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.procedure_type }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Hazardous</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.hazardous }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Flight Dict.</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.flight_dictionary_version }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>SSE Dict.</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.sse_dictionary_version }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Inst. ID</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.institutional_id }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Inst. Revision ID</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.institutional_release_id }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Time Versioned</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.time_versioned }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Time Released</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.time_released }}</div>
                    </div>
                </template>
            </div>
            <div style="margin-top: 10px;" class="btn-ctrls">
                <button
                    v-if="isAllowEdit"
                    @click="showDetailModal = true"
                    type="button"
                    class="btn btn-default cm-details ing-tooltip"
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_config_mgmt_details">
                    <span class="glyphicon glyphicon-zoom-in"></span>&nbsp;Details
                </button>
                <button
                    v-if="isAllowEdit"
                    :disabled="!$can(['update'], 'Procedure')"
                    @click="showVersioningModal = true"
                    type="button"
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_config_mgmt_new_version"
                    class="btn btn-default cm-new-version ing-tooltip">
                    <span class="glyphicon glyphicon-save"></span>&nbsp;New Version
                </button>
                <button
                    v-if="isAllowEdit"
                    :disabled="!$can(['update'], 'Procedure')"
                    type="button"
                    class="btn btn-default ing-tooltip"
                    @click="unlockThisProcedure()"
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.auth_config_mgmt_done_editing">
                    <span class="glyphicon glyphicon-lock"></span>&nbsp;Done Editing
                </button>
                <button
                    type="button"
                    class="btn btn-default ing-tooltip"
                    @click="handleSaveAsPdf()"
                    data-toggle="tooltip"
                    data-placement="top"
                    data-trigger="hover"
                    onclick="$(this).tooltip('hide');"
                    :title="tooltips.save_as_pdf"
                    style="margin-top: 5px">
                    <span class="glyphicon glyphicon-download"></span>&nbsp;Save as PDF
                </button>
            </div>
        </div>
        <br>
        <ing-modal v-if="showVersioningModal" @close="showVersioningModal = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;"><span class="glyphicon glyphicon-floppy-disk"></span> Save Procedure Version</h4>
            </template>
            <template slot="body">
                <div class="row">
                    <div class="col-xs-12">
                        <p>This will save the working version of the procedure as a new version within Ingenium.</p>
                    </div>
                    <div class="col-xs-12">
                        <label>Version Description</label>
                        <input class="form-control" type="text" v-model="versionDescriptionComputed" placeholder="Enter a description for this version.">
                    </div>
                </div>

            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    @click="showVersioningModal = false">
                    Cancel
                </button>
                <button
                    type="button"
                    :disabled="lockAddVersion"
                    class="btn btn-primary"
                    @click="saveNewProcedureVersion"
                    aria-label="Save">
                    Save
                </button>
            </template>
        </ing-modal>
        <ing-modal v-if="showDetailModal" @close="showDetailModal = false">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Procedure Details</h4>
            </template>
            <template slot="body">
                <div class="procedure_config_management">
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
                        <div class="col-sm-4"><strong>Inst. ID</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.institutional_id }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Cur. Ver.</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.current_version }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Cur. Rel.</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.current_released_version }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Created</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.time_created }}</div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4"><strong>Saved</strong></div>
                        <div class="col-sm-8">{{ procedureDetails.time_saved }}</div>
                    </div>
                    <div style="margin-top: 10px;">
                        <h4>Description</h4>
                        <p>{{ procedureDetails.description }}</p>
                    </div>
                </div>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-right"
                    @click="showDetailModal = false">
                    Close
                </button>
            </template>
        </ing-modal>
        <report-submitted-modal
            :show="showReportSubmittedModal"
            :report-id="submittedReportId"
            :message="submittedReportMessage"
            title="Procedure PDF Report Request"
            @close="showReportSubmittedModal = false">
        </report-submitted-modal>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from "vuex";
    import IngModal from "../../common/IngModal.vue";
    import ReportSubmittedModal from "../../common/ReportSubmittedModal.vue";
    import { getUsername } from "../../common/utils";
    import reportApi from '../../../api/report';

    let TOOLTIPS = require('../../common/tooltip-config');

    export default {
        name: "ConfigurationManagement",
        components: {
            IngModal,
            'report-submitted-modal': ReportSubmittedModal
        },
        data() {
            return {
                showVersioningModal: false,
                lockAddVersion: false,
                showDetailModal: false,
                showReportSubmittedModal: false,
                submittedReportId: '',
                submittedReportMessage: '',
                versionDescription: "",
                currentUser: getUsername(),
            };
        },
        computed: {
            ...mapGetters([
                "procedureDetails",
                "procedureVersion",
                "isPending",
            ]),
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
            isAllowEdit: function() {
                return this.$route.query.hasOwnProperty('update') && this.workingCopy && (
                    this.procedureDetails.locked_by === undefined ||
                    this.procedureDetails.locked_by === '' ||
                    this.procedureDetails.locked_by === this.currentUser);
            },
            procedureUrl: function() { 
                return `/procedures/${this.procedureDetails.procedure_id}`; 
            },
            workingCopy: function() {
                return this.procedureVersion === "0";
            },
            versionDescriptionComputed: {
                get() { return this.versionDescription; },
                set(val) { this.versionDescription = val; }
            }
        },
        methods: {
            ...mapActions([
                "createProcedureVersion",
                "unlockProcedure",
                "toggleFeedbackModal",
                "setPending",
                "displayFeedback"
            ]),
            saveNewProcedureVersion: async function() {
                if (this.lockAddVersion) {
                    return;
                }
                this.lockAddVersion = true;
                this.showVersioningModal = false;
                await this.createProcedureVersion(this.versionDescription);
                this.lockAddVersion = false;
                this.hideFeedbackModalInSecs(30);
            },
            unlockThisProcedure: function() {
                this.unlockProcedure({procedureId: this.procedureDetails.procedure_id});
                window.location.href = '/procedures/';
            },
            hideFeedbackModalInSecs: function(seconds) {
                setTimeout(() => {
                    this.toggleFeedbackModal(false);
                }, seconds * 1000);
            },
            handleSaveAsPdf: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                try {
                    const response = await reportApi.getProcedureInPdf(this.procedureDetails.procedure_id, this.procedureVersion);
                    this.submittedReportId = response.data.report_id;
                    this.submittedReportMessage = response.data.message;
                    this.showReportSubmittedModal = true;
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            },
        }
    };
</script>

<style scoped>
@media print {
    div {
        display: none;
    }
    .btn-ctrls {
        display:none;
    }
}
</style>
