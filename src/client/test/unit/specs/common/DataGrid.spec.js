import { mount, shallowMount } from "@vue/test-utils";
import sinon from "sinon";
import Vue from "vue";
import Vuex from "vuex";
import * as faker from "faker";
import { createLocalVue } from "@vue/test-utils";
import { HotTable } from '@handsontable/vue';
import ExecutionStore from "../../../../src/modules/execution/execution-store";
import IngDataEntry from "../../../../src/modules/common/IngDataEntry.vue";

const elementId = faker.random.uuid();

// State
const state = {
    elements: {
        [elementId]: {
            execution_user_input: {
                entries: [
                    {
                        signal_name: 'they\'re',
                        icds: 'great',
                        from: 2,
                        to: 3,
                        unit: 'Volt',
                        min_value: 0,
                        max_value: 100,
                        actual_value: 'real'
                    },
                    {
                        signal_name: 'quality you',
                        icds: 'can taste',
                        from: 3,
                        to: 4,
                        unit: 'Ohm',
                        min_value: 1,
                        max_value: 101,
                        actual_value: 'super real'
                    }
                ]
            }
        }
    }
};

// Props 
const propsData = {
    elementId,
    showModal: false, 
    mode: 'execution',
    level: 1,
    disableFields: false,
    canDisableExecuteField: false
};

// Getters
const getters = {
    executionInputEntriesArrayFilter: ExecutionStore.getters.executionInputEntriesArrayFilter
};

// Actions
const actions = {
    editEntries: () => {}
};

// Stub components
const stubs = {};

const localVue = createLocalVue();
localVue.use(Vuex);

