<template>
    <ing-modal @close="close()" size="medium-large">
        <template slot="title">
            <h4>
            {{ title }}
            </h4>
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="venueGroup">
                    Venue Group (Used for Execution Permissions)
                </label>
                <select id="venue_group_id" class="form-control" :value="venueGroupId" @change="onChangeVenueGroupId" :disabled="editMode">
                    <option value=""></option>
                    <option 
                        v-for="(venueGroup, idx) in activeVenueGroups" 
                        :key="idx"
                        :value="venueGroup.venueGroupId">
                        {{ venueGroup.name }}
                    </option>
                </select>
                <div v-if="editMode" class="venue-group-note">
                    Note: Cannot change venue group for an existing role. Create a new role if needed.
                </div>
            </div>
            <div class="form-group">
                <label for="name">
                    Role Name
                </label>
                <input id="name" class="form-control" v-model.lazy="name">
            </div>
            <div class="form-group">
                <label for="description">
                    Description
                </label>
                <textarea id="description" class="form-control" v-model.lazy="description">
                </textarea>
            </div>
            <div class="form-group">
                <label for="description">
                    Permissions
                </label>
                <div class="flex-row">
                    <div class="flex-column-2">
                        <ul>
                            <li v-if="!venueGroupId" style="list-style-type: none;">
                                <input id="permission_3" type="checkbox" value="basic" v-model.lazy="checkedPermissions"> 
                                <label for="permission_3" class="control-label">basic</label>
                            </li>
                            <li v-if="!venueGroupId" style="list-style-type: none;">
                                <input id="permission_2" type="checkbox" value="author" v-model.lazy="checkedPermissions"> 
                                <label for="permission_2" class="control-label">author</label>
                            </li>
                            <li v-if="!venueGroupId" style="list-style-type: none;">
                                <input id="permission_11" type="checkbox" value="test_lead" v-model.lazy="checkedPermissions"> 
                                <label for="permission_11" class="control-label">test_lead</label>
                            </li>
                            <li v-if="venueGroupId" style="list-style-type: none;">
                                <input id="permission_8" type="checkbox" value="execute:wsts" v-model.lazy="checkedPermissions"> 
                                <label for="permission_8" class="control-label">execute:wsts</label>
                            </li>
                            <li v-if="venueGroupId" style="list-style-type: none;">
                                <input id="permission_7" type="checkbox" value="execute:testbed" v-model.lazy="checkedPermissions"> 
                                <label for="permission_7" class="control-label">execute:testbed</label>
                            </li>
                        </ul>
                    </div>
                    <div class="flex-column-2">
                        <ul>
                            <li v-if="venueGroupId" style="list-style-type: none;">
                                <input id="permission_6" type="checkbox" value="execute:sit" v-model.lazy="checkedPermissions"> 
                                <label for="permission_6" class="control-label">execute:sit</label>
                            </li>
                            <li v-if="venueGroupId" style="list-style-type: none;">
                                <input id="permission_5" type="checkbox" value="execute:other" v-model.lazy="checkedPermissions"> 
                                <label for="permission_5" class="control-label">execute:other</label>
                            </li>
                            <li v-if="!venueGroupId" style="list-style-type: none;">
                                <input id="permission_4" type="checkbox" value="config_mgmt" v-model.lazy="checkedPermissions"> 
                                <label for="permission_4" class="control-label">config_mgmt</label>
                            </li>
                            <li v-if="!venueGroupId" style="list-style-type: none;">
                                <input id="permission_9" type="checkbox" value="imcm" v-model.lazy="checkedPermissions"> 
                                <label for="permission_9" class="control-label">imcm</label>
                            </li>
                            <li v-if="!venueGroupId" style="list-style-type: none;">
                                <input id="permission_1" type="checkbox" value="admin" v-model.lazy="checkedPermissions"> 
                                <label for="permission_1" class="control-label">admin</label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="name">
                    LDAP Groups
                </label>
                <div class="row" style="padding-top: 0px;">
                    <div class="form-group col-md-9">
                        <vue-typeahead-bootstrap
                            class="mb-4"
                            v-model="roleGroupsQuery"
                            :data="ldapGroups"
                            :serializer="item => item"
                            :screen-reader-text-serializer="item => `Ingenium group ${item}`"
                            highlightClass="special-highlight-class"
                            @hit="newGroup = $event"
                            :minMatchingChars="2"
                            placeholder="Search LDAP groups"
                            inputClass="special-input-class"
                            :disabledValues="(newGroup ? [newGroup] : [])"
                            @input="lookupLdapGroups"
                        >
                            <template slot="suggestion" slot-scope="{ data }">
                                <div class="d-flex align-items-center">
                                    <div>{{ data }}</div>
                                </div>
                            </template>
                        </vue-typeahead-bootstrap>
                    </div>
                    <div class="form-group col-md-3">
                        <div class="btn-group" role="group" style="float:right;">
                            <button 
                                @click="addNewGroup"
                                :disabled="disableAddNewGroupButton"
                                type="button"
                                class="btn btn-primary">
                                <i class="glyphicon glyphicon-plus"></i>
                                &nbsp;Add
                            </button>
                        </div>
                    </div>
                </div>
                <div v-for="(group, idx) in groups" class="participant" :key="idx">
                    {{ group }}
                    <span v-on:click="removeGroup(group)" class="close">x</span>
                </div>
                <div v-if="duplicateGroupError" class="row">
                    <div class="col-md-6" style="padding-top: 2px;">
                    </div>
                    <div class="form-group col-md-12">
                    <label class="error-message">Duplicate group: {{ this.newGroup }}</label>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="name">
                    Users
                </label>
                <div class="row"  style="padding-top: 0px;">
                    <div class="form-group col-md-9">
                        <vue-typeahead-bootstrap
                            class="mb-4"
                            v-model="roleUsersQuery"
                            :data="ldapUsers"
                            :serializer="item => item.username"
                            :screen-reader-text-serializer="item => `Ingenium user ${item.username}`"
                            highlightClass="special-highlight-class"
                            @hit="newUser = $event"
                            :minMatchingChars="2"
                            placeholder="Search JPL Usernames"
                            inputClass="special-input-class"
                            :disabledValues="(newUser ? [newUser.username] : [])"
                            @input="lookupLdapUsers"
                        >
                            <template slot="suggestion" slot-scope="{ data }">
                                <div class="d-flex align-items-center">
                                    <div>{{data.username}}</div>
                                </div>
                            </template>
                        </vue-typeahead-bootstrap>
                    </div>
                    <div class="form-group col-md-3">
                        <div class="btn-group" role="group" style="float:right;">
                            <button 
                                @click="addNewUser"
                                :disabled="disableAddNewUserButton"
                                type="button"
                                class="btn btn-primary">
                                <i class="glyphicon glyphicon-plus"></i>
                                &nbsp;Add
                            </button>
                        </div>
                    </div>
                </div>
                <div v-for="(user, idx) in users" class="participant" :key="idx">
                    {{ user }}
                    <span v-on:click="removeUser(user)" class="close">x</span>
                </div>
            </div>
            <div v-if="duplicateUserError" class="row">
                <div style="padding-top: 2px;">
                </div>
                <div class="form-group col-md-12">
                    <label class="error-message">Duplicate username: {{ this.newUser.username }}</label>
                </div>
            </div>
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                Error:
                <pre>{{ errorMessage }}</pre>
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
                :disabled="!enableSubmitButton"
                @click="submit()">
                Submit
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngModal from "../../common/IngModal.vue";
    import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap';
    import authApi from "../../../api/auth";
    import {debounce, isEqual} from 'lodash';

    export default {
        name: "AddRoleModal",
        props: {
            prepopulateData: {
                type: Object
            }
        },
        components: {
            'ing-modal': IngModal,
            'vue-typeahead-bootstrap': VueTypeaheadBootstrap,
        },
        data() {
            return {
                venueGroupId: '',
                roleUsersQuery: '',
                roleGroupsQuery: '',
                newUser: {
                    username: ''
                },
                newGroup: '',
                ldapUsers: [],
                ldapGroups: [],
                name: '',
                description: '',

                checkedPermissions: [],
                groups: [],
                users: [],
                roleId: '',
                duplicateUserError: false,
                duplicateGroupError: false,

                errorMessage: ''
            };
        },
        mounted() {
            if (this.editMode) {
                this.venueGroupId = this.prepopulateData.venueGroupId || '';
                this.name = this.prepopulateData.name;
                this.description = this.prepopulateData.description;
                this.checkedPermissions = this.prepopulateData.checkedPermissions;
                this.groups = this.prepopulateData.groups;
                this.users = this.prepopulateData.users;
                this.roleId = this.prepopulateData.roleId;
            }
        },
        computed: {
            ...mapGetters([
                'permissionNameToId',
                'activeVenueGroups',
            ]),
            disableAddNewUserButton: function() {
                return this.newUser.username === '' ? true : false;
            },
            disableAddNewGroupButton: function() {
                return this.newGroup === '' ? true : false;
            },
            enableSubmitButton: function() {
                // Submit button 
                // 1. Role name should be not be empty
                // 2. There must be some changes made from the initial state of the dialog
                return this.name.trim() && this.hasChanges;
            },
            hasChanges: function() {
                const currentData = {
                    name: this.name,
                    description: this.description,
                    checkedPermissions: this.checkedPermissions,
                    groups: this.groups,
                    users: this.users,
                    roleId: this.roleId
                };
                return !isEqual(this.prepopulateData, currentData);
            },
            editMode: function() {
                return Object.keys(this.prepopulateData).length > 0;
            },
            title: function() {
                return this.editMode ? 'Edit Role' : 'Add Role';
            },
            checkedPermissionIds: function() {
                const permissionIds = [];
                for (const permissionName of this.checkedPermissions) {
                    const permissionId = this.permissionNameToId[permissionName];
                    if (permissionId) {
                        permissionIds.push(permissionId);
                    } else {
                        console.warn(`permission name was not found. name: ${permissionName}`);
                    }
                }
                return permissionIds;
            } 
        },
        methods: {
            ...mapActions([
                "editRole",
                "createRole",
                "fetchRoles"
            ]),
            onChangeVenueGroupId: function(event) {
                this.venueGroupId = event.target.value;
            },
            resetFields: function() {
                this.venueGroupId = '';
                this.name = '';
                this.description = '';
                this.checkedPermissions = [];
                this.groups = [];
                this.users = [];
                this.newUser.username = '';
                this.newUser.displayName = '';
                this.newGroup = '';
                this.roleUsersQuery = '';
                this.roleGroupsQuery = '';
                this.duplicateUserError = false;
                this.duplicateGroupError = false;
                this.errorMessage = '';
            },
            close: function() {
                this.resetFields();
                this.$emit('close');
            },
            removeUser: async function(userId) {
                this.users = this.users.filter(user => user != userId);
            },
            removeGroup: async function(groupName) {
                this.groups = this.groups.filter(group => group != groupName);
            },
            checkIfDuplicateUserExists: function(userId) {
                return this.users.some(user => user === userId);
            },
            checkIfDuplicateGroupExists: function(groupName) {
                return this.groups.some(group => group === groupName);
            },
            addNewUser: async function() {
                if(!this.checkIfDuplicateUserExists(this.newUser.username)){
                    if (this.newUser.username) {
                        this.users = [...this.users, this.newUser.username];
                    }
                    this.roleUsersQuery = '';

                    // undisable the submit button
                    this.duplicateUserError = false;
                } else {
                    this.duplicateUserError = true;
                }
            },
            addNewGroup: async function() {
                if(!this.checkIfDuplicateGroupExists(this.newGroup)){
                    if (this.newGroup) {
                        this.groups = [...this.groups, this.newGroup];
                    }
                    this.roleGroupsQuery = '';

                    // undisable the submit button
                    this.duplicateGroupError = false;
                } else {
                    this.duplicateGroupError = true;
                }
            },
            submit: async function() {
                try {
                    this.errorMessage = '';
                    if (this.editMode) {
                        // EDIT
                        const roleId = this.roleId;
                        const res = await this.editRole({
                            roleId,
                            role: {
                                venue_group_id: this.venueGroupId,
                                name: this.name,
                                description: this.description,
                                permissions: this.checkedPermissionIds,
                                groups: this.groups,
                                users: this.users
                            }
                        });
                    } else {
                        // CREATE
                        const res = await this.createRole({
                            venue_group_id: this.venueGroupId,
                            name: this.name,
                            description: this.description,
                            permissions: this.checkedPermissionIds,
                            groups: this.groups,
                            users: this.users
                        });
                    }

                    // handle roles refresh one level up where pagination settings are available
                    this.$emit('refreshRoles');

                    this.errorMessage = "";
                    this.close();
                } catch (err) {
                    this.errorMessage = err;
                }
            },
            lookupLdapUsers: debounce(function() {
                this.duplicateUserError = false;
                authApi.getLdapUsers(this.roleUsersQuery)
                    .then(data => {
                        this.ldapUsers = data;
                    }
                );
            }, 500),
            lookupLdapGroups: debounce(function() {
                this.duplicateGroupError = false;
                authApi.getLdapGroups(this.roleGroupsQuery)
                    .then(data => {
                        this.ldapGroups = data;
                    }
                );
            }, 500),
        },
    };
</script>

<style scoped>
    .venue-group-note {
        color:gray;
        font-size: smaller;
        margin-left: 1em;
    }
    .new-participant {
        margin: 15px;
    }
    .new-participant label {
        color: #545454;
    }
    .new-participant input {
        font-weight: normal;
    }
    .new-participant button {
        float: right;
    }
    .button-spacing {
        margin-right: 5px;
    }
    .error-message {
        color:red !important;
    }
    .participant {
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 10px;
        color: #333;
        display: inline-block;
        margin: 0 2px;
        padding: 5px 8px 5px 10px;
        white-space: nowrap;
    }
    .close {
        float: right;
        font-size: 21px;
        font-weight: 700;
        padding-left: 3px;
        line-height: 1;
        color: #000;
        text-shadow: 0 1px 0 #fff;
        filter: alpha(opacity=20);
        opacity: .2;
    }
    .special-input-class {
        background-color: black !important;
        color: white !important;
    }
    .special-highlight-class {
        font-weight: 900;
        color: #585656;
    }

    .flex-row {
        display: flex;
    }

    /* Create two equal columns that sits next to each other */
    .flex-column-2 {
        flex: 50%;
        padding: 10px;
    }
</style>