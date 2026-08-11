import sinon from "sinon";
import cmdStore from "../../../../src/modules/elements/executable/cmd/cmd-store";
import dictionaryApi from "../../../../src/api/dictionary";

function buildCmd() {
    return {
        command_stem: "MY_CMD",
        repeat_max: 3,
        repeat_min: 1,
        arguments: [
            {name: "a1", repeat_arg: "No"},
            {name: "r1", repeat_arg: "Yes"}
        ]
    };
}

describe("cmd-store computed getters", () => {
    const g = cmdStore.getters;

    it("numberOfArgs/Sections/RepeatArgs/TotalArgs compute from state", () => {
        const state = {
            selectedCmdObjArgs: [{}, {}],
            selectedCmdObjRepeatArgs: [[{}], [{}]],
            repeatArgsTemplate: [{}]
        };
        expect(g.numberOfArgs(state)).toBe(2);
        expect(g.numberOfSections(state)).toBe(2);
        expect(g.numberOfRepeatArgs(state)).toBe(2);
        expect(g.numberOfTotalArgs(state)).toBe(4);
    });

    it("simple accessors", () => {
        const state = {builderCmds: [{c: 1}], cmdBuilderCount: 7, cmdDetails: [{d: 1}]};
        expect(g.builderCmds(state)).toEqual([{c: 1}]);
        expect(g.cmdBuilderCount(state)).toBe(7);
        expect(g.cmdDetails(state)).toEqual([{d: 1}]);
    });
});

describe("cmd-store mutations (setCmd/addSection/removeSection)", () => {
    const m = cmdStore.mutations;
    let state;

    beforeEach(() => {
        state = {
            builderCmds: [],
            cmdBuilderCount: 0,
            cmdDetails: [],
            commandString: "",
            selectedCmdObj: undefined,
            selectedCmdObjArgs: [],
            repeatArgsTemplate: [],
            selectedCmdObjRepeatArgs: []
        };
    });

    it("setCmd populates args, repeat template, and initial repeat section", () => {
        m.setCmd(state, {cmd: buildCmd(), cmdArgs: []});
        expect(state.commandString).toBe("MY_CMD");
        expect(state.selectedCmdObjArgs.length).toBe(1);
        expect(state.selectedCmdObjArgs[0].argument_value).toBe("");
        expect(state.repeatArgsTemplate.length).toBe(1);
        // repeat_min = 1 => one repeat section
        expect(state.selectedCmdObjRepeatArgs.length).toBe(1);
    });

    it("addSection adds a repeat section up to repeat_max", () => {
        m.setCmd(state, {cmd: buildCmd(), cmdArgs: []});
        m.addSection(state);
        expect(state.selectedCmdObjRepeatArgs.length).toBe(2);
        m.addSection(state);
        expect(state.selectedCmdObjRepeatArgs.length).toBe(3);
        // at repeat_max (3), no more added
        m.addSection(state);
        expect(state.selectedCmdObjRepeatArgs.length).toBe(3);
    });

    it("removeSection removes a repeat section at a position", () => {
        m.setCmd(state, {cmd: buildCmd(), cmdArgs: []});
        m.addSection(state);
        expect(state.selectedCmdObjRepeatArgs.length).toBe(2);
        m.removeSection(state, 0);
        expect(state.selectedCmdObjRepeatArgs.length).toBe(1);
        // removing out of range is a no-op
        m.removeSection(state, 5);
        expect(state.selectedCmdObjRepeatArgs.length).toBe(1);
    });
});

describe("cmd-store actions", () => {
    const actions = cmdStore.actions;
    let commits;
    let commit;
    let apiStub;

    beforeEach(() => {
        commits = [];
        commit = (type, payload) => commits.push({type, payload});
        apiStub = null;
    });

    afterEach(() => {
        if (apiStub) {
            apiStub.restore();
        }
    });

    it("fetchFlightCmds fetches and commits cmds with loading toggles", async() => {
        apiStub = sinon.stub(dictionaryApi, "getFlightCmds").resolves({cmds: [{command_stem: "X"}], total: 1});
        await actions.fetchFlightCmds({commit}, {});
        const types = commits.map((c) => c.type);
        expect(types).toContain("receiveBuilderCmds");
        expect(types.filter((t) => t === "setBooleanKey").length).toBe(2);
        const receive = commits.find((c) => c.type === "receiveBuilderCmds");
        expect(receive.payload).toEqual({cmds: [{command_stem: "X"}], total: 1});
    });

    it("setCmd fetches a wild cmd and commits it", async() => {
        apiStub = sinon.stub(dictionaryApi, "getFlightCmds").resolves({cmds: {command_stem: "Y"}});
        await actions.setCmd({commit}, {cmdArgs: ["1"]});
        const setCmdCommit = commits.find((c) => c.type === "setCmd");
        expect(setCmdCommit.payload.cmd).toEqual({command_stem: "Y"});
        expect(setCmdCommit.payload.cmdArgs).toEqual(["1"]);
    });

    it("fetchCmdDetails fetches and commits details", async() => {
        apiStub = sinon.stub(dictionaryApi, "getFlightCmds").resolves({cmds: [{command_stem: "Z"}]});
        await actions.fetchCmdDetails({commit}, {});
        const detailsCommit = commits.find((c) => c.type === "receiveFlightCmdDetails");
        expect(detailsCommit.payload).toEqual({cmds: [{command_stem: "Z"}]});
    });

    it("thin action wrappers forward their commits", async() => {
        await actions.setArg({commit}, {argumentIndex: 0, argumentValue: "v"});
        await actions.setRepeatArg({commit}, {sectionIndex: 0, argumentIndex: 0, argumentValue: "v"});
        await actions.addSection({commit});
        await actions.removeSection({commit}, 0);
        await actions.setCmdArguments({commit}, {a: 1});
        const types = commits.map((c) => c.type);
        expect(types).toEqual(["setArg", "setRepeatArg", "addSection", "removeSection", "setCmdArguments"]);
    });
});
