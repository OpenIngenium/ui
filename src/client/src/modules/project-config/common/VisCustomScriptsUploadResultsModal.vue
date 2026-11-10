<template>
    <ing-modal v-if="showModal" @close="close()">
        <!-- Title -->
        <template slot="title">
            <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                <span class="glyphicon glyphicon-cog"></span>
                {{typeName}} Updated
            </h4>
        </template>

        <!-- Body -->
        <template slot="body">
            <template v-if="!isUploadResultsEmpty">
                <!-- Upload results count -->
                <div class="row" :style="{marginTop: '5px', marginBottom: '5px'}">
                    <div class="col-xs-5 text-center">{{typeName}} Found</div>
                    <div class="col-xs-5 text-center">{{typeName}} Uploaded</div>
                    <div class="col-xs-2"></div>
                </div>
                <div class="row" :style="{marginTop: '5px', marginBottom: '5px'}">
                    <div class="col-xs-5 text-center">{{uploadResults.num_items_parsed}}</div>
                    <div class="col-xs-5 text-center">{{uploadResults.num_items_updated}}</div>
                    <div class="col-xs-2 text-right">
                        <span v-if="errorsCount > 0" class="glyphicon glyphicon-exclamation-sign" :style="{color: 'orangered'}"></span>
                    </div>
                </div>

                <!-- Upload results errors -->
                <div v-if="errorsCount > 0" class="row" :style="{border: '1px solid red', borderColor: 'orangered', backgroundColor: '#efcecd'}">
                    <!-- Error count -->
                    <div class="col-xs-1"><span class="glyphicon glyphicon-exclamation-sign" :style="{color: 'orangered'}"></span></div>
                    <div class="col-xs-9" :style="{fontWeight: 'bold'}">
                        {{typeName}}: {{errorsCount}} error<span v-if="errorsCount > 1">s</span>
                    </div>
                    <div class="col-xs-2">
                        <span
                            v-if="expandErrorSection"
                            class="glyphicon glyphicon-resize-small"
                            @click="toggleExpandErrorSection()"
                            :style="{color: 'orangered'}"></span>
                        <span v-else class="glyphicon glyphicon-resize-full" @click="toggleExpandErrorSection()" :style="{color: 'orangered'}"></span>
                        <span class="glyphicon glyphicon-copy" :style="{color: 'orangered'}" :click="copyErrors()"></span>
                    </div>
                    <!-- Error messages -->
                    <template v-if="expandErrorSection">
                        <template v-if="errorsCount > 5">
                            <template v-for="(val, index) in uploadResults.errors.slice(0, 5)">
                                <div :key="`${index}-1`" class="col-xs-1"></div>
                                <div :key="`${index}-3`" class="col-xs-3">{{val.error_type}}:</div>
                                <div :key="`${index}-8`" class="col-xs-8">{{val.message}}</div>
                            </template>
                            <div class="col-xs-1"></div>
                            <div class="col-xs-11"><b>...</b></div>
                        </template>
                        <template v-else>
                            <template v-for="(val, index) in uploadResults.errors">
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
        name: "VisCustomScriptsUploadResultsModal",
        components: {
            "ing-modal": IngModal,
        },
        data() {
            return {
                expandErrorSection: false,
            };
        },
        props: {
            showModal: {
                type: Boolean,
                required: true
            },
            type: {
                type: String,
                required: true
            }
        },
        computed: {
            ...mapGetters([
                "visUploadResults",
                "customScriptsUploadResults",
            ]),
            typeName: function() {
                switch (this.type) {
                    case "vis":
                        return "Verification Items";
                    case "customScripts":
                        return "Custom Scripts";
                    default:
                        return "";
                }
            },
            uploadResults: function() {
                switch (this.type) {
                    case "vis":
                        return this.visUploadResults;
                    case "customScripts":
                        return this.customScriptsUploadResults;
                    default:
                        return null;
                }
            },
            isUploadResultsEmpty: function() {
                // FIXME this.uploadResults #=> null
                //       return #=> false, and this is not correct
                return this.uploadResults && _.isEmpty(this.uploadResults);
            },
            errorsCount: function() {
                if (this.uploadResults && this.uploadResults.errors) {
                    return this.uploadResults.errors.length;
                }

                return 0;
            }
        },
        methods: {
            close: function() {
                this.expandErrorSection = false;
                this.$emit('close');
            },
            toggleExpandErrorSection: function() {
                this.expandErrorSection = !this.expandErrorSection;
                this.$forceUpdate();
            },
            copyErrors: function() {
                let val = "{\n";
                _.forEach(this.uploadResults.errors, (item) => {
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
