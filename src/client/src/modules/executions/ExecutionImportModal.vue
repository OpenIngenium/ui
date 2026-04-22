<template>
    <ing-modal v-if="showModal" @close="close()" size="large">
        <template slot="title">
            <h4 id="modal-title">
                Import Execution Gzip File
            </h4>
        </template>
        <template slot="body">
            <div class="container">
                <template v-if="importedExecutionId">
                    <template>
                        <div class="container">
                            Execution was imported successfully.
                        </div>
                        <div class="container">
                            Imported execution: {{ this.importedExecutionId }}
                        </div>
                        <button type="button"
                                class="btn btn-link"
                                @click="goToExecution">
                            Go to {{this.importedExecutionId}}
                        </button>
                    </template>
                </template>
                <form v-else enctype="multipart/form-data" novalidate>
                    <div class="dropbox">
                        <input type="file" name="execution" accept=".gz" class="input-file"
                               @change="fileChange($event.target.files)">
                        <p>Drag your file(s) here to begin<br> or click to browse</p>
                    </div>
                </form>
            </div>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-primary pull-left"
                    @click="close()">
                Close
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../common/IngModal.vue";
    import {mapGetters, mapActions} from 'vuex';

    export default {
        name: "ExecutionImportModal",
        components: {
            'ing-modal': IngModal,
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
        computed: {
            ...mapGetters([
                'importedExecutionId',
            ]),
        },
        methods: {
            ...mapActions([
                'importExecution',
                'resetImportResponse',
            ]),
            close: function() {
                this.resetImportResponse();
                this.$emit('close');
            },
            fileChange: async function(fileList) {
                if (fileList.length) {
                    const fileObj = fileList[0];
                    const fileName = fileList[0].name;
                    const formData = new FormData();
                    
                    formData.append('execution_file', fileObj, fileName);
                    await this.importExecution({formData:formData});
                    this.$emit('imported-execution');         
                }
            },
            goToExecution: function() {
                const eventObj = {
                    action: 'selectExecution',
                    data: {
                        execution_id: this.importedExecutionId,
                    },
                };
                this.$emit('select-execution', eventObj);
                this.resetImportResponse();
            }
        },
    };
</script>

<style scoped lang="scss">
    .dropbox {
        outline: 2px dashed grey; /* the dash box */
        outline-offset: -10px;
        background: lightcyan;
        color: dimgray;
        padding: 10px 10px;
        min-height: 200px; /* minimum height */
        position: relative;
        cursor: pointer;
    }

    .input-file {
        opacity: 0; /* invisible but it's there! */
        width: 100%;
        height: 200px;
        position: absolute;
        cursor: pointer;
    }

    .dropbox:hover {
        background: lightblue; /* when mouse over to the drop zone, change color */
    }

    .dropbox p {
        font-size: 1.2em;
        text-align: center;
        padding: 50px 0;
    }
</style>
