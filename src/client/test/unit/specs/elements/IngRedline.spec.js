import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import IngRedline from "../../../../src/modules/elements/IngRedline.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const ELEM_ID = "el1";

function stepData(overrides = {}) {
    return {
        elem_id: ELEM_ID,
        elem_type: "STEP",
        executed: false,
        executable: "NOT_EXECUTED",
        imported: false,
        procedure_modification: {justification: {modification_type: "REDLINE"}},
        ...overrides
    };
}

describe("IngRedline.vue", () => {
    function build({step = stepData(), redline = {}, element = {}, canApprove = true, mode = "execution"} = {}) {
        const actions = {
            editRedlineInput: sinon.spy(),
            saveJustificationElement: sinon.spy(),
            saveApprovalElement: sinon.spy(),
            discardRedlineElement: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                executionRedlineInputKey: () => (elemId, key) => (redline[key]),
                elementKey: () => (elemId, key) => element[key],
                canApproveRedline: () => canApprove
            },
            actions
        });
        const wrapper = shallowMount(IngRedline, {
            store,
            localVue,
            propsData: {stepRedlineData: step, elementMap: {}, mode}
        });
        return {wrapper, actions};
    }

    it("isRedline getter reflects the modification type", () => {
        expect(build({redline: {"justification.modification_type": "REDLINE"}}).wrapper.vm.isRedline).toBe(true);
        expect(build({redline: {"justification.modification_type": "BLUELINE"}}).wrapper.vm.isRedline).toBe(false);
    });

    it("approved getter reflects the approval status", () => {
        expect(build({redline: {"approval.status": "APPROVED"}}).wrapper.vm.approved).toBe(true);
        expect(build({redline: {"approval.status": "PENDING"}}).wrapper.vm.approved).toBe(false);
    });

    it("text getters read the redline input", () => {
        const vm = build({redline: {"justification.content": "why", "approval.content": "ok"}}).wrapper.vm;
        expect(vm.justificationText).toBe("why");
        expect(vm.approvalText).toBe("ok");
    });

    it("text setters dispatch editRedlineInput", () => {
        const {wrapper, actions} = build();
        wrapper.vm.justificationText = "new just";
        wrapper.vm.approvalText = "new appr";
        expect(actions.editRedlineInput.firstCall.args[1]).toEqual({elementId: ELEM_ID, keyString: "justification.content", value: "new just"});
        expect(actions.editRedlineInput.secondCall.args[1]).toEqual({elementId: ELEM_ID, keyString: "approval.content", value: "new appr"});
    });

    it("isRedline setter saves the justification modification type", () => {
        const {wrapper, actions} = build();
        wrapper.vm.isRedline = false;
        expect(actions.saveJustificationElement.lastCall.args[1].justificationInput.modification_type).toBe("BLUELINE");
    });

    it("approved setter saves the approval status", () => {
        const {wrapper, actions} = build();
        wrapper.vm.approved = true;
        expect(actions.saveApprovalElement.lastCall.args[1].approvalInput.status).toBe("APPROVED");
    });

    it("modificationActive is true for active modification statuses", () => {
        expect(build({element: {procedure_modification_status: "MODIFYING"}}).wrapper.vm.modificationActive).toBe(true);
        expect(build({element: {procedure_modification_status: "NONE"}}).wrapper.vm.modificationActive).toBe(false);
    });

    it("canDiscard reflects executed state", () => {
        expect(build({element: {executed: true}}).wrapper.vm.canDiscard).toBe(true);
    });

    it("toEditRedline requires an active, unapproved modification", () => {
        const editable = build({element: {procedure_modification_status: "MODIFYING"}, redline: {"approval.status": "PENDING"}}).wrapper.vm;
        expect(editable.toEditRedline).toBe(true);
        const approved = build({element: {procedure_modification_status: "MODIFYING"}, redline: {"approval.status": "APPROVED"}}).wrapper.vm;
        expect(approved.toEditRedline).toBe(false);
    });

    it("toEditRedline is false for executed steps", () => {
        const vm = build({step: stepData({executed: true, executable: "EXECUTED"}), element: {procedure_modification_status: "MODIFYING"}}).wrapper.vm;
        expect(vm.toEditRedline).toBe(false);
    });

    it("toEditApprovalComment requires approval permission", () => {
        const allowed = build({canApprove: true, element: {procedure_modification_status: "ADDED"}}).wrapper.vm;
        expect(allowed.toEditApprovalComment).toBe(true);
        const denied = build({canApprove: false, element: {procedure_modification_status: "ADDED"}}).wrapper.vm;
        expect(denied.toEditApprovalComment).toBe(false);
    });

    it("approve/unapprove disabled flags depend on approval state", () => {
        const pending = build({canApprove: true, element: {procedure_modification_status: "ADDED"}, redline: {"approval.status": "PENDING"}}).wrapper.vm;
        expect(pending.approveRedlineDisabled).toBe(false);
        expect(pending.unapproveRedlineDisabled).toBe(true);
    });

    it("makeRedlineDisabled reflects current selection", () => {
        const isRedline = build({redline: {"justification.modification_type": "REDLINE"}, element: {procedure_modification_status: "MODIFYING"}}).wrapper.vm;
        expect(isRedline.makeRedlineDisabled).toBe(true);
        expect(isRedline.makeBluelineDisabled).toBe(false);
    });

    it("approvalTimestamp and username only surface when approved", () => {
        const approved = build({redline: {"approval.status": "APPROVED", "approval.time_updated": "t1", "approval.user_name": "bob"}}).wrapper.vm;
        expect(approved.approvalTimestamp).toBe("t1");
        expect(approved.approvalUsername).toBe("bob");
        const pending = build({redline: {"approval.status": "PENDING", "approval.time_updated": "t1"}}).wrapper.vm;
        expect(pending.approvalTimestamp).toBe("");
        expect(pending.approvalUsername).toBe("");
    });

    it("justification timestamp and username read redline input", () => {
        const vm = build({redline: {"justification.time_updated": "jt", "justification.user_name": "alice"}}).wrapper.vm;
        expect(vm.justificationTimestamp).toBe("jt");
        expect(vm.justificationUsername).toBe("alice");
    });

    it("saveJustificationComment and saveApprovalComment persist current text", () => {
        const {wrapper, actions} = build({redline: {"justification.content": "j", "approval.content": "a"}});
        wrapper.vm.saveJustificationComment();
        wrapper.vm.saveApprovalComment();
        expect(actions.saveJustificationElement.lastCall.args[1].justificationInput.content).toBe("j");
        expect(actions.saveApprovalElement.lastCall.args[1].approvalInput.content).toBe("a");
    });

    it("discardRedline dispatches discardRedlineElement", () => {
        const {wrapper, actions} = build();
        wrapper.vm.discardRedline();
        expect(actions.discardRedlineElement.lastCall.args[1]).toEqual({elementId: ELEM_ID});
    });
});
