<template>
     <ing-modal v-if="showModal" @close="close()" size="medium">
        <template slot="title">
            <span id="modal-title">
                <i class="glyphicon glyphicon-tags"></i>
                &nbsp;Manage Tags
            </span>
        </template>
        <template slot="body">
            <div style="margin-top: -30px;">
                <div class="new-tag" id="new-tag">
                    <div class="row">
                        <div class="form-group col-md-4">
                            <label>Tag
                                <input 
                                    v-model.trim="newTag.name"
                                    type="text" 
                                    class="form-control"
                                    id="tag" 
                                    name="tag">
                            </label>
                        </div>

                        <div class="form-group col-md-8">
                            <label>Description
                                <input 
                                    v-model.trim="newTag.description"
                                    type="text" 
                                    class="form-control" 
                                    id="description" 
                                    name="description">
                            </label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6" style="padding-top: 2px;">
                            <ing-tag :data="newTag"></ing-tag>
                        </div>
                        <div class="form-group col-md-6">
                            <div class="btn-group" role="group" style="float:right;">
                                <button 
                                    v-if="!editMode"
                                    @click="createNewTag"
                                    :disabled="disableAddTagButton"
                                    type="button" 
                                    class="btn btn-primary">
                                    <i class="glyphicon glyphicon-plus"></i>
                                    &nbsp;Add Tag
                                </button>
                                <button 
                                    v-else
                                    @click="editExistingTag"
                                    type="button" 
                                    class="btn btn-primary button-spacing">
                                    &nbsp;Save
                                </button>
                                <button 
                                    v-if="editMode"
                                    @click="closeEdit()"
                                    type="button" 
                                    class="btn btn-default">
                                    &nbsp;Cancel
                                </button>
                            </div> 
                        </div>
                        <div class="form-group col-md-12">
                        <label v-if="duplicateError" class="error-message">Error: Tag name must be unique.</label>
                        </div>
                    </div>
                </div>
                <div style="margin-top: -30px;">
                    <ing-table
                        tableTitle=""
                        empty-message="No tags to display"
                        :data="tags"
                        :columns="tableColumns"
                        :includeFooter="false"
                        @handleEvent="tableEvent">
                    </ing-table>
                </div>
            </div>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Close
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from '../common/IngModal.vue';
    import IngTable from '../common/IngTable.vue';
    import IngTag from './IngTag.vue';
    import DeleteTagButton from './DeleteTagButton.vue';

    export default {
        name: "IngTagModal",
        components: {
            'ing-modal': IngModal,
            'ing-table': IngTable,
            'ing-tag': IngTag
        },
        data() {
            return {
                newTag: {
                    name: '',
                    description: ''
                },
                tableColumns: [
                    { 
                        field: 'tag',
                        name: 'Tag',
                        component: IngTag,
                        normalWrap: true
                    },
                    {
                        field: 'description',
                        name: 'Description',
                        normalWrap: true
                    },
                    {
                        field: 'actions',
                        name: 'Actions',
                        component: DeleteTagButton
                    }
                ],
                editMode: false,
                duplicateError: false 
            };
        },
        watch: {
            newTag: {
                deep: true,
                handler() {
                    this.duplicateError = false;
                }
            }
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
            tags: {
                type: Array,
                required: true
            }
        },
        computed: {
            disableAddTagButton: function() {
                return this.newTag.name === '' ? true : false;
            }
        },
        methods: {
            close: function() {
                this.$emit('close');
            },
            createNewTag: function() {
                
                if(!this.checkIfDuplicateTagExists(this.newTag.name)){
                    this.$emit('newTag', this.newTag);
                    this.newTag = { name: '', description: '' };
                    this.duplicateError = false;
                } else {
                    this.duplicateError = true;
                }
                
            },
            editExistingTag: function() {
                this.$emit('editTag', this.newTag);
                this.newTag = { name: '', description: '' };
                this.editMode = false;
            },
            closeEdit: function() {
                this.newTag = { name: '', description: '' };
                this.editMode = false;
            },
            tableEvent: function(event) {
                if(event.event == 'delete')
                    this.$emit('deleteTag', event.data);

                if(event.event == 'edit') {
                    let el = document.getElementById(`new-tag`);
                    if (el) {
                        let pos = el.style.position;
                        let top = el.style.top;
                        el.scrollIntoView({behavior: 'smooth', block: 'start'});
                        el.style.top = top;
                        el.style.position = pos;
                    } else {
                        console.warn('scrollToById el not found');
                    }

                    this.newTag = {
                        name: event.data.name,
                        description: event.data.description,
                        tag_id: event.data.tag_id
                    };
                    this.editMode = true;
                }
            },
            checkIfDuplicateTagExists: function(name) {
                return this.tags.some(tag => tag['name'] === name);
            }
        }
    };
</script>

<style lang="scss" scoped>
    .new-tag {
        margin: 15px;
    }
    .new-tag label {
        color: #545454;
    }
    .new-tag input {
        font-weight: normal;
    }
    .new-tag button {
        float: right;
    }
    .button-spacing {
        margin-right: 5px;
    }
    .error-message {
        color:red !important;
    }
</style>
