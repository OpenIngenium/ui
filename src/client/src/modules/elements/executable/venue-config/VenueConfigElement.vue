// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js

<template>
    <form>
        <div v-if="isLevelTwoDetail" class="container-element">
            <div class="venue-config-row-container">
                <div class="row venue-config-data-bar">
                    <div class="col-xs-4" style="display: inline-block;">
                        <label>FSW Version</label>
                    </div>
                    <div class="col-xs-4"></div>
                    <div class="col-xs-4">
                        <input v-model.trim="fswVersion"
                                @change="saveVenueConfig"
                                :disabled="canDisableExecuteField"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                    </div>
                </div>
            </div>
            <div class="venue-config-row-container">
                <div class="row venue-config-data-bar">
                    <div class="col-xs-4" style="display: inline-block;">
                        <label>FSW Dictionary</label>
                    </div>
                    <div class="col-xs-4"></div>
                    <div class="col-xs-4">
                        <input v-model.trim="fswDictionary"
                                @change="saveVenueConfig"
                                :disabled="canDisableExecuteField"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                    </div>
                </div>
            </div>
            <div class="venue-config-row-container">
                <div class="row venue-config-data-bar">
                    <div class="col-xs-4" style="display: inline-block;">
                        <label>SSE Version</label>
                    </div>
                    <div class="col-xs-4"></div>
                    <div class="col-xs-4">
                        <input v-model.trim="sseVersion"
                               @change="saveVenueConfig"
                               :disabled="canDisableExecuteField"
                               type="text"
                               class="form-control execution-input"
                               style="margin-bottom: 10px;">
                    </div>
                </div>
            </div>
            <div class="venue-config-row-container">
                <div class="row venue-config-data-bar">
                    <div class="col-xs-4" style="display: inline-block;">
                        <label>SSE Dictionary</label>
                    </div>
                    <div class="col-xs-4"></div>
                    <div class="col-xs-4">
                        <input v-model.trim="sseDictionary"
                                @change="saveVenueConfig"
                                :disabled="canDisableExecuteField"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                    </div>
                </div>
            </div>
            <div class="venue-config-row-container">
                <div class="row venue-config-data-bar">
                    <div class="col-xs-4" style="display: inline-block;">
                        <label>GDS Version</label>
                    </div>
                    <div class="col-xs-4"></div>
                    <div class="col-xs-4">
                        <input v-model.trim="gdsVersion"
                                @change="saveVenueConfig"
                                :disabled="canDisableExecuteField"
                                type="text"
                                class="form-control execution-input"
                                style="margin-bottom: 10px;">
                    </div>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
    export default {
        name: "VenueConfigElement",
        computed: {
            fswVersion: {
                get() {
                    return this.executionInputKey(this.elementId, "fsw_version");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "fsw_version",
                        value: value
                    });
                }
            },
            sseVersion: {
                get() {
                    return this.executionInputKey(this.elementId, "sse_version");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "sse_version",
                        value: value
                    });
                }
            },
            fswDictionary: {
                get() {
                    return this.executionInputKey(this.elementId, "fsw_dictionary");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "fsw_dictionary",
                        value: value
                    });
                }
            },
            sseDictionary: {
                get() {
                    return this.executionInputKey(this.elementId, "sse_dictionary");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "sse_dictionary",
                        value: value
                    });
                }
            },
            gdsVersion: {
                get() {
                    return this.executionInputKey(this.elementId, "gds_version");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "gds_version",
                        value: value
                    });
                }
            }
        },
        methods: {
            saveVenueConfig() {
                this.save();
            }
        }
    };
</script>

<style lang="scss" scoped>
    .venue-config-data-bar{
        padding: 10px 20px 0px 15px;
    }
    .venue-config-row-container {
        border-bottom: 1px solid #D8D6D6;
    }
</style>


