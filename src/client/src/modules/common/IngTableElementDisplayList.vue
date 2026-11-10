<template>
    <div class="wrap">
        <div v-for="item in data[field]" :key="item.id">
            {{ item }}
        </div>
    </div>
</template>

<script>
    export default {
        name: 'DisplayListElements',
        props: {
            data: Object,
            field: String
        },
    };
</script>

<style lang="scss" scoped>
    .wrapper {
        display: flex
    }
</style>
