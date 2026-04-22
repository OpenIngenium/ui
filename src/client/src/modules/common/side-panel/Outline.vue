<template functional>
    <ul :id="`outline-container-${props.elementId}`" class="outline-left" :style="`width: ${320 - (props.depth * 20)}px;`">
        <li :id="`outline-${props.elementId}`" 
            :class="$options.getOutlineClasses(props)"
        >
            <span :style="$options.getStatusStyle(props)">
                <span v-if="props.breakpoint === 'ACTIVE'" class="glyphicon glyphicon-record" :style="`color:red; position: relative; left: ${$options.indentationPx(props)}px;`"></span>
                <span v-else class="glyphicon glyphicon-record" style="visibility: hidden;"></span>
                <i :class="$options.getStatusClass(props)" style="padding-left:15px"></i>
            </span>
            <a
                href="#/"
                @click="props.collapse(props.elementId, $event)">
                <i v-if="props.type == 'SECTION' || props.type == 'PROCEDURE_SECTION'" style="color:#749eea;" :class="$options.getSectionClass(props)"></i>
            </a>
            <a 
                href="#"
                @click="props.selectOrJumpToStep(props.element, $event)"
                :style="`${$options.getTitleStyle(props)}`"
                :class="$options.getOutlineTitleClasses(props)"
            >
                <b>{{ props.number }}</b>
                <span v-if="props.title">{{ props.title }}</span>
                <span v-else>No Title</span>
                <template v-for="tagId in $options.getValidTagIds(props.tagIds, props.tags)">
                    <div 
                        :key="tagId"
                        data-toggle="tooltip"
                        data-container="body"
                        data-placement="right"
                        data-trigger="hover" 
                        :title="$options.getTagTooltip(tagId, props.tags)"
                        class="glyphicon glyphicon-tag"
                        :style= "`color: ${$options.getTagColor(tagId, props.tags)}`">
                    </div>
                </template>   
            </a>
            <span 
                v-if="props.isAllowEdit"
                @click="props.toggleElementMenu(props.element, $event)"
                :style="`left: ${290 - (props.depth * 10)}px;`"
                class="glyphicon glyphicon-option-horizontal element-menu"
                id="context-menu-button">
            </span>
        </li>
        <div v-show="!props.collapsed">
            <template v-for="element in Object.values(props.children)">
                <outline 
                    :key="element.elem_id"
                    :isAllowEdit="props.isAllowEdit"
                    :current-step="props.currentStep"
                    :title="element.title"
                    :number="element.number"
                    :element="element"
                    :breakpoint="element.break_point"
                    :element-id="element.elem_id"
                    :status="element.execution && element.execution.meta_data ? element.execution.meta_data.status : '-'"
                    :children="element.children"
                    :modificationType="element.procedure_modification && element.procedure_modification.justification ? element.procedure_modification.justification.modification_type : ''"
                    :modificationStatus="element.procedure_modification_status"
                    :executable="element.executable"
                    :collapsed="element.collapsed"
                    :collapse="props.collapse"
                    :selectOrJumpToStep="props.selectOrJumpToStep"
                    :type="element.elem_type"
                    :tagIds="element.tag_ids"
                    :tags="props.tags"
                    :depth="props.depth + 1"
                    :toggleElementMenu="props.toggleElementMenu"
                    :filteredElementIdMap="props.filteredElementIdMap"
                    :selectedElementIds="props.selectedElementIds">
                </outline>
            </template>
        </div>
    </ul>
</template>

