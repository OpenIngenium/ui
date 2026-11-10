<template>
    <div :style="{'text-align': textAlign}">
        <p>{{ createExecutionMsg }}</p>
        <div v-if="venueId">
            <a v-if="isAvailable && canExecute && !lockStartExecution"
                style="cursor: pointer;"
                @click="startExecution">
                <span :class="['glyphicon-play-circle', 'glyphicon']"></span>  
                Execute
            </a>
            <a v-if="isInUseByCurrentUser && canExecute"
                style="cursor: pointer;"
                @click="continueExecution">
                <span :class="['glyphicon-play-circle', 'glyphicon']"></span>  
                Continue
            </a>
            <a v-if="isInUseByOtherUser && canJoin"
                style="cursor: pointer;"
                @click="continueExecution">
                <span :class="['glyphicon glyphicon-log-in', 'glyphicon']"></span>
                Join
            </a>
        </div>
        <div v-if="venueId" style="margin-top: 8px">
            <a v-if="isInUseByOtherUser"
                style="cursor: pointer;"
                @click="watchExecution">
                <span :class="['glyphicon-eye-open', 'glyphicon']"></span>
                Watch Now
            </a>
        </div>
    </div>

</template>

<script>
    import { mapGetters, mapActions } from "vuex";
    import _ from "lodash";

    export default {
        name: "VenueActionLink",
        props: {
            status: {
                type: String,
                default: ""
            },
            venueGroupId: {
                type: String,
                default: ""
            },
            venueId: {
                type: String,
                default: ""
            },
            executionId: {
                type: String,
                default: ""
            },
            testConductor: {
                type: String,
                default: ""
            },
            currentUser: {
                type: String,
                default: ""
            },
            type: {
                type: String,
                default: ""
            },
            alignCenter: {
                type: Boolean,
                default: false,
            },
            data: {
                type: Object,
                default: undefined,
            }
        },
        data() {
            return {
                createExecutionMsg: "",
                lockStartExecution: false,
            };
        },
        created: function() {
            // This is work-around to make VenueActionLink working
            //   Venues.vue --> viewType === 'list'
            if (this.data) {
                this.status = _.get(this.data, 'actionProps.status', '');
                this.venueId = _.get(this.data, 'actionProps.venueId', '');
                this.executionId = _.get(this.data, 'actionProps.executionId', '');
                this.testConductor = _.get(this.data, 'actionProps.testConductor', '');
                this.currentUser = _.get(this.data, 'actionProps.currentUser', '');
                this.type = _.get(this.data, 'actionProps.type', '');
            }
        },
        computed: {
            ...mapGetters([
                "isPending",
                "canJoinExecution",
            ]),
            textAlign: function() {
                if (this.alignCenter) {
                    return 'center';
                }
                return 'left';
            },
            isAvailable: function() {
                return this.status === "AVAILABLE";
            },
            isInUse: function() {
                return this.status === "IN_USE";
            },
            isInUseByCurrentUser: function() {
                return this.isInUse && this.testConductor === this.currentUser;
            },
            isInUseByOtherUser: function() {
                return this.isInUse && this.testConductor !== this.currentUser;
            },
            canExecute: function() {
                return this.$can(['create'], `Execution:${this.type}#${this.venueGroupId}`);
            },
            canJoin: function() {
                return this.canJoinExecution(this.executionId);
            }
        },
        methods: {
            ...mapActions([
                "createExecution",
                "setPending",
            ]),
            redirectToWatchPage: function() {
                this.$router.push({ path: `/execute/as_run/${this.executionId}`});
                this.$router.go();
            },
            redirectToExecutionPage: function(executionId) {
                this.$router.push({ path: `/execute_spa/${this.venueId}/${executionId}`});
                this.$router.go();
            },
            startExecution: async function() {
                if (this.isPending) {
                    return;
                }
                this.setPending(true);
                this.createExecutionMsg = "Creating Execution...";
                this.$emit('saveRecentVenue');
                const response =  await this.createExecution({venueId: this.venueId});
                if (response && response.status === 200) {
                    this.createExecutionMsg = "Execution Created.";
                    this.redirectToExecutionPage(response.data.execution_id);
                } else {
                    this.createExecutionMsg = "Failed to start an execution. The venue may be in use.";
                }
                this.setPending(false);
            },
            continueExecution: function() {
                this.$emit('saveRecentVenue');
                this.redirectToExecutionPage(this.executionId);
            },
            watchExecution: async function() {
                this.$emit('saveRecentVenue');
                this.redirectToWatchPage();
            },
        }
    };
</script>
