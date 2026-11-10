<template>
    <div>
        <div class="row report-body-spacing">
            <div class="col-md-2">
                <side-bar-menu></side-bar-menu>
            </div>
            <div class="col-md-10">
                <report-type-selection type="Base" @updateReport="updateBaseReportSelection"></report-type-selection>
                <report-type-selection type="Target" @updateReport="updateTargetReportSelection" style="margin-top:25px"></report-type-selection>
                <button
                    @click="requestReport"
                    type="button"
                    :disabled="baseId != '' && targetId != '' ? false : true"
                    class="btn btn-md btn-primary"
                    style="margin-top:30px">
                    Generate Report
                </button>
            </div>
        </div>
        <report-submitted-modal
            :show="showConfirmationModal"
            :report-id="requestReportId"
            :message="requestReportMessage"
            title="Difference Report Request"
            @close="showConfirmationModal = false">
        </report-submitted-modal>
    </div>
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import SideBarMenu from  './SideBarMenu.vue';
    import ReportTypeSelection from './ReportTypeSelection.vue';
    import reportApi from '../../api/report';
    import ReportSubmittedModal from "../common/ReportSubmittedModal.vue";

    export default {
        name: "CreateReport",
        components: {
            'side-bar-menu': SideBarMenu,
            'report-type-selection': ReportTypeSelection,
            'report-submitted-modal': ReportSubmittedModal
        },
        data() {
            return {
                baseType: '',
                baseId: '',
                baseVersion: '',
                targetType: '',
                targetId: '',
                targetVersion: '',
                showConfirmationModal: false,
                requestReportId: '',
                requestReportMessage: ''
            };
        },
        computed: {
            ...mapGetters([
                'isPending',
            ]),
        },
        methods: {
            ...mapActions([
                "displayFeedback",
                "setPending",
            ]),
            updateBaseReportSelection: function(type, Id, version){
                this.baseType = type;
                this.baseId = Id;
                this.baseVersion = version;
            },
            updateTargetReportSelection: function(type, Id, version){
                this.targetType = type;
                this.targetId = Id;
                this.targetVersion = version;
            },
            requestReport: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                try {
                    const response = await reportApi.getDifferenceReport(this.baseType, this.baseId, this.baseVersion, this.targetType, this.targetId, this.targetVersion);
                    this.requestReportId = response.data.report_id;
                    this.requestReportMessage = response.data.message;
                    this.showConfirmationModal = true;
                } catch (error) {
                    this.displayFeedback({type: 'error', errorObj: error});
                } finally {
                    this.setPending(false);
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
    .report-body-spacing {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
