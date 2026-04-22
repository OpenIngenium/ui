<template>
    <div class="dropdown">
        <button @click="showDropdown = !showDropdown"
            class="btn btn-default dropdown-toggle" 
            type="button" 
            data-toggle="dropdown" 
            aria-haspopup="true" 
            aria-expanded="false">
            Actions <span class="caret"></span>
        </button>
        <div v-if="showDropdown" class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
            <ul>
                <li 
                    class="actionable"
                    data-toggle="dropdown" 
                    @click="showDropdown = false; $emit('tableEvent', updateVenueGroup)"
                    >
                    <i class="glyphicon glyphicon-pencil"> Update
                    </i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: "AdminVenueGroupActionsDropdown",
        data() {
            return {
                showDropdown: false
            };
        },
        computed: {
            venueGroupId() {
                return this.data.venue_group_id;
            },
            updateVenueGroup() {
                return {
                    action: 'updateVenueGroup',
                    data: this.data
                };
            },
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