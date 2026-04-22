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
                    @click="showDropdown = false; $emit('tableEvent', updateVenue)"
                    >
                    <i class="glyphicon glyphicon-pencil"> Update
                    </i>
                </li>
                <li 
                    v-if="this.data.status === 'IN_USE'"
                    class="actionable"
                    data-toggle="dropdown" 
                    @click="showDropdown = false; $emit('tableEvent', stopExecution)"
                    >
                    <i class="glyphicon glyphicon-stop"> Force Close
                    </i>
                </li>
                <li 
                    v-if="this.data.status === 'IN_USE'"
                    class="actionable"
                    data-toggle="dropdown" 
                    @click="showDropdown = false; $emit('tableEvent', forceSuspend)"
                    >
                    <i class="glyphicon glyphicon-pause"> Force Suspend
                    </i>
                </li>
                <li 
                    v-if="this.data.status !== 'IN_USE'"
                    class="actionable"
                    data-toggle="dropdown" 
                    @click="showDropdown = false; $emit('tableEvent', changeStatus)"
                    >
                    <i class="glyphicon glyphicon-tag"> Change Status
                    </i>
                </li>
                <li 
                    v-if="this.data.status !== 'IN_USE'"
                    class="actionable"
                    data-toggle="dropdown" 
                    @click="showDropdown = false; $emit('tableEvent', deleteVenue)"
                    >
                    <i class="glyphicon glyphicon-trash"> Delete
                    </i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: "AdminVenueActionsDropdown",
        data() {
            return {
                showDropdown: false
            };
        },
        computed: {
            venueId() {
                return this.data.venue_id;
            },
            updateVenue() {
                return {
                    action: 'updateVenue',
                    data: this.data
                };
            },
            stopExecution() {
                return {
                    action: 'stopExecution',
                    data: {
                        executionId: this.data.executionId,
                        startedOn: this.data.startedOn,
                        testConductor: this.data.testConductor,
                        name: this.data.name
                    },
                };
            },
            forceSuspend() {
                return {
                    action: 'forceSuspend',
                    data: {
                        executionId: this.data.executionId,
                        startedOn: this.data.startedOn,
                        testConductor: this.data.testConductor,
                        name: this.data.name
                    },
                };
            },
            deleteVenue() {
                return {
                    action: 'deleteVenue',
                    data: {
                        venueId: this.data.venueId,
                        name: this.data.name,
                        status: this.data.status
                    },
                };
            },
            changeStatus() {
                return {
                    action: 'changeStatus',
                    data: {
                        venueId: this.data.venueId,
                        executionId: this.data.executionId,
                        startedOn: this.data.startedOn,
                        testConductor: this.data.testConductor,
                        status: this.data.status
                    },
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