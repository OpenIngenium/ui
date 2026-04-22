<template>
    <div class="dropdown">
        <button @click="showDropdown = !showDropdown"
                class="btn btn-secondary dropdown-toggle"
                type="button" id="dropdownMenuButton"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="glyphicon glyphicon-option-vertical"></i>
        </button>
        <div v-if="showDropdown" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
            <ul>
                <li class="actionable" data-toggle="dropdown" 
                    @click="showDropdown=false; $emit('tableEvent', exportProcedureVersions);">
                    <i class="glyphicon glyphicon-save">
                        &nbsp;Export Procedure
                    </i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'ProcedureDropdownButton',
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
            procedureId() {
                return this.data.procedure_id;
            },
            exportProcedureVersions() {
                return {
                    action: 'exportProcedureVersions',
                    data: {
                        procedureId: this.procedureId,
                    },
                };
            },
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
