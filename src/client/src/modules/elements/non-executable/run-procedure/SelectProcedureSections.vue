<template>
    <div class="choose-steps-container">
        <div class="row">
            <div class="col-xs-6">
                <h5>Steps</h5>
            </div>
            <div class="col-xs-6">
                <div class="pull-right">
                    <a style="cursor: pointer; text-decoration: underline;"
                       class="choose-steps-select-all" @click="selectAllSteps()">Select All</a>
                    <span>&nbsp;|&nbsp;</span>
                    <a style="cursor: pointer; text-decoration: underline;"
                       class="choose-steps-unselect-all" @click="unselectAllSteps()">Unselect All</a>
                </div>
            </div>
        </div>
        <div class="row run-procedure-step-choose-steps">
            <div v-if="show" class="col-xs-5 scroll-section">
                <tags-procedure-select 
                    :tagSelections="tagSelections"
                    v-on:selectTag="handleSelectTag">
                </tags-procedure-select>
            </div>
            <div class="col-xs-7 scroll-section">
                <template v-for="step in steps">
                    <preview-outline
                        :key="step.elem_id"
                        :title="step.title"
                        :number="step.number"
                        :run-procedure-element-id="elementId"
                        :element-id="step.elem_id"
                        :tagSelections="tagSelections"
                        :tag_ids="step.tag_ids">
                    </preview-outline>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapActions} from "vuex";
    import PreviewOutline from "./PreviewOutline.vue";
    import TagsProcedureSelect from "./TagsProcedureSelect.vue";

    export default {
        name: "SelectProcedureSections",
        components: {
            PreviewOutline,
            'tags-procedure-select': TagsProcedureSelect
        },
        data() {
            return {
                steps: []
            };
        },
        created: function() {
            // temporary cache of steps used for display
            this.steps = this.populateSteps();
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
            show: {
                type: Boolean,
            }
        },
        computed: {
            ...mapGetters([
                "procedureOutlineNestedElementIds",
                "procedureOutlineElementsByParent",
                "elementsByParent",
                "executionInputKey",
                "runProcedureTagSelections"
            ]),
            childElements: function() {
                let elements =  this.procedureOutlineElementsByParent({
                    runProcedureElementId: this.elementId,
                    elementId: ''
                });
                return elements;
            },
            isOpenForFirstTime: function() {
                return this.executionInputKey(this.elementId, 'elements').length === 0;
            },
            tagSelections: function() {
                const tagSelections = this.runProcedureTagSelections(this.elementId);
                return tagSelections;
            }
        },
        methods: {
            ...mapActions([
                "selectAll",
                "unselectAll"
            ]),
            populateSteps: function() {
                if(this.steps.length === 0)
                    return this.childElements;
            },
            selectAllSteps: function() {
                this.selectAll({runProcedureElementId: this.elementId, tagSelections: this.tagSelections});
            },
            unselectAllSteps: function() {
                this.unselectAll({runProcedureElementId: this.elementId});
            },
            handleSelectTag: function(e) { this.$emit('selectTag', e); },
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
    .scroll-section {
        overflow-y:scroll; 
        max-height: 500px;
    }
</style>
