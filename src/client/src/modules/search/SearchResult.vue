<template>
    <span>
        <template>
            <h4 v-html="`${this.data.number} - ${this.data.title}`"></h4>
            <div v-html="this.data.description"></div>
        </template>
    </span>
</template>

<script>
    export default {
        name: 'SearchResult',
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
