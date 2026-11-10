<template>
    <div>
        <div class="venue-dummy"></div>
        <div class="venue" style="padding:10px 5px 10px 5px">
            <!--Venue Title -->
            <h1 style="font-size:16px"><a :href="venueUrl">{{ venueData.name }}</a></h1>
            <h5 
                style="font-size:10px; margin-bottom:0px"
                :title="venueGroupLabel" 
            >
                {{ venueData.venueGroupName }}
            </h5>
            <hr style="margin-top:10px; margin-bottom:0px">

            <!--Venue Status -->
            <h2 style="margin-top:10px; font-size:12px">
                <venue-status-dot :status="venueData.status"></venue-status-dot>
                <font-awesome-icon :icon="serverIcon"></font-awesome-icon>
                {{ venueData.status | titlecase }}
                <span v-if="venueData.testConductor" class="glyphicon glyphicon-user"></span>&nbsp; {{ venueData.testConductor }}
            </h2>

            <!--Venue Inuse -->
            <template v-if="isInUse">
                <h3 v-if="venueData.startedOn" style="font-size:10px; margin-top:5px">
                    <span class="glyphicon glyphicon-time"></span>&nbsp; {{ venueData.startedOn | timesince }} ago
                    
                </h3>
            </template>

            <!--Venue Action Link -->
            <h4>
                <venue-action-link
                    :status="venueData.status"
                    :venue-group-id="venueData.venueGroupId"
                    :venue-id="venueData.venueId"
                    :execution-id="venueData.executionId"
                    :test-conductor="venueData.testConductor"
                    :type="venueData.type"
                    :current-user="currentUser"
                    :alignCenter="true"
                    @saveRecentVenue="saveVenueToLocalStorage">
                </venue-action-link>
            </h4>
        </div>
    </div>
</template>

<script>
    import { titlecase, timesince } from "../common/filters";
    import VenueStatusDot from "../common/VenueStatusDot.vue";
    import VenueActionLink from "../common/VenueActionLink.vue";
    import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
    import faServer from "@fortawesome/fontawesome-free-solid/faServer";
    import faWrench from "@fortawesome/fontawesome-free-solid/faWrench";
    import faFlask from "@fortawesome/fontawesome-free-solid/faFlask";
    import faRebel from "@fortawesome/fontawesome-free-brands/faRebel";

    export default {
        name: "VenueTile",
        components: {
            FontAwesomeIcon,
            VenueStatusDot,
            VenueActionLink
        },
        props: {
            venueData: {
                type: Object,
                required: true
            },
            currentUser: {
                type: String,
                required: true
            },
        },
        computed: {
            venueUrl: function() {
                return `/venues/${this.venueData.venueId}`;
            },
            venueGroupLabel: function() {
                return `Venue Group: ${this.venueData.venueGroupName}`;
            },
            isInUse: function() {
                return this.venueData.status === "IN_USE";
            },
            serverIcon: function() {
                switch(this.venueData.type) {
                    case "WSTS":
                        return faServer;
                    case "Testbed":
                        return faFlask;
                    case "ATLO":
                        return faWrench;
                    default:
                        return faRebel;
                }
            }
        },
        methods: {
            saveVenueToLocalStorage: function() {
                const savedRecentVenues = localStorage.getItem('recent-venues');
                
                if(savedRecentVenues){
                    let venues = [];
                    try {
                        venues = JSON.parse(savedRecentVenues);
                    } catch (error) {
                        // ignore and continue
                    }

                    if (!Array.isArray(venues)) {
                        venues = [];
                    }
                    
                    venues = [...[{venueId: this.venueData.venueId}], ...JSON.parse(savedRecentVenues)];
                    const uniqueRecentVenues = [...new Map(venues.map(item => [item['venueId'], item])).values()];
                    if(uniqueRecentVenues.length > 6) {
                        uniqueRecentVenues.pop();
                    }
                    localStorage.setItem('recent-venues', JSON.stringify(uniqueRecentVenues));

                } else {
                    localStorage.setItem('recent-venues', JSON.stringify([{venueId: this.venueData.venueId}]));
                }
            }
        },
        filters: {
            titlecase,
            timesince
        }
    };
</script>
