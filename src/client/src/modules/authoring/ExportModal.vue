<template>
    <ing-modal v-if="showModal" @close="close()">
        <template slot="title">
            <h4 id="modal-title">
                <i class="glyphicon glyphicon-save"></i> Export Procedure
            </h4>
        </template>
        <template slot="body">
            <div class="">
                <div class="row">
                    <div class="col-sm-6">
                        Please select which version(s) of the procedure to include in this export.
                        <br><br>
                        Note that exporting larger procedure with multiple version can take some time.
                    </div>
                    <div class="col-sm-6">
                        <select v-model="selected" class="form-control">
                            <option v-for="option in options" :value="option.value" :key="option.value">
                                {{ option.text }}
                            </option>
                        </select>
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
            <button
                type="button"
                class="btn btn-primary pull-right"
                @click="saveAsGzip()">
                Export
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../common/IngModal.vue";
    import {mapActions, mapGetters} from 'vuex';
    import proceduresApi from '../../api/procedures';
    import { forceFileDownload } from '../common/utils';
    import { getProcedureVersions } from '../../api/authoring';

    export default {
        name: "ExportModal",
        components: {
            'ing-modal': IngModal,
        },
        data(){
            return {
                selected: 'GET_ALL_VERSIONS',
                defaultOptions: [
                    { text: 'All Versions', value: 'GET_ALL_VERSIONS' },
                    { text: 'All Released Versions', value: 'RELEASED_ONLY' },
                ],
                options: []
            };
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
            procedureId: {
                type: String,
                required: true,
                default: '',
            },
        },
        watch: {
            // This is used from procedures page, where procedureId is not known in advance.
            procedureId: function(newVal){
                if(newVal){
                    this.populateProcedureVersions();
                }
            }
        },
        created() {
            // This is used from procedure page, where procedureId is known.
            if(this.procedureId) {
                this.populateProcedureVersions();
            }
        },
        methods: {
            ...mapActions([
                'setPending',
            ]),
            close: function() {
                this.$emit('close');
            },
            populateProcedureVersions: async function() {
                const {versions} = await getProcedureVersions(this.procedureId, 200, null, 'DESC' );
                const versionNumbers = [];
                versions.forEach(procedure => {
                    if(procedure.version)
                        versionNumbers.push({ text: procedure.version, value: procedure.version });
                    else 
                        versionNumbers.push({ text: 'Working Version', value: procedure.version });
                });
                this.options = [...this.defaultOptions, ...versionNumbers];
            }, 
            saveAsGzip: async function() {
                this.setPending(true);
                this.close();
                let params = {};
                let filePostfix = '';

                switch(this.selected) {
                    case 'RELEASED_ONLY':
                        params = { released_only: true };
                        filePostfix = '-released-only';
                        break;
                    case 'GET_ALL_VERSIONS':
                        params = {};
                        filePostfix = '-all-versions';
                        break;
                    default:
                        params = { version: this.selected };
                        filePostfix = `-v${this.selected}`;
                }
                
                const report = await proceduresApi.exportProcedureInGzip(this.procedureId, params);
                if (report) {
                    forceFileDownload(report, `procedure-export-${this.procedureId}${filePostfix}.tar.gz`);
                }
                this.setPending(false);
            }
            
        },
    };
</script>

<style scoped lang="scss">
    
</style>
