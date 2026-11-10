<template>
    <div class="dropdown">
        <button
            title="Details"
            class="icon-button"
            id="dropdownMenuButton"
            data-toggle="dropdown">
            <i class="glyphicon glyphicon-eye-open"></i>
        </button>
        <div class="dropdown-menu">
            <div v-for="(value, name) in data" :key="name" class="dropdown-item">
                {{name}}: {{value}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ViDetailDropdown",
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                showDetail: false,
            };
        }
    };
</script>

<style lang="scss" scoped>
    .dropdown-menu {
        padding: 12px;
        min-width: 275px;
        right: 0;
        left: auto;
    }
    .icon-button {
        padding: 0;
        border: none;
        background-color: transparent;
        line-height: normal;
        opacity: 0.5;
        font-size: 18px;
        position: relative;
        font-family: 'Glyphicons Halflings', sans-serif;
    }
</style>
