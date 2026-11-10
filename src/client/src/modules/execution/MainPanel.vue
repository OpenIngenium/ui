<template>
<!-- Padding bottom 135px gives room for drop target for steps -->
    <div class="col-xs-12" id="main-panel" style="padding-left:0px; padding-bottom:135px; padding-right: 38px;">
        <venue-details
            v-if="venueId"
            :is-as-run="false"
            :venueId="venueId">
        </venue-details>
        <ing-element-wrapper></ing-element-wrapper>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div>
</template>

<script>
    import VenueDetails from "./VenueDetails.vue";
    import IngFooter from "../common/IngFooter.vue";

    export default {
        name: "MainPanel",
        components: {
            VenueDetails,
            'ing-footer': IngFooter
        },
        props: {
            execution: {
                required: true
            }
        },
        computed: {
            venueId: function() {
                return this.execution ? this.execution.venue_id : '';
            }
        },
    };
</script>

<style lang="css" scoped>
#main-panel {
    margin-top: 100px;
    overflow: hidden;
}
@media print {
    .col-xs-12 {
        width:100%;
        zoom:75%;
    }
}
</style>
