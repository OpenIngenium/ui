<template>
    <ol class="steps_list" id="steps_toolbar">
        <li v-for="group in paletteGroups" :key="group">
            <div class="row header">
                <div class="col col-sm-12 dotted-line">
                    <h4>{{group}}</h4>
                </div>
            </div>
            <ol v-if="canParticipate" class="steps_list">
                <li v-for="(element, index) in usedElementsByPaletteGroup(group)" :key="index"
                    :class="`step step_${element.category}`"
                    v-drag-and-drop="{ elementPath: element.path, draggableType: 'element', scriptMeta: element.scriptMeta }">
                    <div class="step_type">{{ element.displayName }}</div>
                    <span class="step_move_button" id="step_move_icon"></span>
                </li>
            </ol>
            <ol v-else class="steps_list disabled">
                <li v-for="(element, index) in usedElementsByPaletteGroup(group)" :key="index"
                    :class="`step step_${element.category}`">
                    <div class="step_type">{{ element.displayName }}</div>
                </li>
            </ol>
        </li>
    </ol>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import { elementsByPaletteGroup, getElementCategories } from '../elem_types';

    export default {
        name: "StepPalette",
        data() {
            return {
                
            };
        },
        created() {
            this.fetchStepPaletteBuiltIn();
            this.fetchStepPaletteCustom();
        },
        computed: {
            ...mapGetters([
                "canParticipate",
                "stepPaletteBuiltIn",
                "stepPaletteCustom",
            ]),
            paletteGroups: function() { 
                return getElementCategories(this.stepPaletteBuiltIn, this.stepPaletteCustom);
            }
        },
        methods: {
            ...mapActions([
                "fetchStepPaletteBuiltIn",
                "fetchStepPaletteCustom",
            ]),
            usedElementsByPaletteGroup(group) {
                return(elementsByPaletteGroup(group, this.stepPaletteBuiltIn, this.stepPaletteCustom));
            },
            
        }
    };
</script>

<style lang="scss" scoped>
    div.step_empty_list_message {
        display: none;
        text-align: center;
        font-size: 24px;
        opacity: 0.35;
        margin: -130px 0 130px;
    }

    ol.steps_list,
    ol.steps_list ol.step_nested,
    ol.steps_list ol.steps_list{
        list-style-type: none;
        padding: 0;
    }

    ol.steps_list li {
        margin: 0;
    }

    ol.steps_list li.step {
        border: 1px solid;
        border-radius: 4px;
        padding: 5px;
    }

    ol.steps_list li.step:hover {
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
    }

    ol.steps_list li.step:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }
    
    ol.steps_list li.step .step_number {
        display: block;
        float: left;
        font-size: 16px;
        font-weight: bold;
        margin-right: 5px;
    }

    ol.steps_list li.step .step_number:empty {
        display: none;
    }

    ol.steps_list li.step .step_title {
        display: inline-block;
        font-size: 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 80%;
    }

    ol.steps_list li.step .step_type {
        display: inline;
        font-size: 14px;
    }

    ol.steps_list li.step.step_organization {
        color: #31708f;
        border-color: #31708f;
    }

    ol.steps_list li.step.step_non_executable {
        color: #8a6d3b;
        border-color: #8a6d3b;
    }

    ol.steps_list li.step.step_executable {
        color: #3c763d;
        border-color: #3c763d;
    }

    ol.steps_list li.step.step_organization hr {
        border-color: #98b7c7; /* 50% opacity #31708f */
    }

    ol.steps_list li.step.step_non_executable hr {
        border-color: #c4b69d; /* 50% opacity #8a6d3b */
    }

    ol.steps_list#steps_toolbar {
        margin: 0;
    }

    ol.steps_list#steps_toolbar li {
        margin-top: 5px;
    }

    ol.steps_list#steps_toolbar li.step.step_organization {
        background-color: #d9edf7;
        margin:5px 0px;
    }

    ol.steps_list#steps_toolbar li.step.step_non_executable {
        background-color: #fcf8e3;
    }

    ol.steps_list#steps_toolbar li.step.step_executable {
        background-color: #dff0d8;
    }

    ol.steps_list#steps_toolbar li.step .step_type:before {
        display: inline-block;
        font-size: 10px;
        margin-right: 5px;
        text-align: center;
        width: 20px;
        border-radius: 50%;
        height: 20px;
        padding-top: 3px;
    }

    ol.steps_list#steps_toolbar li.step.step_organization .step_type:before {
        background-color: #31708f;
        color: #ecf6fb;
        content: 'O';
    }

    ol.steps_list#steps_toolbar li.step.step_non_executable .step_type:before {
        background-color: #8a6d3b;
        color: #fdfbf1;
        content: 'V';
    }

    ol.steps_list#steps_toolbar li.step.step_executable .step_type:before {
        background-color: #3c763d;
        color: #eff7eb;
        content: 'E';
    }

    ol#steps_toolbar hr {
        border-top: 1px solid #999;
        border-bottom: 1px solid #eee;
    }

    .header {
        margin:0px;
        padding:0px;
        margin-bottom:8px;
        margin-top:10px;
    }

    .header .dotted-line {
        margin:0px;
        padding:0px;
        border-bottom:2px dotted #c8c8c8;
    }

    .disabled {
        pointer-events: none;
        opacity: 0.6;
    }

</style>
