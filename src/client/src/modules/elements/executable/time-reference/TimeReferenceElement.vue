// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-12" style="overflow-wrap: anywhere">
                        Set Time Constant: <span :class="modStyle(elementId, 'name')">{{ timeReferenceName }}</span>
                    </div>
                </div>
                <div v-if="isLevelThreeDetail" class="edit-container">
                    <div class="row">
                        <div class="col-xs-6">
                            <label class="required-field">Time Reference Name</label>
                            <input 
                                :disabled="disableFields"
                                v-model.trim="timeReferenceName"
                                v-on:keydown.enter.prevent="saveTimeReference"
                                @change="saveTimeReference"
                                :class="modStyle(elementId, 'name')">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "TimeReferenceElement",
        computed: {
            ...mapGetters([
                "executionId",
                "procedureDetails",
                "modStyle"
            ]),
            timeReferenceName: {
                get() { return this.getExecutionInputKey("name"); },
                set(value) { this.setElementInput("name", value); }
            }
        },
        methods: {
            ...mapActions([
                "populateTimeReferences"
            ]),
            async saveTimeReference() {
                await this.save();
            }
        }
    };
</script>
