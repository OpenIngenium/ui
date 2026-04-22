import Vue from 'vue';
import Vuex from 'vuex';
import dashboard from '../dashboard/dashboard-store';
import execution from '../execution/execution-store';
import executions from '../executions/executions-store';
import evr from '../elements/executable/query-evr/evr-store';
import cmd from '../elements/executable/cmd/cmd-store';
import runProcedure from '../elements/non-executable/run-procedure/run-procedure-store';
import dictionaries from './dictionaries-store';
import comments from './comments-store';
import venueDetail from '../venue-detail/venue-detail-store';
import cmdSse from '../elements/executable/cmd-sse/cmd-store';
import eha from '../elements/executable/wait-eha/wait-eha-store';
import projectConfig from '../project-config/project-config-store';
import admin from '../admin/admin-store';
import message from '../common/message-store';


Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        dashboard,
        comments,
        dictionaries,
        venueDetail,
        execution,
        executions,
        evr,
        cmd,
        runProcedure,
        cmdSse,
        eha,
        projectConfig,
        admin,
        message,
    },
    strict: debug
});
