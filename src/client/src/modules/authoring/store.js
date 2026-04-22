import Vue from 'vue';
import Vuex from 'vuex';
import authoring from './authoring-store';
import dictionaries from '../common/dictionaries-store';
import cmd from '../elements/executable/cmd/cmd-store';
import comments from '../common/comments-store';
import runProcedure from '../elements/non-executable/run-procedure/run-procedure-store'; 
import evr from '../elements/executable/query-evr/evr-store';
import cmdSse from '../elements/executable/cmd-sse/cmd-store';
import eha from '../elements/executable/wait-eha/wait-eha-store';
import projectConfig from '../project-config/project-config-store';
import admin from '../admin/admin-store';
import message from '../common/message-store';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        dictionaries,
        authoring,
        comments,
        cmd,
        evr,
        cmdSse,
        eha, 
        runProcedure,
        projectConfig,
        message,
        admin
    },
    strict: debug
});
