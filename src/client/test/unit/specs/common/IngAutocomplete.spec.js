import { shallow } from "@vue/test-utils";
import IngAutocomplete from "../../../../src/modules/common/IngAutocomplete.vue";
import { createLocalVue } from "@vue/test-utils";
import sinon from "sinon";

const localVue = createLocalVue(); 

const factory = (propsData, newData) => {
    return shallow(IngAutocomplete, {
        localVue, 
        propsData: {
            items: [],
            enterByName: 'test name',
            nameField: "name", 
            descriptionField: "description",
            categoryField: "categoryPropTest",
            disabled: false,
            callback: () => {},
            ...propsData
        }, 
        data: {
            isOpen: true, 
            noResults: true, 
            ...newData
        }
    });
};

const factoryWithData = (propsData, newData) => {
    return shallow(IngAutocomplete, {
        localVue,
        propsData: {
            items: [
                {
                    name: "test name", 
                    description: "test description", 
                    categoryPropTest: "test category"
                }, 
                {
                    name: "test name two", 
                    description: "test description two", 
                    categoryPropTest: "test category two"
                },
                {
                    name: "three", 
                    description: "test description three", 
                    categoryPropTest: "test category three"
                }
            ],
            enterByName: 'test name',
            nameField: "name", 
            descriptionField: "description",
            categoryField: "categoryPropTest",
            disabled: false,
            callback: () => {}

        },
        data() {
            return {
                isOpen: true,
                noResults: false,
                search: "test name", 
                arrowCounter: 1
            };
        }
    });
};


describe("IngAutocomplete.vue", () => {
    it("should not display anything when input has no characters", () => {
        const wrapper = factory(null, { isOpen: false });
        expect(wrapper.find('.autocomplete-result').exists()).toBeFalsy();
    });

    it("dialog should correctly display all items passed as props", () => { 
        const wrapper = shallow(IngAutocomplete, {
            localVue,
            propsData: {
                items: [
                    {
                        name: "test name", 
                        description: "test description", 
                        categoryPropTest: "test category"
                    }
                ],
                enterByName: 'test name',
                nameField: "name", 
                descriptionField: "description",
                categoryField: "categoryPropTest",
                disabled: false,
                callback: () => {}

            },
            data: {
                isOpen: true,
            }
        });

        expect(wrapper.findAll('.autocomplete-sublist').length).toBe(1);
        expect(wrapper.find('.autocomplete-title').text()).toEqual("test name");
        expect(wrapper.find('.autocomplete-description').text()).toEqual("test description");
        expect(wrapper.find('.autocomplete-category').text()).toEqual("test category");
    });

    it("key down moves selection down one", () => {
        const wrapper = factoryWithData();
        sinon.spy(wrapper.vm, 'onArrowDown');
        const input = wrapper.find('input');
        input.trigger('keydown.down');
        expect(wrapper.vm.onArrowDown.calledOnce).toBeTruthy();
        
    });

    it("key up moves selection up one", () => {
        const wrapper = factoryWithData();
        sinon.spy(wrapper.vm, 'onArrowUp');
        const input = wrapper.find('input');
        input.trigger('keydown.up');
        expect(wrapper.vm.onArrowUp.calledOnce).toBeTruthy();
    });

    it("should set result on enter", () => {
        const wrapper = factoryWithData();
        sinon.spy(wrapper.vm, 'onEnter');
        const input = wrapper.find('input');
        input.trigger('keydown.enter');
        expect(wrapper.vm.onEnter.calledOnce).toBeTruthy();
    });

    it("should set result when item is clicked", () => {
        const wrapper = factoryWithData();
        sinon.spy(wrapper.vm, 'setResult');
        wrapper.find('.autocomplete-result').trigger('click');
        expect(wrapper.vm.setResult.calledOnce).toBeTruthy();
    });
});
