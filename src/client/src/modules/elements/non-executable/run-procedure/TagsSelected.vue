<template>
    <div class="tags-selected" v-if="tags.length > 0">
        <b>Tags Selected</b>
        <div class="tag-well">
            <ing-tag v-for="tag in tags" :key="tag.tag_id" :data="tag"></ing-tag>
        </div>
    </div>
</template>

<script>
    import IngTag from "../../IngTag.vue";

    export default {
        name: "TagsSelected",
        components: {
            'ing-tag': IngTag
        },
        props: {
            tags: {
                type: Array,
                required: true
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