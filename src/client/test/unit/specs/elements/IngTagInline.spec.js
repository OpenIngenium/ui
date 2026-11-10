import {shallowMount, createLocalVue} from "@vue/test-utils";
import Vuex from "vuex";
import IngTagInline from "../../../../src/modules/elements/IngTagInline.vue";

const localVue = createLocalVue();
localVue.use(Vuex);

function build({query = {}, isWorkingCopy = true, availableTags, tags} = {}) {
    const store = new Vuex.Store({
        getters: {
            procedureVersion: () => 0,
            isWorkingCopy: () => isWorkingCopy
        }
    });
    return shallowMount(IngTagInline, {
        localVue,
        store,
        mocks: {$route: {query}},
        propsData: {
            availableTags: availableTags || [{tag_id: "1", name: "A"}, {tag_id: "2", name: "B"}, {tag_id: "3", name: "C"}],
            tags: tags || [{tag_id: "1", name: "A"}],
            isSection: false,
            mode: "authoring"
        }
    });
}

describe("IngTagInline.vue", () => {
    it("filteredAvailableTags excludes already-applied tags", () => {
        const wrapper = build();
        expect(wrapper.vm.filteredAvailableTags.map((t) => t.tag_id)).toEqual(["2", "3"]);
    });

    it("allowRemoveTag requires update query and working copy", () => {
        expect(build({query: {update: ""}}).vm.allowRemoveTag).toBe(true);
        expect(build({query: {}}).vm.allowRemoveTag).toBeFalsy();
        expect(build({query: {update: ""}, isWorkingCopy: false}).vm.allowRemoveTag).toBe(false);
    });

    it("allowAddTag requires more than one available tag and edit permission", () => {
        expect(build({query: {update: ""}}).vm.allowAddTag).toBe(true);
        expect(build({query: {update: ""}, availableTags: [{tag_id: "1", name: "A"}, {tag_id: "2", name: "B"}], tags: [{tag_id: "1", name: "A"}]}).vm.allowAddTag).toBe(false);
    });

    it("handleAddTag / handleDeleteTag re-emit events", () => {
        const wrapper = build();
        wrapper.vm.handleAddTag("add");
        wrapper.vm.handleDeleteTag("del");
        expect(wrapper.emitted("addTag")[0]).toEqual(["add"]);
        expect(wrapper.emitted("deleteTag")[0]).toEqual(["del"]);
    });
});
