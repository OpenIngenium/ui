import { shallow, createLocalVue } from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import sinon from "sinon";
import elementExecutionMixin from "../../../../src/modules/elements/mixins/element-execution-mixin";
import VerificationItemElement from "../../../../src/modules/elements/non-executable/verification-item/VerificationItemElement.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const ELEMENT_ID = "vi-elem-1";
const Composed = Vue.extend(elementExecutionMixin).extend(VerificationItemElement);

describe("VerificationItemElement.vue", () => {
    function build({vis = []} = {}) {
        const actions = {
            setSelectedVisStepElementId: sinon.spy(),
            deleteViFromDeclareStep: sinon.spy(),
            saveElementInput: sinon.spy(),
            saveRedlineInput: sinon.spy(),
            editElementInput: sinon.spy(),
            editElementArray: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                getVisByElementId: () => () => vis,
                elementViewStateKey: () => () => undefined,
                modStyle: () => () => "",
                elementKey: () => () => undefined,
                executionInputKey: () => () => undefined,
                executionResultsKey: () => () => undefined,
                executionMetaDataKey: () => () => undefined,
                executionRedlineInputKey: () => () => undefined,
                canParticipate: () => true,
                numEntries: () => () => 0,
                elementViewState: () => () => ({detailLevel: 3})
            },
            actions
        });
        const wrapper = shallow(Composed, {
            propsData: {
                elementId: ELEMENT_ID,
                elementMap: {name: "VERIFICATION_ITEM", path: "verification_item_steps", isNestable: false},
                mode: "authoring"
            },
            store,
            localVue,
            stubs: {"select-vis-modal": true, "vi-detail-dropdown": true, "execution-status-check": true}
        });
        return {wrapper, actions};
    }

    it("vis getter reads the selected VIs for the element", () => {
        const vis = [{vi_id: "v1", vi_name: "N1"}];
        expect(build({vis}).wrapper.vm.vis).toEqual(vis);
    });

    it("handleShowSelectVisModal targets the element and opens the modal", () => {
        const {wrapper, actions} = build();
        wrapper.vm.handleShowSelectVisModal();
        expect(actions.setSelectedVisStepElementId.lastCall.args[1]).toEqual({elementId: ELEMENT_ID});
        expect(wrapper.vm.showSelectVisModal).toBe(true);
    });

    it("handleCloseAndSaveSelectVisModal saves and closes the modal", () => {
        const {wrapper, actions} = build();
        wrapper.vm.showSelectVisModal = true;
        wrapper.vm.handleCloseAndSaveSelectVisModal();
        expect(actions.saveElementInput.called).toBe(true);
        expect(wrapper.vm.showSelectVisModal).toBe(false);
    });

    it("handleCloseSelectVisModal just closes the modal", () => {
        const {wrapper, actions} = build();
        wrapper.vm.showSelectVisModal = true;
        wrapper.vm.handleCloseSelectVisModal();
        expect(wrapper.vm.showSelectVisModal).toBe(false);
        expect(actions.saveElementInput.called).toBe(false);
    });

    it("handleDeleteVi removes the VI and saves", () => {
        const {wrapper, actions} = build();
        const vi = {vi_id: "v1"};
        wrapper.vm.handleDeleteVi(vi);
        expect(actions.setSelectedVisStepElementId.called).toBe(true);
        expect(actions.deleteViFromDeclareStep.lastCall.args[1]).toEqual({vi});
        expect(actions.saveElementInput.called).toBe(true);
    });
});
