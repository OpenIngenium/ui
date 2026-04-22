<template>
    <ul class="element-outline nav">
        <li>
            <i>{{ number }} -
                <span v-if="title"> {{ title }}</span>
                <span v-else> No Title </span>
                <ing-tag v-for="tag in filteredTags" :key="tag.tag_id" :data="tag"></ing-tag>
            </i>
        </li>
        <template v-for="childElement in childElements">
            <selected-elements-outline
                v-if="childElement.selected"
                :key="childElement.elem_id"
                :title="childElement.title"
                :number="childElement.number"
                :tags="tags"
                :tag_ids="childElement.tag_ids"
                :run-procedure-element-id="runProcedureElementId"
                :element-id="childElement.elem_id">
            </selected-elements-outline>
        </template>
    </ul>
</template>

<script>
    import { mapGetters } from "vuex";
    import SelectedElementsOutline from "./SelectedElementsOutline.vue";
    import IngTag from "../../IngTag.vue";

    export default {
        name: "SelectedElementsOutline",
        components: {
            SelectedElementsOutline,
            'ing-tag': IngTag
        },
        props: {
            elementId: {
                type: String,
                required: true
            },
            title: {
                type: String,
            },
            number: {
                type: String,
            },
            runProcedureElementId: {
                type: String,
                required: true
            },
            tags: {
                type: Array
            },
            tag_ids: {
                type: Array
            }
        },
        computed: {
            ...mapGetters([
                "procedureSelectedOutlineElementsByParent",
            ]),
            filteredTags: function() {
                if(this.tags && this.tag_ids) {
                    return this.tags.filter(tag => this.tag_ids.includes(tag.tag_id));
                }
                return [];
            },
            childElements: function() {
                const elems = this.procedureSelectedOutlineElementsByParent({
                    runProcedureElementId: this.runProcedureElementId,
                    elementId: this.elementId
                });
                return elems;
            }
        }
    };
</script>

<style lang="scss" scoped>
    ul.element-outline {
        list-style-type: none;
        padding-left: 5px;
    }
    ul.element-outline ul.element-outline {
        list-style-type: none;
        padding-left: 25px;
    }
    ul.element-outline > li > a {
        color: black;
        position: relative;
        display: block;
        padding: 5px 15px;
    }
</style>
