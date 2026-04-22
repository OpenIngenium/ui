<template>
    <a :href="configUrl">
        <button type="button" class="btn btn-default">
            <span class="glyphicon glyphicon-pencil"></span>
            Edit
        </button>
    </a>
</template>

<script>

    import { mapGetters } from 'vuex';

    export default {
        name: 'Venue-Config-Buttons',
        props: {
            data: {
                type: Object
            }
        },
        computed: {
            ...mapGetters([
                "venueData",
            ]),
            configUrl: function() {
                return `/core/venues/config/configs/${this.venueData.type}/config/${this.venueData.venueId}`;
            },
        }
    };

</script>

