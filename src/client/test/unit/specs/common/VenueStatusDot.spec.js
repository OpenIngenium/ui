import {  shallow, createLocalVue } from "@vue/test-utils";
import VenueStatusDot from "../../../../src/modules/common/VenueStatusDot.vue";

const localVue = createLocalVue();

describe("VenueStatusDot.vue", () => {
    it("Displays a colored status dot to indicate venue state", () => {
        const wrapper = shallow(VenueStatusDot, {
            propsData: {
                status: 'AVAILABLE'
            },
            localVue,
        });
        expect(wrapper.vm.statusColor).toEqual('status-dot-green');
        wrapper.setData({'status': 'IN_USE'});
        expect(wrapper.vm.statusColor).toEqual('status-dot-yellow');
    });
    it("Displays a colored status dot to indicate venue state", () => {
        const wrapper = shallow(VenueStatusDot, {
            propsData: {
                status: 'DOWN'
            },
            localVue,
        });
        expect(wrapper.vm.statusColor).toEqual('status-dot-red');
        wrapper.setData({'status': 'ANY OTHER STATUS'});
        expect(wrapper.vm.statusColor).toEqual('status-dot-grey');
    });

});