<script>
    import Outline from "./Outline.vue";
    import _ from 'lodash';
    import { getTagColor } from "../utils";

    export default {
        name: "Outline",
        components: {
            Outline
        },
        props: {
            elementId: {
                type: String,
                required: true
            },
            isAllowEdit: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
            },
            number: {
                type: String,
            },
            element: {
                type: Object
            },
            breakpoint: {
                type: String
            },
            children: {
                type: Object,
                required: true
            },
            modificationType: {
                type: String,
                default: ""
            },
            modificationStatus: {
                type: String,
                default: "NONE"
            },
            status: {
                type: String,
                default: "-"
            },
            collapsed: {
                type: Boolean,
                default: false
            }, 
            selectOrJumpToStep: {
                type: Function
            },
            collapse: {
                type: Function
            },      
            type: {
                type: String
            },
            tagIds: {
                type: Array
            },
            tags: {
                type: Object,
            },
            executable: {
                type: String,
                required: false
            },
            currentStep: {
                type: String
            },
            depth: {
                type: Number
            },
            toggleElementMenu: {
                type: Function
            },
            selectedElementIds: {
                type: Array,
            },
            filteredElementIdMap: {
                type: Object
            },
        },
        indentationPx(props) {
            return -10*props.depth + 5;
        },
        getValidTagIds(tagIds, tags) {
            return tagIds.filter(tagId => tags.hasOwnProperty(tagId));
        },
        // this property proxies the global function for this functional component
        getTagColor(tagId, tags) {
            return getTagColor(tagId, tags);
        },
        getOutlineClasses(props) {
            const classes = ['outline-common'];
            if (props.currentStep === props.elementId) {
                classes.push('current-element');
            }

            if (props.selectedElementIds && Array.isArray(props.selectedElementIds) && props.selectedElementIds.includes(props.elementId)) {
                classes.push('active-element');
            }
            return classes;
        },
        getOutlineTitleClasses(props) {
            const classes = [];

            if (!isStepVisible(props)) {
                classes.push('filtered-out-element');
            }
            return classes;
        },
        getStatusClass(props) {
            if (props.status === 'PASS' || props.status === 'OVERRIDE_PASS') {
                return 'glyphicon glyphicon-ok';
            } else if (props.status === 'FAIL' || props.status === 'OVERRIDE_FAIL') {
                return 'glyphicon glyphicon-remove';
            } else if (props.status === 'ERROR') {
                return 'glyphicon glyphicon-exclamation-sign';
            } else {
                return '';
            }
        },
        getSectionClass(props) {
            if (props.collapsed) {
                return 'glyphicon glyphicon-chevron-down';
            } else {
                return 'glyphicon glyphicon-chevron-up';
            }
        },
        getTitleStyle(props) {
            let color = '';
            let padding = '';
            let strikeThrough = props.modificationStatus === 'DELETED' ? 'text-decoration: line-through;' : '';

            if (props.modificationType === 'REDLINE') {
                color = 'color: red;';
            } else if (props.modificationType === 'BLUELINE') {
                color = 'color: #4da6ff;';
            } else if (props.type === 'SECTION' || props.type == 'PROCEDURE_SECTION') {
                color = 'color: black;';
            } else if (props.type === 'STEP' && (props.executable === 'EXECUTED' || props.executable === 'COMPUTED')) {
                color = 'color: black;';
            } else {
                color = 'color: grey;';
            }

            if (props.type === 'SECTION' || props.type == 'PROCEDURE_SECTION') {
                // no padding. but a caret icon is used.
            } else {
                // use a padding to align with section that has caret icon
                padding = 'padding-left: 15px;';
            }

            return color + padding + strikeThrough;
        },
        getStatusStyle(props) {
            const style = 'position: absolute; left: -35px;';
            if (props.status === 'PASS' || props.status === 'OVERRIDE_PASS') {
                return 'color: #019e11; ' + style;
            } else if (props.status === 'FAIL' || props.status === 'OVERRIDE_FAIL') {
                return 'color: #ff9900; ' + style;
            } else if (props.status === 'ERROR') {
                return 'color: #cf2928; ' + style;
            } else {
                return style;
            }
        },
        getTagTooltip(tagId, tags) {
            return tags.hasOwnProperty(tagId) ? `${tags[tagId].name}: ${tags[tagId].description}` : '';
        },
    };

    // Helpers
    function isStepVisible(props) {
        if (props.filteredElementIdMap) {
            return props.filteredElementIdMap.hasOwnProperty(props.elementId);
        } else {
            return false;
        }
    }
</script>

<style lang="scss" scoped>

.active-element {
    border: 2px solid fuchsia;
    padding: 2px;
}

.outline-common {
    width: 100%;
    position: relative;
    display: inline-flex;
}

.current-element {
    font-weight: bold;
    border: 3px solid rgb(255, 215, 0);
    padding-left: 5px;
}

.filtered-out-element {
    background-color: lightgray;
}

.element-menu {
    position: absolute;
    left: 300px;
    z-index: 0;
    cursor: pointer;
}
ul{
    margin-bottom:0px;
    padding-left:0px;
}
ul.outline-left {
    list-style: none;
    margin-left: 10px;       /* for step status icons */
    width:100%;
}
ul.outline-left .active {
    font-weight:bold;
}

@media print {
    ul.outline-left {
        height: auto;
    }
}
</style>
