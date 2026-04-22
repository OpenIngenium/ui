<template>
    <ing-modal v-if="showModal" @close="handleClose()" size="large">
        <template slot="title">
            <h4 class="modal-title"><span class="glyphicon glyphicon-search"></span> Choose Steps</h4>
        </template>
        <template slot="body">
            <div class="choose-steps-container">
                <div class="row">
                    <div class="col-xs-6">
                        <h5>Steps</h5>
                    </div>
                    <div class="col-xs-6">
                        <div class="pull-right">
                            <a style="cursor: pointer; text-decoration: underline;"
                               class="choose-steps-select-all"
                               @click="handleSelectAll">
                                Select All
                            </a>
                            <span>&nbsp;|&nbsp;</span>
                            <a style="cursor: pointer; text-decoration: underline;"
                               class="choose-steps-unselect-all"
                               @click="handleUnselectAll">
                                Unselect All
                            </a>
                        </div>
                    </div>
                </div>
                <div class="row select-procedure-step-choose-steps">
                    <div class="col-xs-12">
                        <template v-for="element in rootElements">
                            <show-step
                                :key="element.index"
                                :element-id="element.elem_id"
                                :title="element.title"
                                :number="element.number"
                                :type="element.elem_type==='STEP' ? element.step_type : element.elem_type"
                                :children="element.children">
                            </show-step>
                        </template>
                    </div>
                </div>
            </div>
        </template>
        <template slot="footer">
            <div>
                <button type="button" class="btn btn-primary pull-left" @click="handleClose()">Close</button>
            </div>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../../../common/IngModal.vue";
    import { mapActions, mapGetters } from "vuex";
    import ShowStep from "./ShowStep.vue";

    export default {
        name: "SelectStepsModal",
        components: {
            "ing-modal": IngModal,
            "show-step": ShowStep,
        },
        props: {
            showModal: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapGetters([
                "fetchOutlinePrecomputed"
            ]),
            rootElements: function() {
                return this.fetchOutlinePrecomputed;
            },
        },
        methods: {
            ...mapActions([
                "deleteAllStepsFromStep",
                "addAllStepsToStep",
            ]),
            handleClose: function() {
                this.$emit("close");
            },
            handleUnselectAll: function() {
                this.deleteAllStepsFromStep();
            },
            handleSelectAll: function() {
                this.addAllStepsToStep();
            },
        }
    };
</script>

<style scoped>

</style>
