// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// entry-core-mixin.js

<template>
    <div>
        <div v-if="isLevelTwoDetail" class="dynamic-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <div class="col-xs-7">
                        APID: 
                        <span v-if="apidId" :class="modStyle(elementId, `entries.${index}.apid`)">{{ apidId }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.apid`)" v-text="'<APID ID>'"></span>
                        , Status:
                        <span v-if="productStatusFilter" :class="modStyle(elementId, `entries.${index}.product_status_filter`)">{{ productStatusFilter }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.product_status_filter`)" v-text="'<product_status_filter>'"></span>
                    </div>
                    <div class="col-xs-5">
                        <span v-if="verificationCondition" :class="modStyle(elementId, `entries.${index}.verification_condition`)">{{ verificationConditionIndicator }}</span>
                        <span v-else :class="modStyle(elementId, `entries.${index}.verification_condition`)" v-text="'<verification_condition>'"></span>
                        <span v-if="verificationConditionIndicator !== 'Record'" :class="modStyle(elementId, `entries.${index}.verification_value`)">{{ verificationValue }}</span>
                        <span v-else-if="verificationConditionIndicator === 'Record'" :class="modStyle(elementId, `entries.${index}.verification_value`)"></span>
                        <span v-else v-text="' <verification_value>'" :class="modStyle(elementId, `entries.${index}.verification_value`)"></span>
                        <execution-status-check
                            v-if="this.mode != 'authoring'"
                            :executed="getBoolElementKey('executed')"
                            :status="getExecutionResultsEntryKey('verification_status', String)"
                            component-type="entry">
                        </execution-status-check>
                    </div>
                </div>
            </div>
            <div v-if="isLevelThreeDetail" class="edit-container">
                <div class="row">
                    <div class="col-xs-2">
                        <label>APID</label>
                        <input v-model.trim.number="apidId"
                            @change="saveApidId"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, `entries.${index}.apid`)">
                    </div>
                    <div class="col-xs-4">
                        <label>Product Status</label>
                        <select v-model="productStatusFilter"
                            @change="save"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, `entries.${index}.product_status_filter`)">
                            <option v-for="(value, key) in productStatus"
                                :selected="value === productStatusFilter"
                                :key="key" :value="value">
                                {{ value }}
                            </option>
                        </select>
                    </div>
                    <div class="col-xs-3">
                        <label class="required-field">Verification Condition</label>
                        <select v-model="verificationCondition"
                            @change="$emit('save')"
                            :disabled="disableFields"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, `entries.${index}.verification_condition`)">
                            <option v-for="(conditionObj, value) in verificationConditionOptions"
                                :selected="value === verificationCondition"
                                :key="value" :value="value">
                                {{ conditionObj.label }}
                            </option>
                        </select>
                    </div>
                    <div class="col-xs-3" v-if="verificationCondition != 'RECORD'">
                        <label>Verification Value</label>
                        <input v-model.trim.number="verificationValue"
                            @change="saveVerificationValue"
                            :disabled="disableFields"
                            type="text"
                            class="form-control execution-input"
                            style="margin-bottom: 10px;"
                            :class="modStyle(elementId, `entries.${index}.verification_value`)">
                    </div>
                </div>
            </div>
        </div>
        <div v-if="getBoolElementKey('executed') && isLevelTwoDetail && apidResultsData.length > 0">
            <div class="empty-divider"></div>
            <div class="text-center font-small">Displaying {{ apidResultsData.length }} Products found</div>
            <table class="table" style="margin-bottom:15px;">
                <thead>
                    <tr>
                        <th>APID</th>
                        <th>Product Type</th>
                        <th>ERT</th>
                        <th>Size</th>
                        <th>File Path</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(product, index) in apidResultsData" :key="index">
                        <td>{{ product.apid }}</td>
                        <td>{{ product.apid_product_type }}</td>
                        <td>{{ product.ert }}</td>
                        <td>{{ product.file_size }}</td>
                        <td class="wrap-long-text">{{ product.file_path }}</td>
                        <td>
                            <ing-popover placement="bottom">
                                <template slot="title">Product Detail</template>
                                <ul slot="body" style="width: 300px">
                                    <li v-for="(val, key, idx) in product" :key="idx" style="word-break: break-all;">
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
    import {mapGetters} from "vuex";

    export default {
        name: "WaitDPEntry",
        data() {
            return {
                verificationConditionOptions: {
                    "GREATER_THAN": {label: "Greater Than", indicator: "Value >"},
                    "LESS_THAN": {label: "Less Than", indicator: "Value <"},
                    "GREATER_THAN_OR_EQUAL": {label: "Greater Than Or Equal", indicator: "Value >="},
                    "LESS_THAN_OR_EQUAL": {label: "Less Than Or Equal", indicator: "Value <="},
                    "EQUAL": {label: "Equal", indicator: "Value ="},
                    "RECORD": {label: "Record", indicator: "Record"}
                },
                productStatus: ['ALL', 'COMPLETE', 'PARTIAL']
            };
        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            apidId: {
                get() {
                    return this.executionInputEntryKey(this.elementId, this.index, "apid");
                },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "apid",
                        value: value
                    });
                }
            },
            productStatusFilter: {
                get() { return this.executionInputEntryKey(this.elementId, this.index, "product_status_filter"); },
                set(value) {
                    this.editEntryInput({
                        elementId: this.elementId,
                        index: this.index,
                        key: "product_status_filter",
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
            verificationConditionIndicator: function() {
                return this.verificationCondition ? this.verificationConditionOptions[this.verificationCondition].indicator : "";
            },
            apidResultsData: {
                get() {
                    if (this.mode != 'authoring') {
                        const products = this.executionResultsEntryKey(this.elementId, this.index, "products");
                        return products ? products : [];
                    } else {
                        return [];
                    }
                }
            }
        },
        methods: {
            saveApidId: function() {
                try {
                    this.apidId = parseInt(this.apidId);
                } catch (err) {
                    this.apidId = 0;
                }
                this.save();
            },
            saveVerificationValue: function() {
                try {
                    this.verificationValue = parseInt(this.verificationValue);
                } catch (err) {
                    this.verificationValue = 0;
                }
                this.save();
            }
        }
    };
</script>

<style scoped>
    .wrap-long-text {
        /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* This is the dangerous one in WebKit, as it breaks things wherever */
        word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;
    }
    .required-field {
        display: inline;
    }
</style>
