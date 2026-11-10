<template>
    <ul class="element-outline nav">
        <li>
            <input type="checkbox" v-model="selected" :disabled="disabled">
            <i>{{ number }} -
                <span v-if="title"> {{ title }}</span>
                <span v-else> No Title </span>
                <ing-tag 
                    :v-if="tag_ids.length > 0"
                    v-for="tag in appliedTags" 
                    :key="tag.tag_id" 
                    :data="tag"></ing-tag>
            </i>
        </li>
        <template v-for="step in steps">
            <preview-outline
                :key="step.elem_id"
                :title="step.title"
                :number="step.number"
                :run-procedure-element-id="runProcedureElementId"
                :tag_ids="step.tag_ids"
                :tag-selections="tagSelections"
                :element-id="step.elem_id">
            </preview-outline>
        </template>
    </ul>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngTag from "../../IngTag.vue";
    import _ from 'lodash';

    export default {
        name: "PreviewOutline",
        components: {
            // Recursive component: resolved by its own `name` option instead of a
            // self-import, which would create a circular module dependency that
            // webpack 5's strict ESM bindings reject (TDZ on the default export).
            'ing-tag': IngTag
        },
        props: {
            runProcedureElementId: {
                type: String,
                required: true
            },
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
            tagSelections: {
                type: Array
            },
            tag_ids: {
                type: Array
            }
        },
        created() {
            this.steps = this.populateSteps();
        },
        data() {
            return {
                steps: []
            };
        },
        watch: {
        },
        computed: {
            ...mapGetters([
                "procedureOutlineElementsByParent",
                "selectedElementIdsByParent",
                // from run-procedure-store
                "isSelected"
            ]),
            selected: {
                get() {
                    return this.isSelected({ runProcedureElementId: this.runProcedureElementId, elementId: this.elementId });
                },
                set(value) {
                    this.toggleStep({runProcedureElementId: this.runProcedureElementId, elementId: this.elementId});
                }
            },
            appliedTags: function() {
                //console.log('appliedTags');
                if(this.tagSelections) {
                    return this.tagSelections.filter(tagSelection => this.tag_ids.includes(tagSelection.tag_id));
                }
                return [];
            },            
            selectedTags: function() {
                if(this.tagSelections) {
                    return this.tagSelections.filter(tagSelection => tagSelection.selected && this.tag_ids.includes(tagSelection.tag_id));
                }
                return [];
            },
            disabled: function() {
                // ignore non tagged steps
                if(this.tag_ids.length == 0) { 
                    return false;
                } else {
                    if(this.selectedTags && this.selectedTags.length > 0) {
                        const selectedTagIds = this.selectedTags
                            .filter(tag => tag.selected)
                            .map(tag => tag.tag_id);

                        return _.difference(this.tag_ids, selectedTagIds).length > 0;
                    } else {
                        return true;
                    }
                }
            },
            childElements: function() {
                let elements = this.procedureOutlineElementsByParent({
                    runProcedureElementId: this.runProcedureElementId,
                    elementId: this.elementId
                });
                return elements;
            }
        },
        methods: {
            ...mapActions([
                "toggleStep"
            ]),
            populateSteps: function() {
                if(this.steps.length === 0) {
                    return this.childElements;                    
                }
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
