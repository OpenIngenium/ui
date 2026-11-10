<template>
    <div>
        <div class="btn-group">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Actions <span class="caret"></span>
            </button>
            <ul class="dropdown-menu menu-items">
                <li 
                    @click="showDropdown = false; $emit('tableEvent', updateRole)"
                    class="actionable menu-item"
                    data-toggle="dropdown"
                >
                    <i class="glyphicon glyphicon-pencil menu-item-icon"></i> Update
                </li>
                <li 
                    @click="showDropdown = false; showDeleteRoleModal = true;"
                    class="actionable menu-item"
                    data-toggle="dropdown"
                >
                    <i class="glyphicon glyphicon-trash menu-item-icon"></i> Delete
                </li>
            </ul>
        </div>
        <ing-modal
            v-show="showDeleteRoleModal"
            @close="showDeleteRoleModal = false"
            size="medium">
            <template slot="title">
                <h4>Delete Role</h4>
            </template>

            <template slot="body">
                <div>Do you want to delete <strong>{{ data.name }}</strong>?</div>
                <div style="margin-top: 15px;">Description: {{data.description}}</div>
            </template>

            <template slot="footer">
                <button type="button" class="btn btn-primary" @click="$emit('tableEvent', deleteRole); showDeleteRoleModal = false">Confirm</button>
                <button type="button" class="btn pull-right" style="margin-left: 15px;" @click="showDeleteRoleModal = false">Cancel</button>
            </template>
        </ing-modal>
    </div>
</template>

<script>
    import IngModal from "../../common/IngModal.vue";

    export default {
        name: "RoleActionsDropdown",
        data() {
            return {
                showDropdown: false,
                showDeleteRoleModal: false,
            };
        },
        components: {
            'ing-modal': IngModal
        },
        computed: {
            roleId() {
                return this.data.roleId;
            },
            updateRole() {
                return {
                    action: 'updateRole',
                    data: this.data
                };
            },
            deleteRole() {
                return {
                    action: 'deleteRole',
                    data: this.data
                };
            }
        },
        props: {
            index: {
                type: Number,
                default: undefined
            },
            data: {
                type: Object
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

<style scoped>
    .menu-items {
        margin-bottom: 0px;
        right: 0;
        list-style-type: none;
        padding: 6px;
    }
    .menu-item {
        padding-left: 6px;
        padding-top: 3px;
        padding-bottom: 3px;
        margin-top: 3px;
        margin-bottom: 3px;
    }
    .menu-item-icon {
        margin-right: 6px;
    }
    .actionable {
        cursor: pointer;
    }
    .actionable:hover {
        background-color: yellow;
    }
</style>