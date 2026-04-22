<template>
    <ing-modal v-if="showModal" @close="close()">
        <!-- Title -->
        <template slot="title">
            <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                <span class="glyphicon glyphicon-cog"></span>
                Dictionary {{version}} Updated
            </h4>
        </template>

        <!-- Body -->
        <template slot="body">
            <template v-if="!isUploadResultsEmpty">
                <!-- Upload results count -->
                <div class="row" :style="{marginTop: '5px', marginBottom: '5px'}">
                    <div
                        class="col-xs-3 text-center"
                        v-for="(value, key) in uploadResults"
                        :key="key">
                        <u>{{key}}</u>
                    </div>
                </div>
                <div class="row" :style="{marginTop: '5px', marginBottom: '5px'}">
                    <div
                        class="col-xs-3 text-center"
                        v-for="(value, key) in uploadResults"
                        :key="key">
                        {{value.count}}
                        <span v-if="!isErrorEmpty(value)">
                            &nbsp;<span class="glyphicon glyphicon-exclamation-sign" :style="{color: 'orangered', cursor: 'pointer', opacity: opacityLevel(key)}" @click="pickDict(key)"></span>
                        </span>
                    </div>
                </div>
                <!-- Upload results errors -->
                <div v-if="currDict !== ''" class="row" :style="{border: '1px solid red', borderColor: 'orangered', backgroundColor: '#efcecd'}">
                    <!-- Error count -->
                    <div class="col-xs-1"><span class="glyphicon glyphicon-exclamation-sign" :style="{color: 'orangered'}"></span></div>
                    <div class="col-xs-9" :style="{fontWeight: 'bold'}">
                        {{currDict}}: {{currErrorCount}} error<span v-if="currErrors > 1">s</span>
                    </div>
                    <div class="col-xs-2">
                        <span v-if="expandErrorSection" class="glyphicon glyphicon-resize-small" @click="toggleExpandErrorSection()" :style="{color: 'orangered'}"></span>
                        <span v-else class="glyphicon glyphicon-resize-full" @click="toggleExpandErrorSection()" :style="{color: 'orangered'}"></span>
                        <span class="glyphicon glyphicon-copy" :style="{color: 'orangered'}" :click="copyErrors()"></span>
                    </div>
                    <!-- Error messages -->
                    <template v-if="expandErrorSection">
                        <template v-if="currErrorCount > 5">
                            <template v-for="(val, index) in currErrors.slice(0, 5)">
                                <div :key="`${index}-1`" class="col-xs-1"></div>
                                <div :key="`${index}-3`" class="col-xs-3">{{val.error_type}}:</div>
                                <div :key="`${index}-8`" class="col-xs-8">{{val.message}}</div>
                            </template>
                            <div class="col-xs-1"></div>
                            <div class="col-xs-11"><b>...</b></div>
                        </template>
                        <template v-else>
                            <template v-for="(val, index) in currErrors">
                                <div :key="`${index}-1`" class="col-xs-1"></div>
                                <div :key="`${index}-3`" class="col-xs-3">{{val.error_type}}:</div>
                                <div :key="`${index}-8`" class="col-xs-8">{{val.message}}</div>
                            </template>
                        </template>
                    </template>
                </div>
            </template>
        </template>

        <!-- Footer -->
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-right"
                    @click="close()">
                Close
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../../common/IngModal.vue";
    import {mapGetters} from "vuex";
    import _ from "lodash";

    export default {
        name: "UploadResultsModal",
        components: {
            "ing-modal": IngModal,
        },
        data() {
            return {
                expandErrorSection: false,
                currDict: "",
            };
        },
        props: {
            showModal: {
                type: Boolean,
                required: true
            },
            dictType: {
                type: String,
                required: true
            },
            version: {
                type: String,
                required: true
            }
        },
        computed: {
            ...mapGetters([
                "sseUploadResults",
                "flightUploadResults",
            ]),
            uploadResults: function() {
                let dictTemp;
                // XXX This code need to be generalized
                switch (this.dictType) {
                    case "flight":
                        dictTemp = this.flightUploadResults;
                        break;
                    case "sse":
                        dictTemp = this.sseUploadResults;
                        break;
                    default:
                        dictTemp = null;
                        break;
                }
                return dictTemp;
            },
            isUploadResultsEmpty: function() {
                // FIXME this.uploadResults #=> null
                //       return #=> false, and this is not correct
                return this.uploadResults && _.isEmpty(this.uploadResults);
            },
            currErrorCount: function() {
                if (this.currDict !== "") {
                    return this.uploadResults[this.currDict].errors.length;
                }
                return 0;
            },
            currErrors: function() {
                if (this.currDict !== "") {
                    return this.uploadResults[this.currDict].errors;
                }
                return [];
            }
        },
        methods: {
            close: function() {
                this.expandErrorSection = false;
                this.currDict = "";
                this.$emit('close');
            },
            isErrorEmpty: function(value) {
                return value.errors && _.isEmpty(value.errors);
            },
            toggleExpandErrorSection: function() {
                this.expandErrorSection = !this.expandErrorSection;
                this.$forceUpdate();
            },
            pickDict: function(dict) {
                this.currDict = dict;
                this.expandErrorSection = false;
                this.$forceUpdate();
            },
            opacityLevel: function(dict) {
                return dict === this.currDict ? '1' : '0.3';
            },
            copyErrors: function() {
                let val = "{\n";
                _.forEach(this.uploadResults[this.currDict].errors, (item) => {
                    val += '    ' + item.error_type + ': "' + item.message + '",\n';
                });
                val += "}";

                this.$copyText(val);
            }
        }
    };
</script>

<style scoped>

</style>
