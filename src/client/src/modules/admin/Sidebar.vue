<template>
    <div class="col-sm-3 col-md-2">
        <div class="list-group">
            <a href="#" class="list-group-item disabled">
                <span class="glyphicon glyphicon-cog"></span>
                Manage
            </a>
            <a href="/admin/venue_groups" class="list-group-item">
                <span class="glyphicon glyphicon-th-large"></span>
                Venue Groups
            </a>
            <a href="/admin/venues" class="list-group-item">
                <span class="glyphicon glyphicon-oil"></span>
                Venues
            </a>
            <a href="/admin/procedurelabels" class="list-group-item">
                <span class="glyphicon glyphicon-tag"></span>
                Procedure Labels
            </a>
        </div>

        <div class="list-group">
            <a href="#" class="list-group-item disabled">
                <span class="glyphicon glyphicon-lock"></span>
                Permissions
            </a>
            <!-- <a href="/admin/permissions/groups" class="list-group-item">
                Groups
            </a> -->
            <a href="/admin/permissions/users" class="list-group-item">
                <span class="glyphicon glyphicon-user"></span>
                Users
            </a>
            <a href="/admin/permissions/roles" class="list-group-item">
                <span class="glyphicon glyphicon-eye-open"></span>
                Roles
            </a>
        </div>

        <div class="list-group">
            <a href="#" class="list-group-item disabled">
                <span class="glyphicon glyphicon-cog"></span>
                Preferences
            </a>
            <a href="/admin/preferences/personal" class="list-group-item">
                <span class="glyphicon glyphicon-user"></span>
                Personal
            </a>
        </div>

    </div>
</template>

<script>
    export default {
        name: "Sidebar"
    };
</script>

<style scoped>
</style>