describe("DataGrid", () => {
    let store;
    let wrapper;

    beforeEach(() => {
        store = new Vuex.Store({ state, getters, actions });
        wrapper = mount(IngDataEntry, {
            store,
            localVue,
            propsData,
            stubs
        });
    });

    xit("modal is default closed", () => {
        const modal = wrapper.find('.modal-container');
        expect(modal.isVisible()).toBeFalsy();
    });

    xit("modal is toggleable", () => {
        const open = wrapper.find('.modal-container');
        expect(open.isVisible()).toBeFalsy();
        
        wrapper.setProps({
            elementId: '1234',
            showModal: true, 
            mode: 'execution',
            level: 1,
            disableFields: false,
            canDisableExecuteField: false
        });

        Vue.nextTick(() => {
            const closed = wrapper.find('.modal-container');
            expect(closed.isVisible()).toBeTruthy();
        });
    });

    xit("[execution mode] handsontable has correct amount of columns", () => {
        expect(wrapper.vm.mode).toBe('execution');
        expect(wrapper.vm.hotSettings.colHeaders.length).toBe(8);
    });

    xit("[execution mode] handsontable columns are in order", () => {
        const expectedColumnHeaders = JSON.stringify(['Signal Name',
            'ICDS',
            'From (red probe)',
            'To (black probe)',
            'Units',
            'Min',
            'Max',
            'Measured']);

        expect(wrapper.vm.mode).toBe('execution');
        expect(JSON.stringify(wrapper.vm.hotSettings.colHeaders)).toBe(expectedColumnHeaders);
    });

    xit("[authoring mode] handsontable has correct amount of columns", () => {
        const authoringWrapper = mount(IngDataEntry, {
            store,
            localVue,
            propsData: {
                elementId: '1234',
                showModal: true, 
                mode: 'authoring',
                level: 1,
                disableFields: false,
                canDisableExecuteField: false
            },
            stubs
        });

        expect(authoringWrapper.vm.mode).toBe('authoring');
        expect(authoringWrapper.vm.hotSettings.colHeaders.length).toBe(7);
    });

    xit("[authoring mode] handsontable columns are in order", () => {
        const authoringWrapper = mount(IngDataEntry, {
            store,
            localVue,
            propsData: {
                elementId: '1234',
                showModal: true, 
                mode: 'authoring',
                level: 1,
                disableFields: false,
                canDisableExecuteField: false
            },
            stubs
        });

        const expectedColumnHeaders = JSON.stringify(['Signal Name',
            'ICDS',
            'From (red probe)',
            'To (black probe)',
            'Units',
            'Min',
            'Max']);

        expect(authoringWrapper.vm.mode).toBe('authoring');
        expect(JSON.stringify(authoringWrapper.vm.hotSettings.colHeaders)).toBe(expectedColumnHeaders);
    });

    xit("[execution mode] hotData has execution time fields present", () => {
        expect(wrapper.vm.hotData.length).toBe(2);
        expect(wrapper.vm.hotSettings.maxCols).toBe(8);
        expect(wrapper.vm.hotData[0].length).toBe(8);
    });

    xit("[authoring mode] hotData has doesn't have execution time fields present", () => {
        const authoringWrapper = mount(IngDataEntry, {
            store,
            localVue,
            propsData: {
                elementId,
                showModal: true, 
                mode: 'authoring',
                level: 1,
                disableFields: false,
                canDisableExecuteField: false
            },
            stubs
        });

        expect(authoringWrapper.vm.hotData.length).toBe(2);
        expect(authoringWrapper.vm.hotSettings.maxCols).toBe(7);
        expect(authoringWrapper.vm.hotData[0].length).toBe(7);
    });

    xit("random ordering of entries doesn't affect executionInputEntriesArrayFilter", () => {
        const nominalEntries = [
            ["they're","great",2,3,"Volt",0,100,"real"],
            ["quality you","can taste",3,4,"Ohm",1,101,"super real"]
        ];
        expect(JSON.stringify(wrapper.vm.hotData)).toBe(JSON.stringify(nominalEntries));
    });

    xit("simulate pasting into empty data entry table", () => {
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(0,0);
        new ClipboardEvent('paste', [
            ["a","b",1,2,"c",3,4,"d"],
            ["e","f",4,5,"g",6,7,"h"]
        ]);

        wrapper.vm.afterChangeCallback(null, "edit");

        expect(wrapper.vm.hotData.length).toBe(2);
    });

    xit("pasting into populated data entry table replacing entire contents", () => {
        // Select second row
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(1,0);
        hotRef.setDataAtRowProp(0,0,[
            ["i","j",7,6,"k",5,4,"l"],
            ["m","n",3,2,"o",1,0,"p"]
        ], 'edit');

        new ClipboardEvent('paste', [
            ["a","b",1,2,"c",3,4,"d"],
            ["e","f",4,5,"g",6,7,"h"]
        ]);

        wrapper.vm.afterChangeCallback(null, "edit");

        expect(wrapper.vm.hotData.length).toBe(2);
    });

    xit("pasting into populated data entry table partially replacing contents", () => {
        // Select second row
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(0,0);
        hotRef.setDataAtRowProp(0,0,[
            ["i","j",7,6,"k",5,4,"l"],
            ["m","n",3,2,"o",1,0,"p"],
            ["q","r",3,2,"s",1,0,"t"]
        ], 'edit');

        new ClipboardEvent('paste', [
            ["a","b",1,2,"c",3,4,"d"],
            ["e","f",4,5,"g",6,7,"h"]
        ]);

        wrapper.vm.afterChangeCallback(null, "edit");

        expect(wrapper.vm.hotData.length).toBe(2);
    });

    xit("add row above", () => {
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(0,0);
        hotRef.setDataAtRowProp(0,0,[
            ["i","j",7,6,"k",5,4,"l"],
            ["m","n",3,2,"o",1,0,"p"]
        ], 'edit');

        wrapper.vm.afterCreateRowCallback(null, null, "ContextMenu.rowAbove");

        expect(wrapper.vm.hotData.length).toBe(2);
    });

    xit("add row below", () => {
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(0,0);
        hotRef.setDataAtRowProp(0,0,[
            ["i","j",7,6,"k",5,4,"l"],
            ["m","n",3,2,"o",1,0,"p"]
        ], 'edit');

        wrapper.vm.afterCreateRowCallback(null, null, "ContextMenu.rowBelow");

        expect(wrapper.vm.hotData.length).toBe(2);
    });

    xit("remove row from above", () => {
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(1,0);
        hotRef.setDataAtRowProp(0,0,[
            ["i","j",7,6,"k",5,4,"l"]
        ], 'edit');

        wrapper.vm.afterCreateRowCallback(null, null, "ContextMenu.removeRow");

        expect(wrapper.vm.hotData.length).toBe(2);
    });
    
    xit("remove row from below", () => {
        const hotRef = wrapper.vm.$refs.myTable.hotInstance;
        hotRef.selectCell(0,0);
        hotRef.setDataAtRowProp(0,0,[
            ["i","j",7,6,"k",5,4,"l"]
        ], 'edit');

        wrapper.vm.afterCreateRowCallback(null, null, "ContextMenu.removeRow");

        expect(wrapper.vm.hotData.length).toBe(2);
    });
});
