<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <div :style="{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '15px'}">
                    <h2 :style="{marginRight: 'auto'}"><i class="glyphicon glyphicon-book"></i> Reporting</h2>
                </div>
            </div>
        </div>
        <div class="row">
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <a class="nav-link active" href="#">Create Report</a>
              </li>
            </ul>
        </div>
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
        <ing-modal v-if="showConfirmationModal" @close="showConfirmationModal = false" size="medium">
            <template slot="title">
                <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                    Difference Report Request
                </h4>
            </template>
            <template slot="body">
                <p>
                    Report ID: {{requestReportId}}<br >
                    {{requestReportMessage}}<br>
                    The report will be sent to you via email once ready.<br>
                </p>
            </template>
            <template slot="footer">
                <button type="button"
                        class="btn btn-default pull-right"
                        @click="showConfirmationModal = false">
                    Confirm
                </button>
            </template>
        </ing-modal>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div> 
</template>

<script>
    import {mapGetters, mapActions} from 'vuex';
    import SideBarMenu from  './SideBarMenu.vue';
    import ReportTypeSelection from './ReportTypeSelection.vue';
    import reportApi from '../../api/report';
    import IngModal from "../common/IngModal.vue";
    import IngFooter from "../common/IngFooter.vue";

    export default {
        name: "Reporting",
        components: {
            'side-bar-menu': SideBarMenu,
            'report-type-selection': ReportTypeSelection,
            'ing-modal': IngModal,
            'ing-footer': IngFooter
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
    .nav-link.active {
        background-color: #eee;
        color: black;
    }
    .report-body-spacing {
        margin-top: 20px;
        margin-bottom: 20px;
    }
</style>
