<template>
    <div>
        <div class="row">
            <div class="col-md-12 venue-display" style="min-height: 400px;">
                <template v-if="recentVenueAvailable">
                    <div :style="{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '5px'}">
                        <h2 :style="{marginRight: 'auto'}">Recent Venues</h2>
                    </div>

                    <div class="all-venues all-venues-tile">
                        <div class="row">
                            <div class="col-md-2 col-sm-2 col-xs-6" v-for="venue in recentVenues" :key="venue.venueId">
                                <venue-tile
                                    :venue-data="venue"
                                    :current-user="currentUser">
                                </venue-tile>
                            </div>
                        </div>
                    </div>
                    <hr>
                </template>
                
                <div :style="{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '5px', marginTop: '20px'}">
                    <h2 :style="{marginRight: 'auto'}">All Venues</h2>
                </div>
                <venues
                    :currentUser="currentUser">
                </venues>
                <spinner-modal v-if="isPending"></spinner-modal>
                <feedback-modal></feedback-modal>
                <ing-footer></ing-footer>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import Venues from "./Venues.vue";
    import { getUsername } from "../common/utils";
    import VenueTile from "./VenueTile.vue";
    import venueApi from "../../api/venue";
    import SpinnerModal from "../common/SpinnerModal.vue";
    import FeedbackModal from "../common/FeedbackModal.vue";
    import IngFooter from "../common/IngFooter.vue";

    export default {
        name: "Dashboard",
        components: {
            "venues": Venues,
            "venue-tile": VenueTile,
            "spinner-modal": SpinnerModal,
            "feedback-modal": FeedbackModal,
            "ing-footer": IngFooter
        },
        mounted: function() {
            this.loadRecentVenueFromLocalStorage();
        },
        data() {
            return {
                currentUser: getUsername(),
                recentVenues:[]
            };
        },
        computed: {
            ...mapGetters([
                "isPending",
            ]),
            recentVenueAvailable: function() {
                return this.recentVenues.length > 0 ? true : false;
            }
        },
        methods: {
            loadRecentVenueFromLocalStorage: async function() {
                const { venues } = await venueApi.getDashboardVenues({limit:10000});
                const savedRecentVenues = localStorage.getItem('recent-venues');

                if (savedRecentVenues) {
                    let savedVenues = [];
                    try {
                        savedVenues = JSON.parse(savedRecentVenues);
                    } catch (error) {
                        // ignore and continue
                    }

                    if (!Array.isArray(savedVenues)) {
                        savedVenues = [];
                    }
                    
                    savedVenues.forEach(savedVenue => {
                        venues.forEach(venue => {
                            if(venue.venue_id == savedVenue.venueId){
                                let venueObj = {
                                    'name': venue.name,
                                    'type': venue.type,
                                    'venueGroupId': venue.venue_group_id,
                                    'venueGroupName': venue.venue_group_name,
                                    'venueId': venue.venue_id,
                                    'status': venue.venue_status.status,
                                    'testConductor': venue.venue_status.test_conductor,
                                    'executionId': venue.venue_status.execution_id,
                                    'startedOn': venue.venue_status.started_on
                                };
                                this.recentVenues.push(venueObj);
                            }
                        });
                    });
                    
                }
            }
        }
    };
</script>

<style lang="scss" scoped>
</style>
