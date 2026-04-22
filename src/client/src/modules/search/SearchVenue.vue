<template>
    <span>
        <template>
            <div v-if="this.data.executionDetails">
                {{this.data.executionDetails.venue_name}}
            </div>
            <div  v-else>
                N/A
            </div>
        </template>
    </span>
</template>

<script>
    export default {
        name: 'SearchVenue',
        props: {
            data: {
                type: Object,
            },
        },
        computed: {
            
        },
    };
</script>

<style lang="scss" scoped></style>
