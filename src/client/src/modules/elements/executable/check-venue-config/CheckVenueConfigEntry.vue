// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js
<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-3" style="overflow-wrap: anywhere">{{ configElemName ? configElemName : "Element Name" }}</div>
                <div class="col-xs-2">{{ fieldName }}</div>
                <div class="col-xs-2">{{ verificationCondition }}</div>
                <div class="col-xs-3">{{ verificationValue }}</div>
                <div class="col-xs-1" v-if="!isAuthoring">
                    {{ actualValue ? `Actual: ${actualValue}` : "___________" }}
                </div>
                <div class="col-xs-1 pull-right-xs">
                    <ing-popover placement="left" v-if="enableExecution">
                        <template slot="title">Venue Config Check Results</template>
                        <execution-full-results
                            slot="body"
                            :element-id="elementId"
                            :entry-index="index">
                        </execution-full-results>
                        <execution-status-check
                            :executed="getBoolElementKey('executed')"
                            :status="getExecutionResultsEntryKey('verification_status', String)"
                            component-type="entry">
                        </execution-status-check>
                    </ing-popover>
                </div>
            </div>
        </div>

        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-4">
                    <label>Element</label>
                    <input v-model.trim="configElemName"
                        @change="saveCheckVenueConfigEntry"
                        type="text"
                        :disabled="disableFields"
                        class="form-control execution-input">
                </div>
                <div class="col-xs-2">
                    <label>Field</label>
                    <select v-model="fieldName" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <option value="STATUS">STATUS</option>
                        <option value="TYPE">TYPE</option>
                    </select>
                </div>
                <div class="col-xs-2">
                    <label>Verif Condition</label>
                    <select v-model="verificationCondition" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <option value="EQUAL">EQUAL</option>
                        <option value="NOT_EQUAL">NOT_EQUAL</option>
                    </select>
                </div>
                <div class="col-xs-4">
                    <label>Verif Value</label>
                    <select v-model="verificationValue" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <!-- TYPE OPTIONS -->
                        <option v-if="isType" v-for="type in typeOptions" :key="type" :value="type" :selected="type === verificationValue">{{ type }}</option>
                        <!-- STATUS OPTIONS -->
                        <option v-if="!isType" v-for="status in statusOptions" :key="status" :value="status" :selected="status === verificationValue">{{ status }}</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "CheckVenueConfigEntry",
        data() {
            return {
                typeOptions: [
                    'BREADBOARD', 'EM', 'FLIGHT', 'SIMULATOR', 'OTHER'
                ],
                statusOptions: [
                    'INSTALLED', 'NOT_INSTALLED'
                ]
            };
        },
        watch: {
            isType: function(isType) {
                let newValue;
                if (isType) {
                    newValue = this.typeOptions[0];
                } else {
                    newValue = this.statusOptions[0];
                }
                this.editEntryInput({
                    elementId: this.elementId,
                    index: this.index,
                    key: "verification_value",
                    value: newValue
                });
            }
        },
        computed: {
            isType: function() {
                return this.fieldName === 'TYPE' ? true : false;
            },
            configElemName: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "config_elem_name");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "config_elem_name",
                        value: value
                    });
                }
            },
            fieldName: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "field_name");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "field_name",
                        value: value
                    });
                }
            },
            verificationCondition: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "verification_condition");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verification_condition",
                        value: value
                    });
                }
            },
            verificationValue: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "verification_value");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verification_value",
                        value: value
                    });
                }
            },
            actualValue: function() {
                return this.executionResultsEntryKey(this.elementId, this.index, "actual_value");
            },
        },
        methods: {
            saveCheckVenueConfigEntry() {
                this.save();
            }            
        }          
    };
</script>

<style lang="scss" scoped></style>
