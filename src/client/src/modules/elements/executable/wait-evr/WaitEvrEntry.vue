// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div>
        <ing-modal v-if="showEvrModal" @close="showEvrModal = false" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Lookup EVR</h4>
            </template>
            <template slot="body">
                <select-evr-table v-on:selectEvr="selectedEvr" :evr-type="this.evrTypeCategoriesReverse[this.evrType]"></select-evr-table>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-right"
                    @click="showEvrModal = false">
                    Cancel
                </button>
            </template>
        </ing-modal>

        <div v-if="isLevelTwoDetail" class="dynamic-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-9">
                        <span v-if="evrLevel">Level: <span :class="modStyle(elementId, `entries.${index}.evr_level`)">{{ evrLevel }}</span></span>
                        <span v-if="evrName"> Name: <span :class="modStyle(elementId, `entries.${index}.evr_name`)">{{ evrName }}</span></span>
                        <span v-if="evrId"> EVR: <span :class="modStyle(elementId, `entries.${index}.evr_id`)">{{ evrId }}</span></span>
                        <span v-if="messageFilter"> EVR: <span :class="modStyle(elementId, `entries.${index}.message_filter`)">{{ messageFilter }}</span></span>
                        (<span v-if="evrType" :class="modStyle(elementId, `entries.${index}.evr_type`)"> {{ evrType }}</span>
                         <span v-else v-text="'<evr_type>'" :class="modStyle(elementId, `entries.${index}.evr_type`)"></span>)
                    </div>
                    <div class="col-xs-2 pull-right">
                        <span v-if="verificationCondition" :class="modStyle(elementId, `entries.${index}.verification_condition`)">{{ verificationCondition }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.verification_condition`)" v-text="'<verification condition>'"></span>
                        <ing-popover placement="left" v-if="enableExecution">
                            <template slot="title">Wait EVR Results</template>
                            <execution-full-results
                            slot="body"
                            :element-id="elementId"
                            :entry-index="index">
                            </execution-full-results>
                            <execution-status-check
                                v-if="enableExecution"
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
                    <div class="col-xs-3">
                        <label class="required-field">EVR Type</label>
                        <select v-model="evrType"
                                @change="save"
                                class="form-control execution-input"
                                :disabled="disableFields"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, `entries.${index}.evr_type`)">
                            <option v-for="evrTypeOption in evrTypeOptions"
                                    :key="evrTypeOption"
                                    :value="evrTypeOption">
                                {{evrTypeOption}}
                            </option>
                        </select>
                    </div>
                    <div class="col-xs-2">
                        <label>EVR Level</label>
                        <input v-model.trim="evrLevel"
                               @change="saveEvrWaitEntry"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               style="margin-bottom: 10px;"
                               :class="modStyle(elementId, `entries.${index}.evr_level`)">
                    </div>
                    <div class="col-xs-2">
                        <label>EVR ID</label>
                        <input v-model.trim="evrId"
                               @change="saveEvrWaitEntry"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               style="margin-bottom: 10px;"
                               :class="modStyle(elementId, `entries.${index}.evr_id`)">
                    </div>
                    <div class="col-xs-5">
                        <button type="button" class="btn btn-info pull-right evr_lookup_button" @click="showEvrModal = true" :disabled="disableFields">
                            <span class="glyphicon glyphicon-search"></span>
                            <b>Lookup</b>
                        </button>
                        <label>EVR Name</label>
                        <ing-autocomplete
                            :value="evrName"
                            v-on:handleEvent="handleInput"
                            :callback="fetchEvrAutoCompleteCallback"
                            :items="this.evrs"
                            nameField="evr_name"
                            categoryField="evr_level"
                            descriptionField="evr_message"
                            enterByName="evr_name"
                            v-on:save="saveEvrWaitEntry"
                            dynamicWidth="five-hundred-width"
                            :disabled="disableFields"
                            :inputClasses="modStyle(elementId, `entries.${index}.evr_name`)"
                        ></ing-autocomplete>
                    </div>
                </div>
                <div class="row">
                    <div class="col-xs-6">
                        <label>Message Filter</label>
                        <input v-model="messageFilter"
                               @change="save"
                               :disabled="disableFields"
                               type="text"
                               class="form-control execution-input"
                               style="margin-bottom: 10px;"
                               :class="modStyle(elementId, `entries.${index}.message_filter`)">
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Verification Condition</label>
                        <select v-model="verificationCondition"
                                @change="save"
                                class="form-control execution-input"
                                :disabled="disableFields"
                                style="margin-bottom: 10px;"
                                :class="modStyle(elementId, `entries.${index}.verification_condition`)">
                            <option v-for="condition in verificationConditions"
                                    :key="condition"
                                    :value="condition">
                                {{condition}}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLevelTwoDetail && enableExecution && isExecuted && resultsEntry !== undefined && typeof(resultsEntry) === 'object'">
            <div class="empty-divider"></div>
            <div class="text-center font-small">Displaying {{evrResultsLength}} EVRs found</div>
            <table class="table" style="margin-bottom:20px;">
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Name</th>
                        <th>ERT</th>
                        <th>Message</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="data in evrData" :key="data.event_id">
                        <td v-if="data.evr_level">{{data.evr_level}}</td>
                        <td v-else v-text="'<empty>'"></td>

                        <td v-if="data.evr_name">{{data.evr_name}}</td>
                        <td v-else v-text="'<empty>'"></td>

                        <td v-if="data.ert">{{data.ert}}</td>
                        <td v-else v-text="'<empty>'"></td>

                        <td v-if="data.evr_message">{{data.evr_message}}</td>
                        <td v-else v-text="'<empty>'"></td>

                        <td>
                            <ing-popover placement="bottom">
                                <template slot="title">EVR Detail</template>
                                <ul slot="body">
                                    <li v-for="(val, key, idx) in data" :key="idx">
                                        <span class="result-key">{{key}}</span>:&nbsp;<span class="result-value">{{val}}</span>
                                    </li>
                                </ul>
                                <span :class="['glyphicon-eye-open', 'glyphicon']"></span>
                            </ing-popover>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import SelectEvrTable from "../query-evr/SelectEvrTable.vue";
    import IngAutocomplete from "../../../common/IngAutocomplete.vue";
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "WaitEvrEntry",
        props: ["elementId", "index", "mode"],
        data() {
            return {
                evrTypeCategories: {
                    SSE: ["SSE"],
                    FLIGHT: ["FSW_REALTIME", "FSW_RECORDED"],
                },
                evrTypeCategoriesReverse: {
                    FSW_REALTIME: "FLIGHT",
                    FSW_RECORDED: "FLIGHT",
                    SSE: "SSE",
                },
                verificationConditions: [
                    "EXISTS",
                    "DOES_NOT_EXIST",
                ],
                summaryMsgBackend: "",
                showEvrModal: false,
                msg: "this is something"
            };
        },
        components: {
            SelectEvrTable,
            IngAutocomplete
        },
        computed: {
            ...mapGetters([
                "evrs",
                'selectedSseDictionaryVersion',
                'selectedFlightDictionaryVersion',
                'modStyle'
            ]),
            evrTypeOptions: function() {
                return Object.keys(this.evrTypeCategoriesReverse);
            },
            evrName: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "evr_name"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "evr_name",
                        value: value
                    });
                }
            },
            evrId: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "evr_id"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "evr_id",
                        value: value
                    });
                }
            },
            evrLevel: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "evr_level"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "evr_level",
                        value: value
                    });
                }
            },
            messageFilter: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "message_filter"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "message_filter",
                        value: value
                    });
                }
            },
            evrType: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "evr_type"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "evr_type",
                        value: value
                    });
                }
            },
            verificationCondition: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "verification_condition"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "verification_condition",
                        value: value
                    });
                }
            },
            isExecuted: function() {
                return this.getBoolElementKey("executed");
            },
            verificationStatus: function() {
                return this.getExecutionResultsEntryKey(this.elementId, this.index, "verification_status");
            },
            resultsEntry: function() {
                return this.getExecutionResultsEntry();
            },
            evrData: function() {
                if (this.resultsEntry !== undefined && typeof(this.resultsEntry) === "object" && Array.isArray(this.resultsEntry.evr_data)) {
                    return this.resultsEntry.evr_data;
                }
                else {
                    return [];
                }
            },
            evrResultsLength: function() {
                if (this.resultsEntry !== undefined && typeof(this.resultsEntry) === "object" && Array.isArray(this.resultsEntry.evr_data)) {
                    return this.resultsEntry.evr_data.length;
                }
                else {
                    return undefined;
                }
            },
            evrEntryTooltipMsg: function() {
                let msg = "";

                msg += (msg ? "<br>": "") + "Name: " + (this.evrName ? this.evrName : "<empty>");
                msg += (msg ? "<br>": "") + "EVR: " + (this.evrId ? this.evrId : "<empty>");

                return msg;
            }
        },
        methods: {
            ...mapActions([
                "fetchFlightEvrs",
                "fetchSseEvrs"
            ]),

            handleInput: function(customEvent) {
                this.evrName = customEvent; 
            },

            fetchEvrAutoCompleteCallback: function( evr_name ) {
                const evrCategory = this.evrTypeCategoriesReverse[this.evrType];

                switch (evrCategory) {
                    case "SSE":
                        if (this.selectedSseDictionaryVersion) {
                            this.fetchSseEvrs({
                                dictionaryVersion: this.selectedSseDictionaryVersion,
                                filters: {
                                    evr_name: {
                                        value: evr_name
                                    }
                                },
                                wild: false,
                                limit: 6,
                            });
                        }

                        break; 
                    default:
                        if (this.selectedFlightDictionaryVersion) {
                            this.fetchFlightEvrs({
                                dictionaryVersion: this.selectedFlightDictionaryVersion, 
                                filters: {
                                    evr_name: {
                                        value: evr_name
                                    }
                                },
                                wild: false,
                                limit: 6,
                            });
                        }
                } 
            },
            selectedEvr: function(event) {
                this.showEvrModal = false;
                this.evrName = event.data.evr_name;
                this.save();
            },
            saveEvrWaitEntry() {
                try {
                    this.evrName = this.evrName.trim();
                } catch(err) {
                    //  ignore
                }
                this.save();
            }
        },
    };
</script>

<style>
    .custom-tooltip {
        display: block !important;
        z-index: 10000;
    }
    .custom-tooltip .custom-tooltip-inner {
        background: white;
        color: black;
        padding: 5px 10px 4px;
        border-radius: 16px;
        border-style: solid;
        border-width: 1px;
        border-color: black;
    }
    .custom-tooltip .custom-tooltip-arrow {
        width: 0px;
        height: 20px;
        border-style: solid;
        position: absolute;
        margin: 5px;
        border-color: black;
        z-index: 1000;
        background-color: white;
    }
    .custom-tooltip[x-placement^="bottom"] {
        margin-top: 5px;
    }
    .custom-tooltip[x-placement^="bottom"] .custom-tooltip-arrow {
        border-width: 0 5px 5px 5px;
        border-left-color: transparent !important;
        border-right-color: transparent !important;
        border-top-color: transparent !important;
        /*top: -5px;*/
        top: -20px;
        left: calc(50% - 5px);
        margin-top: 0;
        margin-bottom: 0;
    }
</style>

<style scoped>
    /* EVR-found table */
    div.empty-divider {
        min-height: 5px;
    }

    /* EVR select button */
    .evr_lookup_button {
        outline: none !important;
        position:relative;
        bottom:3px;
        border-radius: 5px;
        font-size: 14px;
        height: 25px;
        background-color: #d9edf7;
        color: #31708f;
        border-color: rgba(49,112,143, 0.25);
        width: 100px;
        padding: 0px 5px 0px 5px;
    }
    .evr_lookup_button  p {
        display: inline;
        font-weight: bold;
    }

    /* EVR pop over */
    ul {
        padding: 20px;
        list-style: none;
        cursor: text;
        color: #000000;
    }
    .result-value {
        font-weight: bold;
    }
</style>
