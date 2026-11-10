<template>
    <ing-modal v-if="showModal" size="large" @close="close()">
        <template v-if="showProcedureModal">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Select Procedure</h4>
            </template>
            <template slot="body">
                <select-procedure-table v-on:setProcedure="setProcedure"></select-procedure-table>
            </template>
            <template slot="footer">
                <div></div>
            </template>
        </template>
        <template v-else-if="showVersionModal">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Select Version</h4>
            </template>
            <template slot="body">
                <select-version-table v-on:setVersion="setVersion" :procedureId="procedureId"></select-version-table>
            </template>
            <template slot="footer">
                <div></div>
            </template>
        </template>
        <template v-else>
            <template slot="title">
                <i class="glyphicon glyphicon-book">&nbsp;Select Procedure</i>
            </template>
            <template slot="body">
                <div class="row">
                    <div class="col-xs-6 form-group">
                        <label title="Procedure title." style="display: inline-block;"> Procedure</label>
                        <button @click="showProcedureModal = true" type="button"
                                class="btn btn-xs btn-info pull-right procedure-lookup">
                            <i class="glyphicon glyphicon-search">&nbsp;Lookup</i>
                        </button>
                        <input name="reference_procedure_title" :value="procedureDetails.title" disabled="disabled"
                               type="text" class="form-control execution-input">
                        <div class="procedure_cm_container title" style="min-height: 200px; overflow: hidden;">
                            <div class="procedure_section_form procedure_config_management">
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
                    <div class="col-xs-6 form-group">
                        <label title="Procedure version." style="display: inline-block;"> Version</label>
                        <button @click="showVersionModal=true" type="button" :disabled="!this.procedureDetails.procedure_id"
                                class="btn btn-xs btn-info pull-right version-lookup">
                            <i class="glyphicon glyphicon-search">&nbsp;Lookup</i>
                        </button>
                        <input name="reference_procedure_version" :value="versionDetails.version"
                               disabled="disabled" type="text" class="form-control execution-input">
                        <div class="procedure_cm_container version" style="min-height: 200px; overflow: hidden;">
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
                                    <div class="col-sm-8">{{ versionDetails.institutional_id }}</div>
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
                    </div>
                </div>
            </template>
            <template slot="footer">
                <button type="button"
                        class="btn btn-default pull-left"
                        @click="close()">
                    Cancel
                </button>
                <button type="button"
                        class="btn btn-default pull-right"
                        :disabled="procedureId=='' || version==null ? true :false"
                        @click="selectProcedure()">
                    Confirm
                </button>
            </template>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from '../common/IngModal.vue';
    import SelectProcedureTable from '../elements/non-executable/run-procedure/SelectProcedureTable.vue';
    import SelectVersionTable from '../elements/non-executable/run-procedure/SelectVersionTable.vue';
    import {commonDateTime} from "../common/filters";

    export default {
        name: "ProcedureVersionSelect",
        components: {
            'ing-modal': IngModal,
            'select-procedure-table': SelectProcedureTable,
            'select-version-table': SelectVersionTable,
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
        data() {
            return {
                showProcedureModal: false,
                showVersionModal: false,
                procedureDetails: {
                    procedure_id: null,
                    title: null,
                    author: null,
                    institutional_id: null,
                    current_version: null,
                    time_created: null,
                    time_saved: null,
                    description: null,
                },
                versionDetails: {
                    version_author: null,
                    procedure_id: null,
                    institutional_id: null,
                    version: null,
                    version_description: null,
                    time_versioned: null
                },
            };
        },
        computed: {
            procedureId: function() {
                return this.procedureDetails.procedure_id ? this.procedureDetails.procedure_id : '';
            },
            version: function() {
                return this.versionDetails.version !== '' ? this.versionDetails.version : '';
            },
        },
        methods: {
            setProcedure: function(event) {
                this.showProcedureModal = false;
                this.procedureDetails.procedure_id = event.data.procedure_id;
                this.procedureDetails.title = event.data.title;
                this.procedureDetails.author = event.data.author;
                this.procedureDetails.institutional_id = event.data.institutional_id;
                this.procedureDetails.current_version = event.data.current_version;
                this.procedureDetails.time_created = event.data.time_created;
                this.procedureDetails.time_saved = event.data.time_saved;
                this.procedureDetails.description = event.data.description;
            },
            setVersion: function(event) {
                this.showVersionModal = false;
                this.versionDetails.showVersionModal = false;
                this.versionDetails.version_author = event.data.version_author;
                this.versionDetails.procedure_id = event.data.procedure_id;
                this.versionDetails.institutional_id = event.data.institutional_id;
                this.versionDetails.version = event.data.version;
                this.versionDetails.version_description = event.data.version_description;
                this.versionDetails.time_versioned = event.data.time_versioned;
            },
            selectProcedure: function() {
                this.$emit('confirm', this.procedureDetails, this.versionDetails);
                this.close();
            },
            close: function() {
                if (this.showProcedureModal) {
                    this.showProcedureModal = false;
                }
                else if (this.showVersionModal) {
                    this.showVersionModal = false;
                }
                else {
                    this.$emit('close');
                }
            },
        },
        filters: {
            commonDateTime: commonDateTime,
        }
    };
</script>

<style scoped>
.procedure_config_management {
    background-color: #F7F7F7;
    margin-top: 4px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 2px;
    font-size: 12px;
    color: #797979;
}

</style>
