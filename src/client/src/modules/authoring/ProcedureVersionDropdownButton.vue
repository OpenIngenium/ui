<template>
    <div class="dropdown">
        <button @click="showDropdown = !showDropdown"
                class="btn btn-secondary dropdown-toggle"
                type="button" id="dropdownMenuButton"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="glyphicon glyphicon-option-vertical"></i>
        </button>
        <div v-if="showDropdown" class="dropdown-menu dropdown-menu-right" style="min-width:210px" aria-labelledby="dropdownMenuButton">
            <ul>
                <li class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', selectProcedureVersion);">
                    <i class="glyphicon glyphicon-eye-open">
                        &nbsp;View
                    </i>
                </li>
                <li v-if="canEditMenu && $can('update', 'Procedure')"  class="actionable" data-toggle="dropdown" 
                    @click="showDropdown=false; $emit('tableEvent', editProcedureVersionMetaData);">
                    <i class="glyphicon glyphicon-pencil">
                        &nbsp;Edit
                    </i>
                </li>
                <li v-if="canSubmit" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', submitProcedureVersion);">
                    <i class="glyphicon glyphicon-thumbs-up">
                        &nbsp;Submit
                    </i>
                </li>
                <li v-if="canUnSubmit" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', unsubmitProcedureVersion);">
                    <i class="glyphicon glyphicon-thumbs-down">
                        &nbsp;Unsubmit
                    </i>
                </li>
                <li v-if="canApprove" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', approveProcedureVersion);">    
                    <i class="glyphicon glyphicon-thumbs-up">
                        &nbsp;Approve
                    </i>
                </li>
                <li v-if="canUnApprove" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', unapproveProcedureVersion);">
                    <i class="glyphicon glyphicon-thumbs-down">
                        &nbsp;Unapprove
                    </i>
                </li>
                <li v-if="canRelease" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', releaseProcedureVersion);">
                    <i class="glyphicon glyphicon-thumbs-up">
                        &nbsp;Release
                    </i>
                </li>
                <li v-if="canUnRelease" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', unreleaseProcedureVersion);">
                    <i v-if="isReleased" class="glyphicon glyphicon-thumbs-down">
                        &nbsp;Unrelease
                    </i>
                </li>
                <li v-if="canObsolete" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', obsoleteProcedureVersion);">
                    <i class="glyphicon glyphicon-thumbs-up">
                        &nbsp;Obsolete
                    </i>
                </li>
                <li v-if="canUnObsolete" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', unobsoleteProcedureVersion);">
                    <i v-if="isObsolete" class="glyphicon glyphicon-thumbs-down">
                        &nbsp;Unobsolete
                    </i>
                </li>
                <li class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', saveAsPdf);">
                    <i class="glyphicon glyphicon-download">
                        &nbsp;PDF
                    </i>
                </li>
                <li v-if="canDeleteVersion" class="actionable" data-toggle="dropdown"
                    @click="showDropdown=false; $emit('tableEvent', deleteProcedureVersion);">
                    <i class="glyphicon glyphicon-trash">
                        &nbsp;Delete
                    </i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ProcedureVersionDropdownButton',
        data() {
            return {
                showDropdown: false,
            };
        },
        props: {
            index: {
                type: Number,
                default: undefined,
            },
            data: {
                type: Object,
            },
        },
        computed: {
            version() {
                return this.data.version;
            },
            description() {
                return this.data.version_description;
            },
            revisionDescription(){
                return this.data.institutional_release_id;
            },
            isWorkingVersion() {
                return this.version === 0;
            },
            canDeleteVersion() {
                return (!this.isWorkingVersion) && this.$can(['delete'], 'Admin');
            },
            isVersioned() {
                return this.data.status === 'VERSIONED';
            },
            isReleased() {
                return this.data.status === 'RELEASED';
            },
            isSubmitted() {
                return this.data.status === 'SUBMITTED';
            },
            isApproved() {
                return this.data.status === 'APPROVED';
            },
            isObsolete() {
                return this.data.status === 'OBSOLETE';
            },
            canSubmit() {
                return this.isVersioned && (this.$can(['update'], 'IMCM') || this.$can(['update'], 'Procedure') || this.$can(['update'], 'Admin'));
            },
            canUnSubmit() {
                return this.isSubmitted && (this.$can(['update'], 'IMCM') || this.$can(['update'], 'Procedure') || this.$can(['update'], 'Admin'));
            },
            canApprove() {
                return this.isSubmitted && (this.$can(['update'], 'Test_Lead') || this.$can(['update'], 'IMCM') || this.$can(['update'], 'Admin'));
            },
            canUnApprove() {
                return this.isApproved && (this.$can(['update'], 'Test_Lead') || this.$can(['update'], 'IMCM') || this.$can(['update'], 'Admin'));
            },
            canRelease() {
                return this.isApproved && (this.$can(['update'], 'IMCM') || this.$can(['update'], 'Admin'));
            },
            canUnRelease() {
                return this.isReleased && (this.$can(['update'], 'IMCM') || this.$can(['update'], 'Admin'));
            },
            canObsolete() {
                return this.isReleased && (this.$can(['update'], 'IMCM') || this.$can(['update'], 'Admin'));
            },
            canUnObsolete() {
                return this.isObsolete && (this.$can(['update'], 'IMCM') || this.$can(['update'], 'Admin'));
            },
            canEditMenu() {
                return !this.isWorkingVersion && (this.canSubmit || this.canUnSubmit || this.canApprove || this.canUnApprove || this.canRelease || this.canUnRelease || this.canObsolete || this.canUnObsolete); 
            },
            selectProcedureVersion() {
                return {
                    action: 'selectProcedureVersion',
                    data: {
                        version: this.version,
                    },
                };
            },
            submitProcedureVersion() {
                return {
                    action: 'submitProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    }
                };
            },
            unsubmitProcedureVersion() {
                return {
                    action: 'unsubmitProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    }
                };
            },
            approveProcedureVersion() {
                return {
                    action: 'approveProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    }
                };
            },
            unapproveProcedureVersion() {
                return {
                    action: 'unapproveProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    }
                };
            },
            releaseProcedureVersion() {
                return {
                    action: 'releaseProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    },
                };
            },
            unreleaseProcedureVersion() {
                return {
                    action: 'unreleaseProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    },
                };
            },
            obsoleteProcedureVersion() {
                return {
                    action: 'obsoleteProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    }
                };
            },
            unobsoleteProcedureVersion() {
                return {
                    action: 'unobsoleteProcedureVersion',
                    data: {
                        index: this.index,
                        version: this.version,
                    }
                };
            },
            saveAsPdf() {
                return {
                    action: 'saveAsPdf',
                    data: {
                        version: this.version,
                    },
                };
            },
            deleteProcedureVersion() {
                return {
                    action: 'deleteProcedureVersion',
                    data: {
                        version: this.version,
                    },
                };
            },
            editProcedureVersionMetaData() {
                return {
                    action: 'editProcedureVersionMetaData',
                    data: {
                        version: this.version,
                        description: this.description,
                        revisionDescription: this.revisionDescription
                    },
                };
            }
        },
        methods: {
            handleClickOutside(event) {
                if (!this.$el.contains(event.target)) {
                    this.showDropdown = false;
                }
            },
        },
        mounted() {
            document.addEventListener('click', this.handleClickOutside);
        },
        destroyed() {
            document.removeEventListener('click', this.handleClickOutside);
        },
    };
</script>

<style lang="scss" scoped>
    ul {
        margin-bottom: 0px;
        right: 0;
        list-style-type: none;
        padding: 12px;
    }
    .actionable {
        cursor: pointer;
    }
    .actionable:hover {
        background-color: yellow;
    }
</style>
