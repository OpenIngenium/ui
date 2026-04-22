<template>
    <input type="checkbox" :value="data.tag_id" @change="handleCheckTag" :checked="data.selected">
</template>

<script>
    export default {
        name: "SelectTagCheckbox",
        components: { },
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        methods: { 
            handleCheckTag: function(event) {
                this.$emit('tableEvent', {
                    tag_id: this.data.tag_id,
                    selected: event.target.checked
                });
            }
        }
    };
</script>

<style lang="scss" scoped>
    .tags-selected b {
        color: #545454;
        margin: 0;
    }
    .tag-well {
        background-color: #F7F7F7;
        margin-top: 4px;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 2px;
        font-size: 12px;
        color: #797979;
    }
</style>