// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js
<template>
    <div v-if="isLevelTwoDetail" class="dynamic-element">
        <div @dblclick="toggleViewLevelTwoThree">
            <div class="row data-bar-element condensed">
                <div class="col-xs-2" style="overflow-wrap: anywhere">{{ configElemName ? configElemName : "Element Name" }}</div>
                <div class="col-xs-2">{{ type }}</div>
                <div class="col-xs-2">{{ status }}</div>
                <div class="col-xs-3">{{ serial | truncate(20) }}</div>
                <div class="col-xs-3">{{ notes | truncate(20) }}</div>
            </div>
        </div>

        <div v-if="isLevelThreeDetail" class="edit-container">
            <div class="row">
                <div class="col-xs-2">
                    <label>Element</label>
                    <input v-model.trim="configElemName"
                        @change="saveUpdateVenueConfigEntry"
                        type="text"
                        :disabled="disableFields"
                        class="form-control execution-input">
                </div>
                <div class="col-xs-2">
                    <label>Type</label>
                    <select v-model="type" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <!-- TYPE OPTIONS -->
                        <option v-for="option in typeOptions" :key="option" :value="option" :selected="option === type">{{ option }}</option>
                    </select>
                </div>
                <div class="col-xs-2">
                    <label>Status</label>
                    <select v-model="status" @change="$emit('save')" class="form-control execution-input" :disabled="disableFields">
                        <!-- STATUS OPTIONS -->
                        <option v-for="option in statusOptions" :key="option" :value="option" :selected="option === status">{{ option }}</option>
                    </select>
                </div>
                <div class="col-xs-3">
                    <label>Serial</label>
                    <input v-model.trim="serial"
                        @change="saveUpdateVenueConfigEntry"
                        type="text"
                        :disabled="disableFields"
                        class="form-control execution-input">
                </div>
                <div class="col-xs-3">
                    <label>Notes</label>
                    <textarea v-model="notes"
                        rows="3"
                        wrap="hard"
                        @change="$emit('save')"
                        type="text"
                        :disabled="disableFields"
                        class="form-control execution-input">
                    </textarea>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { truncate } from "../../../common/filters.js";

    export default {
        name: "UpdateVenueConfigEntry",
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
                        value: value
                    });
                }
            },
            type: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "type");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "type",
                        value: value
                    });
                }
            },
            status: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "status");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "status",
                        value: value
                    });
                }
            },
            serial: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "serial");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "serial",
                        value: value
                    });
                }
            },
            notes: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "notes");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "notes",
                        value: value
                    });
                }
            }
        },
        filters: {
            truncate: truncate
        },
        methods: {
            saveUpdateVenueConfigEntry() {
                this.save();
            }            
        }
    };
</script>

<style lang="scss" scoped></style>
