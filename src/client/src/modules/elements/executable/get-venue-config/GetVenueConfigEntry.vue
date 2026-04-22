// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js
<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-3" style="overflow-wrap: anywhere">{{ configElemName ? configElemName : "Element Name" }}</div>
                <div>
                    <div v-if="!isAuthoring" class="col-xs-2">{{ type }}</div>
                    <div v-if="!isAuthoring" class="col-xs-2">{{ status }}</div>
                    <div v-if="!isAuthoring" class="col-xs-3">{{ serial }}</div>
                </div>
                <div class="col-xs-2"></div>
            </div>
        </div>

        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-3">
                    <label>Element</label>
                    <input v-model.trim="configElemName"
                        @change="saveGetVenueConfigEntry"
                        type="text"
                        :disabled="disableFields"
                        class="form-control execution-input">
                </div>
                <div class="col-xs-3"></div>
                <div class="col-xs-3"></div>
                <div class="col-xs-3"></div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "GetVenueConfigEntry",
        computed: {
            configElemName: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "config_elem_name");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "config_elem_name",
                        value
                    });
                }
            },
            type: {
                get() {
                    return this.executionResultsEntryKey(this.elementId, this.index, "type");
                }
            },
            status: {
                get() {
                    return this.executionResultsEntryKey(this.elementId, this.index, "status");
                }
            },
            serial: {
                get() {
                    return this.executionResultsEntryKey(this.elementId, this.index, "serial");
                }
            }
        },
        methods: {
            saveGetVenueConfigEntry() {
                this.save();
            }            
        }        
    };
</script>

<style lang="scss" scoped></style>
