<template>
    <a :href="getUrl">
        {{ getVenueName }}
    </a>
</template>

<script>
    export default {
        name: 'SelectVenueButton',
        props: {
            data: {
                venue_id: String, 
                venue_name: String
            },
        },
        computed: {
            getVenueName() {
                return this.data.venue_name;
            },
            getUrl() {
                return `/venues/${this.data.venue_id}`;
            },
        },
    };
</script>

<style lang="scss" scoped></style>
