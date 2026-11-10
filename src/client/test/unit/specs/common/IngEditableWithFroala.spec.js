import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import IngEditableWithFroala from "../../../../src/modules/common/IngEditableWithFroala.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

describe("IngEditableWithFroala.vue", () => {
    function build({props = {}, mode = "execution", files} = {}) {
        const actions = {
            deleteProcedureElementFile: sinon.spy(),
            deleteExecutionElementFile: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                executionId: () => "exec1",
                procedureId: () => "proc1",
                mode: () => mode,
                elementKey: () => (elementId, key) => (key === "files" ? files : undefined)
            },
            actions
        });
        const wrapper = shallowMount(IngEditableWithFroala, {
            store,
            localVue,
            propsData: {elementId: "el1", value: "initial", ...props},
            stubs: {"froala-edit": true, froalaView: true, "froala-view": true}
        });
        return {wrapper, actions};
    }

    it("beforeMount seeds valueTemp from the value prop", () => {
        expect(build().wrapper.vm.valueTemp).toBe("initial");
    });

    it("froalaValue getter/setter proxies valueTemp", () => {
        const wrapper = build().wrapper;
        wrapper.vm.froalaValue = "edited";
        expect(wrapper.vm.valueTemp).toBe("edited");
        expect(wrapper.vm.froalaValue).toBe("edited");
    });

    it("updateFrolaValue updates valueTemp", () => {
        const wrapper = build().wrapper;
        wrapper.vm.updateFrolaValue("typed");
        expect(wrapper.vm.valueTemp).toBe("typed");
    });

    it("config uses execution upload urls in execution mode", () => {
        const config = build({mode: "execution"}).wrapper.vm.config;
        expect(config.imageUploadParams.execution_id).toBe("exec1");
        expect(config.imageUploadParams.elem_id).toBe("el1");
    });

    it("config uses procedure ids in authoring mode", () => {
        const config = build({mode: "authoring"}).wrapper.vm.config;
        expect(config.imageUploadParams.execution_id).toBe("proc1");
    });

    it("fileConfig builds the file id lookup from element files", () => {
        const wrapper = build({files: [{url: "/f/a.png", file_id: "f1"}]}).wrapper;
        wrapper.vm.fileConfig();
        expect(Object.values(wrapper.vm.fileIdLookup)).toContain("f1");
    });

    it("toggleEdit sets the editing flag", () => {
        const wrapper = build().wrapper;
        wrapper.vm.toggleEdit(true);
        expect(wrapper.vm.editing).toBe(true);
        wrapper.vm.toggleEdit(false);
        expect(wrapper.vm.editing).toBe(false);
    });

    it("confirmEdit emits save when the value changed", () => {
        const wrapper = build().wrapper;
        wrapper.vm.valueTemp = "changed";
        wrapper.vm.confirmEdit();
        expect(wrapper.emitted("save")[0][0]).toBe("changed");
        expect(wrapper.vm.editing).toBe(false);
    });

    it("confirmEdit does not emit when the value is unchanged", () => {
        const wrapper = build().wrapper;
        wrapper.vm.confirmEdit();
        expect(wrapper.emitted("save")).toBeFalsy();
    });

    it("watch value keeps froalaValue in sync", async() => {
        const wrapper = build().wrapper;
        wrapper.setProps({value: "external"});
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.froalaValue).toBe("external");
    });

    it("imageRemovedHandler deletes the procedure file in authoring mode", () => {
        const {wrapper, actions} = build({mode: "authoring"});
        wrapper.vm.fileIdLookup = {"http://host/a.png": "fid1"};
        wrapper.vm.imageRemovedHandler({attr: () => "http://host/a.png"});
        expect(actions.deleteProcedureElementFile.called).toBe(true);
        expect(actions.deleteProcedureElementFile.lastCall.args[1]).toEqual({elementId: "el1", fileId: "fid1"});
    });

    it("imageRemovedHandler deletes the execution file in execution mode", () => {
        const {wrapper, actions} = build({mode: "execution"});
        wrapper.vm.fileIdLookup = {"http://host/a.png": "fid2"};
        wrapper.vm.imageRemovedHandler({attr: () => "http://host/a.png"});
        expect(actions.deleteExecutionElementFile.lastCall.args[1]).toEqual({elementId: "el1", fileId: "fid2"});
    });

    it("fileUnlinkHandler deletes the linked file", () => {
        const {wrapper, actions} = build({mode: "execution"});
        wrapper.vm.fileIdLookup = {"http://host/doc.pdf": "fid3"};
        wrapper.vm.fileUnlinkHandler({attributes: {href: {value: "http://host/doc.pdf"}}});
        expect(actions.deleteExecutionElementFile.lastCall.args[1]).toEqual({elementId: "el1", fileId: "fid3"});
    });
});
