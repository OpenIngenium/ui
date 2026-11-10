// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div @dblclick="toggleViewLevelTwoThree">
                <div class="row data-bar-element condensed">
                    <froalaView class="col-xs-7" v-model="verificationText" :class="modStyle(elementId, 'verificationText')"></froalaView>
                    <div class="col-xs-3" :class="modStyle(elementId, 'verifiedBy')">{{verifiedBy}}<br><span :class="modStyle(elementId, 'timeVerified')">{{timeVerified}}</span></div>
                    <div class="col-xs-1">
                        <select v-model="verificationStatus"
                            @change="saveManualVerification"
                            :disabled="canDisableExecuteField"
                            class="form-control execution-input"
                            style="padding: 3px; font-size: 10px; height: 25px; width: 75px;"
                            :class="modStyle(elementId, 'verificationStatus')">
                            <option value="PASS">Pass</option>
                            <option value="FAIL">Fail</option>
                        </select>
                    </div>
                    <div v-if="!isAuthoring" class="col-xs-1">
                        <execution-status-check
                            v-if="enableExecution"
                            :executed="executed"
                            :status="getExecutionMetaDataKey('status')">
                        </execution-status-check>
                    </div>
                </div>
            </div>
            <div v-if="isLevelThreeDetail" class="edit-container">
                <div class="row">
                    <div class="col-xs-12">
                        <label class="required-field">Verification Text</label>
                        <!-- 
                            Note that verification text has a special behavior that it is editable both during authoring and execution.
                            disableFields will be always true for execution page.
                            canDisableExecuteField will be always true for authoring page.
                            disableFields && canDisableExecuteField will allow edit both for authoring and execution.
                        -->
                        <ing-editable-froala
                            :elementId="elementId"
                            promptText="<<Click to add verification text>>"
                            :value="verificationText"
                            v-on:save="updateVerificationText"
                            :disabled="disableFields && canDisableExecuteField"
                            :use-froala="true">
                        </ing-editable-froala>
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    import {mapGetters} from "vuex";
    import {getUsername} from '../../../common/utils';
    import IngEditableWithFroala from "../../../common/IngEditableWithFroala.vue";

    export default {
        name: "ManualVerificationElement",
        components: {
            'ing-editable-froala': IngEditableWithFroala,
        },
        data: function() {
            return {
                valueTemp: '',
                fieldIdLookup: {}
            };
        },
        created() {

        },
        computed: {
            ...mapGetters([
                "modStyle"
            ]),
            verificationText: function() {
                return this.getExecutionInputKey("verification_text");
            },
            verifiedBy: function() {
                const verified_by = this.getExecutionInputKey("verified_by");
                if (verified_by) {
                    return `Verified by ${verified_by}`;
                } else {
                    return '';
                }
            },
            timeVerified: function() {
                const time_verified = this.getExecutionInputKey("time_verified");
                if (time_verified) {
                    return `at ${time_verified}`;
                } else {
                    return '';
                }
            },
            verificationStatus: {
                get() { return this.getExecutionInputKey("verification_status"); },
                set(value) { this.setElementInput("verification_status", value); }
            },
        },
        methods: {
            updateVerificationText: function(value) {
                this.setElementInput("verification_text", value);
                this.save();
            },
            saveManualVerification() {
                // keep verificationText as it is
                this.setElementInput("verified_by", getUsername());
                this.setElementInput("time_verified", (new Date()).toISOString());
                this.save();
            },
        }
    };
</script>
