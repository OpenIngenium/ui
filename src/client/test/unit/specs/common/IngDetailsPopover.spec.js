import {shallowMount} from "@vue/test-utils";
import IngDetailsPopover from "../../../../src/modules/common/IngDetailsPopover.vue";

function mountWith(placement) {
    return shallowMount(IngDetailsPopover, {
        propsData: {placement},
        slots: {
            title: "<span>Title</span>",
            body: "<p>Body</p>",
            default: ["<span>a</span>", "<span>b</span>", "<span>c</span>"]
        }
    });
}

describe("IngDetailsPopover.vue", () => {
    let wrapper;

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("dynamicPosition computes per placement and sets zIndex", () => {
        ["top", "right", "bottom", "left"].forEach((placement) => {
            const w = mountWith(placement);
            const pos = w.vm.dynamicPosition;
            expect(pos.zIndex).toBe(9999);
            expect(typeof pos.top === "string" || typeof pos.right === "string" || typeof pos.left === "string").toBe(true);
            w.destroy();
        });
    });

    it("showPopover shows the popover and sets a fixed content height", async() => {
        wrapper = mountWith("right");
        wrapper.vm.showPopover();
        expect(wrapper.vm.shown).toBe(true);
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.contentHeight).toBe(300);
    });

    it("closePopover hides the popover", () => {
        wrapper = mountWith("right");
        wrapper.setData({shown: true});
        wrapper.vm.closePopover();
        expect(wrapper.vm.shown).toBe(false);
    });

    it("handleClickOutside hides the popover when clicking elsewhere", () => {
        wrapper = mountWith("right");
        wrapper.setData({shown: true});
        wrapper.vm.handleClickOutside({target: document.body});
        expect(wrapper.vm.shown).toBe(false);
    });

    it("handleClickOutside keeps the popover open when clicking inside", () => {
        wrapper = mountWith("right");
        wrapper.setData({shown: true});
        wrapper.vm.handleClickOutside({target: wrapper.vm.$el});
        expect(wrapper.vm.shown).toBe(true);
    });
});
