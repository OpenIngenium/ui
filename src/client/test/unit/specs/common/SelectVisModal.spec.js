import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import sinon from "sinon";
import SelectVisModal from "../../../../src/modules/common/verification-item/SelectVisModal.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

const chooseViButton = {name: "ChooseViButton", render: (h) => h("button")};

describe("SelectVisModal.vue", () => {
    function build({props = {}, vis = {}, selectedIds = [], visByElement = []} = {}) {
        const actions = {
            fetchVIs: sinon.spy(),
            deleteViFromDeclareStep: sinon.spy(),
            setSelectedViIds: sinon.spy(),
            removeViIds: sinon.spy(),
            setVisDeclareStep: sinon.spy(),
            addSelectedViIds: sinon.spy(),
            setVisToStatusStep: sinon.spy()
        };
        const store = new Vuex.Store({
            getters: {
                vis: () => vis,
                visCount: () => Object.keys(vis).length,
                getVisByElementId: () => () => visByElement,
                isSelectedViId: () => (id) => selectedIds.includes(id)
            },
            actions
        });
        const wrapper = shallowMount(SelectVisModal, {
            store,
            localVue,
            propsData: {elementId: "el1", chooseViButton, ...props},
            stubs: {"ing-modal": true, "ing-table": true}
        });
        return {wrapper, actions};
    }

    it("viewTableColumns adds a selected column only when using parent VIs", () => {
        expect(build().wrapper.vm.viewTableColumns.some((c) => c.field === "vi_selected")).toBe(false);
        const withParent = build({props: {useVisFromParent: true, visFromParent: []}}).wrapper;
        expect(withParent.vm.viewTableColumns.some((c) => c.field === "vi_selected")).toBe(true);
    });

    it("viewVis marks selection and extracts VA names", () => {
        const vis = {a: {vi_id: "v1", vas: [{va_name: "VA1", vac_name: "VAC1"}]}, b: {vi_id: "v2", vas: []}};
        const rows = build({vis, selectedIds: ["v1"]}).wrapper.vm.viewVis;
        const first = rows.find((r) => r.vi_id === "v1");
        const second = rows.find((r) => r.vi_id === "v2");
        expect(first.vi_selected).toBe("Yes");
        expect(first.va_name).toBe("VA1");
        expect(first.vac_name).toBe("VAC1");
        expect(second.vi_selected).toBe("No");
        expect(second.va_name).toBe("");
    });

    it("_visCount and includeFooter depend on useVisFromParent", () => {
        const local = build({vis: {a: {}, b: {}}}).wrapper;
        expect(local.vm._visCount).toBe(2);
        expect(local.vm.includeFooter).toBe(true);
        const parent = build({props: {useVisFromParent: true, visFromParent: [{}, {}, {}]}}).wrapper;
        expect(parent.vm._visCount).toBe(3);
        expect(parent.vm.includeFooter).toBe(false);
    });

    it("handleSave declares VIs and emits save in declare mode", () => {
        const {wrapper, actions} = build();
        wrapper.vm.handleSave();
        expect(actions.setVisDeclareStep.called).toBe(true);
        expect(actions.setVisToStatusStep.called).toBe(false);
        expect(wrapper.emitted("save")).toBeTruthy();
    });

    it("handleSave uses the status step action when using parent VIs", () => {
        const {wrapper, actions} = build({props: {useVisFromParent: true, visFromParent: []}});
        wrapper.vm.handleSave();
        expect(actions.setVisToStatusStep.called).toBe(true);
    });

    it("handleCancel clears the selection and emits cancel", () => {
        const {wrapper, actions} = build();
        wrapper.vm.handleCancel();
        expect(actions.setSelectedViIds.lastCall.args[1]).toEqual({vis: []});
        expect(wrapper.emitted("cancel")).toBeTruthy();
    });

    it("filterVis filters by case-insensitive substring", () => {
        const vm = build().wrapper.vm;
        const filtered = vm.filterVis([{vi_name: "Alpha"}, {vi_name: "beta"}], "vi_name", "ALP");
        expect(filtered).toEqual([{vi_name: "Alpha"}]);
    });

    it("handleSearch dispatches fetchVIs in server mode", () => {
        const {wrapper, actions} = build();
        wrapper.vm.handleSearch({filters: {}, offset: 20, limit: 5});
        expect(actions.fetchVIs.called).toBe(true);
        expect(actions.fetchVIs.lastCall.args[1].offset).toBe(20);
    });

    it("handleSearch filters local data when using parent VIs", () => {
        const {wrapper} = build({props: {useVisFromParent: true, visFromParent: [{vi_id: "x", vi_name: "Alpha", vas: []}, {vi_id: "y", vi_name: "Beta", vas: []}]}});
        wrapper.vm.handleSearch({filters: {name: {field: "vi_name", value: "alp"}}, offset: 0, limit: 10});
        expect(wrapper.vm.tableCount).toBe(1);
        expect(wrapper.vm.tableData[0].vi_name).toBe("Alpha");
    });

    it("selectAll and unselectAll act on the visible VIs", () => {
        const {wrapper, actions} = build({vis: {a: {vi_id: "v1", vas: []}}});
        wrapper.vm.selectAll();
        expect(actions.addSelectedViIds.called).toBe(true);
        wrapper.vm.unselectAll();
        expect(actions.removeViIds.called).toBe(true);
    });

    it("opening the modal fetches VIs and loads the saved selection", async() => {
        const {wrapper, actions} = build({visByElement: [{vi_id: "v9"}]});
        wrapper.setProps({showModal: true});
        await wrapper.vm.$nextTick();
        expect(actions.fetchVIs.called).toBe(true);
        expect(actions.setSelectedViIds.lastCall.args[1]).toEqual({vis: [{vi_id: "v9"}]});
    });
});
