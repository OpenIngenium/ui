<template>
    <ul class="element-outline nav">
        <li :class="listClass">
            <input v-if="showCheckbox" :checked="isChecked" type="checkbox" @change="handleCheckboxChange">
            <i class="bold">{{ number }} -
                <span v-if="title" class="bold"> {{ title }}</span>
                <span v-else class="bold"> No Title </span>
            </i>
            <br>
            <span class="sub-list">{{elementMap.displayName}}</span>
        </li>
        <template v-for="element in children">
            <show-step
                :key="element.index"
                :element-id="element.elem_id"
                :title="element.title"
                :number="element.number"
                :type="element.elem_type==='STEP' ? element.step_type : element.elem_type"
                :children="element.children">
            </show-step>
        </template>
    </ul>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import {elementMapByType} from "../../../common/elem_types";

    export default {
        name: "ShowStep",
        props: {
            elementId: {
                type: String,
                required: true
            },
            title: {
                type: String,
                default: ""
            },
            number: {
                type: String,
                default: ""
            },
            type: {
                type: String,
                required: true
            },
            children: {
                type: Object,
                required: true
            },
        },
        computed: {
            ...mapGetters([
                "elementsAll",
                "selectedVisStepElementId",
                "getStepsByElementId",
            ]),
            parentElements: function() {
                return this.elementsAll.filter((elem) => {
                    return elem.parent_id === this.elementId;
                });
            },
            elementMap: function() {
                return elementMapByType(this.type);
            },
            showCheckbox: function() {
                return !(this.elementMap.category === "organization" || this.elementMap.category === "non_executable");
            },
            listClass: function() {
                let classname = '';
                if (this.elementMap.category === "non_executable") {
                    classname = "yellow";
                }
                else if (this.elementMap.category === "executable") {
                    classname = "green";
                }

                return classname;
            },
            steps: function() {
                return this.getStepsByElementId(this.selectedVisStepElementId);
            },
            isChecked: function() {
                let steps = this.getStepsByElementId(this.selectedVisStepElementId);
                if(!steps.length) { return false; }
                return steps.reduce(
                    (accu, step) => accu || step.elem_id === this.elementId,
                    false
                );
            }
        },
        methods: {
            ...mapActions([
                "addStepToStatusStep",
                "deleteStepFromStep",
            ]),
            handleCheckboxChange(event) {
                if(event.target.checked) {
                    this.addStepToStatusStep({elementId: this.elementId, title: this.title, number: this.number});
                }
                else {
                    this.deleteStepFromStep({elementId: this.selectedVisStepElementId, elem_id: this.elementId});
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
    ul.element-outline > li {
        margin-bottom: 5px;
    }
    ul.element-outline > li > a {
        color: black;
        position: relative;
        display: block;
        padding: 5px 15px;
    }
    .sub-list {
        font-weight: lighter;
        font-size: 10px;
        margin-left: 20px;
    }
    .yellow {
        color: rgb(191,156,67);
    }
    .green {
        color: rgb(85,91,52);
    }
    .bold {
        font-weight: bold;
    }
</style>
