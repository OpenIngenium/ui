import { shallow } from "@vue/test-utils";
import sinon from "sinon";
import Paginator from "../../../../src/modules/common/Paginator.vue";

describe("Paginator.vue", () => {
    it("only shows 3 pages with a 10 limit and 30 total", () => {
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 30,
                ellipsisThreshold: 5,
                callback: () => {}
            }
        });
        const pageList = wrapper.find("nav ul").findAll("li");
        for(let i = 0; i < pageList.length - 1; i++) {
            expect(pageList.at(i).text()).toBe((i + 1).toString());
        }
        expect(pageList.at(pageList.length - 1).text()).toBe("Next");
    });

    it("contains ellipsis when past ellipsis threshold (left)", () => {
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 100,
                ellipsisThreshold: 5,
                callback: () => {}
            }
        });
        const pageList = wrapper.find("nav ul").findAll("li");
        expect(pageList.at(5).text()).toBe("...");
        expect(pageList.at(pageList.length - 2).text()).toBe("10");
        expect(pageList.at(pageList.length - 1).text()).toBe("Next");
    });

    it("contains ellipsis when past ellipsis threshold (right)", async() => {
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 100,
                ellipsisThreshold: 5,
                callback: () => {}
            }
        });
        let pageList = wrapper.find("nav ul").findAll("li");
        pageList.at(pageList.length - 2).find("a").trigger('click');
        await wrapper.vm.$nextTick();
        pageList = wrapper.find("nav ul").findAll("li");
        expect(pageList.at(0).text()).toBe("Previous");
        expect(pageList.at(1).text()).toBe("1");
        expect(pageList.at(2).text()).toBe("...");
    });

    it("moves active class +/- 1 with next and previous", async() => {
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 100,
                ellipsisThreshold: 5,
                callback: () => {}
            }
        });
        let activePage = wrapper.find("nav ul .active");
        expect(activePage.text()).toBe("1");
        const nextButton = wrapper.find("nav ul li a[aria-label='Next']");
        nextButton.trigger('click');
        await wrapper.vm.$nextTick();
        activePage = wrapper.find("nav ul .active");
        expect(activePage.text()).toBe("2");
        const prevButton = wrapper.find("nav ul li a[aria-label='Previous']");
        prevButton.trigger('click');
        await wrapper.vm.$nextTick();
        activePage = wrapper.find("nav ul .active");
        expect(activePage.text()).toBe("1");
    });

    it("invokes the callback with button clicks", () => {
        const callback = sinon.spy();
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 100,
                ellipsisThreshold: 5,
                callback: callback
            }
        });
        const nextButton = wrapper.find("nav ul li a[aria-label='Next']");
        nextButton.trigger('click');
        expect(callback.calledOnce).toBeTruthy();

        for(let i = 0; i < 5; i++) {
            nextButton.trigger('click');
        }
        expect(callback.callCount).toBe(6);
    });

    it("supplies 'limit' and 'offset' params to callback", () => {
        const callback = sinon.spy();
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 100,
                ellipsisThreshold: 3,
                callback: callback
            }
        });
        const pageList = wrapper.find("nav ul").findAll("li");
        // click button to page 3
        pageList.at(2).find("a").trigger('click');
        expect(callback.args[0][0].limit).toBe(10);
        expect(callback.args[0][0].offset).toBe(20);

        // click next a few times
        const nextButton = wrapper.find("nav ul li a[aria-label='Next']");

        nextButton.trigger('click');
        expect(callback.args[1][0].limit).toBe(10);
        expect(callback.args[1][0].offset).toBe(30);

        nextButton.trigger('click');
        expect(callback.args[2][0].limit).toBe(10);
        expect(callback.args[2][0].offset).toBe(40);
    });

    it("resets active page to 1 if the totalItems changes", async() => {
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 1000,
                ellipsisThreshold: 5,
                windowRadius: 3,
                callback: () => {}
            }
        });
        const nextButton = wrapper.find("nav ul li a[aria-label='Next']");
        nextButton.trigger('click');
        nextButton.trigger('click');
        nextButton.trigger('click');
        await wrapper.vm.$nextTick();
        let activePage = wrapper.find("nav ul .active");
        expect(wrapper.vm.activePageIndex).toBe(3);
        expect(activePage.text()).toEqual("4");
        wrapper.setProps({
            totalItems: 999
        });
        await wrapper.vm.$nextTick();
        activePage = wrapper.find("nav ul .active");
        expect(activePage.text()).toEqual("1");
        expect(wrapper.vm.activePageIndex).toBe(0);
    });

    it("does not reset active to 1 if same amount of total items", async() => {
        const wrapper = shallow(Paginator, {
            propsData: {
                limit: 10,
                totalItems: 1000,
                ellipsisThreshold: 5,
                windowRadius: 3,
                callback: () => {}
            }
        });
        const nextButton = wrapper.find("nav ul li a[aria-label='Next']");
        nextButton.trigger('click');
        nextButton.trigger('click');
        nextButton.trigger('click');
        await wrapper.vm.$nextTick();
        let activePage = wrapper.find("nav ul .active");
        expect(wrapper.vm.activePageIndex).toBe(3);
        expect(activePage.text()).toEqual("4");
        wrapper.setProps({
            totalItems: 1000
        });
        await wrapper.vm.$nextTick();
        activePage = wrapper.find("nav ul .active");
        expect(activePage.text()).toEqual("4");
        expect(wrapper.vm.activePageIndex).toBe(3);
    });
});
