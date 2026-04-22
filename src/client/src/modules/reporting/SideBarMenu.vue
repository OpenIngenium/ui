<template>
    <div class="list-group">
        <button type="button" class="list-group-item list-group-item-action active" aria-current="true">
            <i class="glyphicon glyphicon-file">&nbsp;Difference Report</i>
        </button>
    </div>
</template>

<script>
    export default {
        name: "SideBarMenu",
    };
</script>

<style lang="scss" scoped>
    .nav-link.active {
        background-color: #eee;
        color: black;
    }
</style>
