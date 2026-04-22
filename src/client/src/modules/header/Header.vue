<template>
    <div class="header-wrapper">
        <div class="header">
            <div v-if="isLoggedIn" class="header-login">
                <a @click="toggleUserProperties" style="color: black; cursor: pointer; float: right; margin-top: 15px;">Welcome, {{ username }} <span class="caret"></span></a>
                <div v-if="userExpanded" class="user-dropdown">
                    <b>Roles</b>
                    <ul class="list-two">
                        <li v-for="role in roles" :key="role.role">{{ role.venue_group_id ? `${role.role} (${venueGroupNameMap[role.venue_group_id]})` : `${role.role}` }}</li>
                    </ul>
                    <b>Permissions</b>
                    <ul class="list-two">
                        <li v-for="scope in scopes" :key="scope.scope">{{ scope.venue_group_id ? `${scope.scope} (${venueGroupNameMap[scope.venue_group_id]})` : `${scope.scope}` }}</li>
                    </ul>
                    <a :href="logOutUrl" style="float: right;" class="btn btn-danger"><span class="glyphicon glyphicon-off"></span> Log Out</a>
                </div>
            </div>

            <div v-if="isLoggedIn">
                <div class="header-navigation-wrapper">
                    <ul class="header-navbar">
                        <li style="padding-right: 175px;">
                            <img src="/static/images/ingenium-logo.png" style="width: 40px; float: left; margin-right: 25px; margin-left: 0px; margin-top: -8px; position: relative;">
                            <span class="project-title"><b>INGENIUM</b> | {{ applicationTitle }} ({{ applicationVersion }})</span>
                        </li>
                        <li><a :class="{
                            'current-page': isDashboard 
                        }" href="/">Dashboard</a></li>
                        <li><a :class="{
                            'current-page': isProcedures
                        }" href="/procedures/">Procedures</a></li>
                        <li><a :class="{
                            'current-page': isExecutions
                        }" href="/executions/">Executions</a></li>
                        <li><a :class="{
                            'current-page': isProjectConfig
                        }" @click="this.toggleSubMenu" style="cursor: pointer;">Project Configuration <span class="caret"></span></a>
                        </li>
                        <li><a :class="{
                            'current-page': isReporting
                        }" href="/reporting">Reports</a></li>
                        <li><a :class="{
                            'current-page': isSearch
                        }" href="/search">Search</a></li>
                        <li v-if="isAdmin"><a :class="{ 
                            'current-page': isAdminPage
                        }" href="/admin">Admin</a></li>
                    </ul>
                </div>
                <div v-if="expanded" class="header-subnavigation-wrapper">
                    <ul class="header-navbar">
                        <li><a href="/project_configuration/flight">Flight Dictionaries</a></li>
                        <li><a href="/project_configuration/sse">SSE Dictionaries</a></li>
                        <li><a href="/project_configuration/vis">Verification Items</a></li>
                        <li><a href="/project_configuration/custom_scripts">Scripts</a></li>
                    </ul>
                </div>
            </div>
            <div v-else>
                <div class="header-navigation-wrapper">
                    <ul class="header-navbar">
                        <li style="padding-right: 100px;">
                            <img src="/static/images/ingenium-logo.png" style="width: 40px; float: left; margin-right: 25px; margin-left: 0px; margin-top: -8px; position: relative;">
                            <span class="project-title"><b>INGENIUM</b> | {{ applicationTitle }} ({{ applicationVersion }})</span>
                        </li>
                        <li><a href="/login">Sign In</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { 
        getUsername, 
        getRoles, 
        getUserScopes,
        isLoggedIn,
        isAdmin
    } from '../common/utils';

    import { version } from '../../assets/ing_version.json';
    import { mapGetters, mapActions } from "vuex";

    export default {
        name: "Header",
        data() {
            return {
                expanded: false,
                userExpanded: false,
                applicationVersion: version,
            };
        },
        mounted() {
            if (this.isLoggedIn) {
                this.getVenueGroups({limit: 1000});
            }
        },
        watch: {},
        computed: {
            ...mapGetters([
                'venueGroupNameMap',
            ]),
            applicationTitle() {
                return window.applicationTitle;
            },
            isLoggedIn() {
                return isLoggedIn();
            }, 
            isAdmin() {
                return isAdmin();
            },
            username() {
                return getUsername();
            },
            roles() {
                return getRoles();
            },
            scopes() {
                return getUserScopes();
            },
            isDashboard() {
                return this.currentRoute() == '';
            },
            isProcedures() {
                return this.currentRoute() == 'procedures';
            },
            isExecutions() {
                return this.currentRoute() == 'executions';
            },
            isProjectConfig() {
                return this.currentRoute() == 'project_configuration';
            },
            isReporting() {
                return this.currentRoute() == 'reporting';
            },
            isSearch() {
                return this.currentRoute() == 'search';
            },
            isAdminPage() {
                return this.currentRoute() == 'admin';
            },
            logOutUrl() {
                return `/logout/?next=${window.location.pathname}${window.location.search}`;
            }
        },
        methods: {
            ...mapActions([
                'getVenueGroups',
            ]),
            toggleSubMenu: function() {
                this.expanded = !this.expanded;
            },
            toggleUserProperties: function() {
                this.userExpanded = !this.userExpanded;
            },
            currentRoute: function() {
                return this.$router.currentRoute.path.split('/')[1];
            }
        },
        created() {}
    };
</script>

<style scoped>
    .project-title {
        font-size: 20px;
        color:black;
    }
    .header {
        /* padding: 5px; */
        background-color: #a0c5f8;
    }
    .header-login {
        float: right;
        margin-right: 10px;
    }
    .header-wrapper {
        position: fixed;
        background-color: white;
        box-shadow: 0 6px 6px rgb(0 0 0 / 20%);
        width: 100%;
        z-index: 100;
        left: 0px;
        top: 0px;
    }
    .header-navbar {
        padding-left: 5px;
        margin-bottom: 0px;
    }
    .header-navbar li {
        display: inline;
    }
    /* .header-navbar li a {
        padding: 0px 20px;
    } */
    .header-navbar li a {
        padding: 0px 20px;
        color: black;
    }
    .header-navigation-wrapper {
        /* background-color: white; */
        padding: 5px;
        /* border-top: 2px solid lightgray; */
        /* width: 100%; */
        padding: 10px 0px;
    }
    .header-subnavigation-wrapper {
        background-color: white;
        padding: 5px;
        border-top: 2px solid lightgray;
        width: 100%;
        padding: 10px 0px;
    }
    .project-title-subheader {
        float: right;
        padding: 5px;
    }
    .breadcrumb-subheader {
        background-color: white;
    }
    .user-dropdown {
        background-color: white;
        position: absolute;
        top: 40px;
        right: 10px;
        z-index: 101;
        padding: 15px;
        box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
    }
    .user-dropdown .list-two {
        column-gap: 1px;
        column-fill: auto;
        list-style: disc inside;
        columns: 2;
        -webkit-columns: 2;
    }
    .current-page {
        text-decoration: underline !important;
        color: black !important;
        font-weight: bold !important;
    }
</style>