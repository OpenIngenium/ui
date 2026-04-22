<template>
    <div v-if="isLevelTwoDetail" class="row">
        <div class="col-xs-12 top-buffer">
            <table class="table" :class="modStyle(elementId, `vis`)">
                <thead>
                <tr>
                    <th>Type</th>
                    <th>VI ID</th>
                    <th>VI Name</th>
                    <th>VI Text</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="vi in vis" :key="vi.vi_id">
                    <td>{{vi.vi_type || ''}}</td>
                    <td>{{vi.vi_id || ''}}</td>
                    <td>{{vi.vi_name || ''}}</td>
                    <td>{{vi.vi_text || ''}}</td>
                    <td><vi-detail-dropdown :data="vi"></vi-detail-dropdown></td>
                    <td>
                        <button 
                            v-if="!disableFields"
                            class="icon-button"
                            title="Delete" 
                            @click="handleDeleteVi(vi)">
                            <i class="glyphicon glyphicon-trash"></i>
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="col-xs-12 top-buffer">
            <button
                type="button"
                class="btn btn-primary pull-right ing-tooltip"
                :disabled="disableFields"
                data-toggle="tooltip" 
                data-placement="top"
                data-trigger="hover" 
                onclick="$(this).tooltip('hide');"
                :title="tooltips.auth_exec_vi_step"
                @click="handleShowSelectVisModal()">
                Select VIs
            </button>
        </div>

        <!-- Modal -->
        <select-vis-modal
            tableId="verificationItemSelectVisModal"
            :show-modal="showSelectVisModal"
            :choose-vi-button="chooseViButton"
            :disabled="disableFields"
            :element-id="this.elementId"
            @save="handleCloseAndSaveSelectVisModal()"
            @cancel="handleCloseSelectVisModal()">
        </select-vis-modal>
    </div>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";
    import SelectVisModal from "../../../common/verification-item/SelectVisModal.vue";
    import ViDetailDropdown from "./ViDetailDropdown.vue";
    import ChooseViButton from "./ChooseViButton.vue";

    let TOOLTIPS = require('../../../common/tooltip-config');
    export default {
        name: "VerificationItemElement",
        components: {
            "select-vis-modal": SelectVisModal,
            "vi-detail-dropdown": ViDetailDropdown,
        },
        data() {
            return {
                showSelectVisModal: false,
                chooseViButton: ChooseViButton,
            };
        },
        computed: {
            ...mapGetters([
                'getVisByElementId',
                'elementViewStateKey',
                'modStyle',
            ]),
            vis: function() {
                return this.getVisByElementId(this.elementId);
            },
            tooltips() {
                return TOOLTIPS.default.TOOLTIPS;
            },
        },
        methods: {
            ...mapActions([
                "setSelectedVisStepElementId",
                "deleteViFromDeclareStep",
            ]),
            handleShowSelectVisModal: function() {
                this.setSelectedVisStepElementId({elementId: this.elementId});
                this.showSelectVisModal = true;
            },
            handleCloseAndSaveSelectVisModal: function() {
                this.save();
                this.showSelectVisModal = false;
            },
            handleCloseSelectVisModal: function() {
                this.showSelectVisModal = false;
            },
            handleDeleteVi: function(vi) {
                this.setSelectedVisStepElementId({elementId: this.elementId});
                this.deleteViFromDeclareStep({vi: vi});
                this.save();
            }
        }
    };
</script>

<style lang="scss" scoped>
    .top-buffer {
        margin-top: 10px;
    }
    .icon-button {
        padding: 0;
        border: none;
        background-color: transparent;
        line-height: normal;
        opacity: 0.5;
        font-size: 18px;
        position: relative;
        font-family: 'Glyphicons Halflings', sans-serif;
    }
</style>
