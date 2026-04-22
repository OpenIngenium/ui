<template>
    <div class="row">
        <div class="col-md-9 col-lg-8">
            <div>
                <h2>Status</h2>
                <venue-status-dot :include-label="true" :status="venueData.venueStatus.status"></venue-status-dot>
                <template v-if="isInUse">
                    <p>{{timeSinceExecutionStarted}} by {{testConductor}}</p>
                </template>
            </div>
            <execution-history-table
                :venueId="venueId">
            </execution-history-table>
        </div>
        <div class="col-md-3 col-lg-4">
            <h2>Actions </h2>
            <!-- {{venueData.venueId}} -->
            <venue-action-link
                :status="venueData.venueStatus.status"
                :venue-group-id="venueData.venueGroupId"
                :venue-id="venueId"
                :execution-id="venueData.venueStatus.executionId"
                :test-conductor="venueData.venueStatus.testConductor"
                :type="venueData.type"
                :current-user="currentUser"
                :alignCenter="false">
            </venue-action-link>
            <h2 class="table-header">Venue Detail</h2>
            <table class="table">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <td>{{venueData.name}}</td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td>{{venueData.description}}</td>
                    </tr>
                    <tr>
                        <th>Venue Address</th>
                        <td>{{venueData.ampcsAddress}}</td>
                    </tr>
                    <tr>
                        <th>Location</th>
                        <td>{{venueData.location}}</td>
                    </tr>
                    <tr>
                        <th>Type</th>
                        <td>{{venueData.type}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>

    import { mapActions, mapGetters } from 'vuex';
    import ExecutionHistoryTable from "./ExecutionHistoryTable.vue";
    import VenueStatusDot from "../common/VenueStatusDot.vue";
    import { getUsername } from "../common/utils";
    import { timesince, commonDateTime } from "../common/filters";
    import VenueActionLink from "../common/VenueActionLink.vue";

    export default {
        name: 'Venue-Detail-Page',
        components: {
            'execution-history-table': ExecutionHistoryTable,
            'venue-status-dot': VenueStatusDot,
            'venue-action-link': VenueActionLink,
        },
        data() {
            return {
                currentUser: getUsername(),
                venueId: this.$route.params.venueId
            };
        },
        computed: {
            ...mapGetters([
                "venueData",
                "historyElements"
            ]),

            executionUrl: function() {
                return `/execute_spa/${this.venueId}/${this.executionId}`;
            },
            timeSinceExecutionStarted: function() {
                return timesince(this.venueData.venueStatus.startedOn);
            },
            latestConfigHistory: function() {
                // Each config history element has an array attribute called 'changes'.
                // 'Changes' contains an arbitrary number of venue configuration changes
                // This function returns the first five changes across as many elements as needed
                // Each change is associated with the timestamp of its parent
                let latestChanges = [];

                for (let historyElementsIdx = 0; historyElementsIdx < this.historyElements.length; historyElementsIdx++) {
                    let history = this.historyElements[historyElementsIdx];
                    let time = history.time;

                    for (let historyElementChangesIdx = 0; historyElementChangesIdx < history.changes.length; historyElementChangesIdx++) {
                        let change = history.changes[historyElementChangesIdx];
                        let changeObject = {
                            time: commonDateTime(time)
                        };

                        changeObject.fieldName = change.fieldName;
                        changeObject.newValue = change.newValue;
                        changeObject.oldValue = change.oldValue || 'null';
                        latestChanges.push(changeObject);

                        if (latestChanges.length > 4) {
                            return latestChanges;
                        }
                    }
                }
                return latestChanges;
            },
            venueMessage: function() {
                if (this.isAvailable) {
                    return "Execute";
                } else if (this.isInUse && this.currentUserIsExecuting) {
                    return "Continue Executing";
                } else {
                    return "Watch Now";
                }
            },
            venueIcon: function() {
                if (this.isAvailable) {
                    return "glyphicon-play-circle";
                } else if (this.isInUse && this.currentUserIsExecuting) {
                    return "glyphicon-play-circle";
                } else {
                    return "glyphicon-eye-open";
                }
            },
            currentUserIsExecuting: function() {
                return this.testConductor === this.currentUser;
            },
            testConductor: function() {
                return this.venueData.venueStatus.testConductor;
            },
            isAvailable: function() {
                return this.venueData.venueStatus.status === "AVAILABLE";
            },
            isInUse: function() {
                return this.venueData.venueStatus.status === "IN_USE";
            },
            executionId: function() {
                return this.venueData.venueStatus.executionId;
            },
            configUrl: function() {
                return `/core/venues/config/configs/${this.venueData.type}/config/${this.venueId}`;
            },
            historyUrl: function() {
                return `/core/venues/config/configs/${this.venueData.type}/history/${this.venueId}`;
            }
        },
        created: function() {
            this.fetchVenueData({
                venueId: this.venueId
            });
        },
        methods: {
            ...mapActions([
                "fetchVenueData",
            ])
        }
    };

</script>

<style lang="scss" scoped>
    .table-header {
        margin: 20px 0;
    }
</style>
