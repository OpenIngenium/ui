<template>
    <div class="inline-tag" :style="isSection ? 'margin-left: 10px' : ''">
        <ing-tag
            v-for="tag in tags"
            :key="tag.tag_id"
            v-on:deleteTag="handleDeleteTag"
            :remove="allowRemoveTag"
            :data="tag">
        </ing-tag>
        <select 
            v-if="allowAddTag"
            @change="handleAddTag"
            class="form-control input-sm" 
            :style="`margin-right: 5px; ${tags.length > 0 ? 'float:left;' : ''}`">
            <option 
                v-for="({tag_id, name}) in filteredAvailableTags"
                :key="tag_id"
                :value="tag_id">
                {{ name }}
            </option>
        </select>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import IngTag from './IngTag.vue';

    export default {
        name: "IngTagInline",
        components: {
            'ing-tag': IngTag
        },
        props: {
            availableTags: {
                type: Array,
                required: true
            },
            tags: {
                type: Array,
                required: true
            },
            isSection: {
                type: Boolean,
                required: true
            },
            mode: {
                type: String,
                required: true
            }
        },
        computed: {
            ...mapGetters([
                "procedureVersion",
                "isWorkingCopy"
            ]),
            filteredAvailableTags: function() {
                const tagIds = this.tags.map(tag => tag.tag_id) || [];
                return this.availableTags.filter(tag => !tagIds.includes(tag.tag_id));
            },
            allowRemoveTag: function() {
                return this.$route.query.hasOwnProperty('update') && this.isWorkingCopy;
            },
            allowAddTag: function() {
                return this.filteredAvailableTags.length > 1 && this.allowRemoveTag;
            },
        },
        methods: {
            handleAddTag: function(e) {
                this.$emit('addTag', e);
            },
            handleDeleteTag: function(e) {
                this.$emit('deleteTag', e);
            }
        }
    };

</script>

<style>
    .inline-tag {
        margin-top: 0px;
        margin-bottom: 5px;
    }

    .inline-tag select {
        width: 120px;
    }

</style>
