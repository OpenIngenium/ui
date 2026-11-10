import Vue from 'vue';
import VueRouter from 'vue-router';
import VueSocketIO from 'vue-socket.io';
import store from '../common/store';
import Execution from './Execution.vue';
import ExecutionRouter from './ExecutionRouter.vue';
import IngModal from '../common/IngModal.vue';
import IngPopover from '../common/IngPopover.vue';
import { DragAndDrop } from '../common/directives/DragAndDrop';
import { ContextMenu } from '../common/directives/ContextMenu';
import IngElement from '../elements/IngElement.vue';
import IngElementWrapper from '../elements/IngElementWrapper.vue';
import EntryWrapper from '../elements/EntryWrapper.vue';
import IngSpinner from '../common/IngSpinner.vue';
import ExecutionStatusCheck from '../execution/ExecutionStatusCheck.vue';
import ExecutionFullResults from '../execution/ExecutionFullResults.vue';

import { getJwt, getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

import nonExecutable from '../elements/non-executable/index';
import executable from '../elements/executable/index';
import elementExecutionMixin from "../elements/mixins/element-execution-mixin";
import entryExecutionMixin from "../elements/mixins/entry-execution-mixin";
import executionNestableMixin from "../elements/mixins/execution-nestable-mixin";

// Require Froala Editor js file.
// import 'froala-editor/js/froala_editor.pkgd.min.js';

// Require Froala Editor css files.
// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';

import '../common/froala-import';
import 'vue-datetime/dist/vue-datetime.css';

// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';

import VueFroala from 'ing-vue-froalav3-wysiwyg';

import Toasted from 'vue-toasted';

import VueClipboard from 'vue-clipboard2';

Vue.use(VueClipboard);
Vue.use(VueFroala);
Vue.use(Toasted);

let abilities = defineAbilityFor(getUserScopes());

Vue.use(abilitiesPlugin, abilities);
Vue.use(VueRouter);

let websocket_url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api/v2/execution_event_subscribe`;

Vue.use(new VueSocketIO({
    debug: true,
    connection: websocket_url,
    vuex: {
        store,
        actionPrefix: 'SOCKET_'
    },
    options: {
        path:'/execution_monitor/socket.io',
        query: { token: getJwt() },
        transports: ['websocket'],
        autoConnect: false
    }
}));

Vue.component('ing-element', Vue.extend(executionNestableMixin).extend(IngElement));
Vue.component('ing-element-wrapper', Vue.extend(executionNestableMixin).extend(IngElementWrapper));
Vue.component('ing-spinner', IngSpinner);
Vue.component('execution-status-check', ExecutionStatusCheck);
Vue.component('execution-full-results', ExecutionFullResults);

Vue.directive('drag-and-drop', DragAndDrop);
Vue.directive('click-outside', ContextMenu);

Vue.component('ing-modal', IngModal);
Vue.component('ing-popover', IngPopover);
Vue.component('entries-wrapper', Vue.extend(entryExecutionMixin).extend(EntryWrapper));
Vue.component('section-element', Vue.extend(elementExecutionMixin).extend(nonExecutable.SectionElement));
Vue.component('paragraph-element', nonExecutable.ParagraphElement);
Vue.component('run-procedure-element', Vue.extend(elementExecutionMixin).extend(nonExecutable.RunProcedureElement));

Vue.component('venue-config-element', Vue.extend(elementExecutionMixin).extend(executable.VenueConfigElement));
Vue.component('cmd-element', Vue.extend(elementExecutionMixin).extend(executable.CmdElement));
Vue.component('cmd-entry', Vue.extend(entryExecutionMixin).extend(executable.CmdEntry));
Vue.component('cmd-file-element', Vue.extend(elementExecutionMixin).extend(executable.CmdFileElement));
Vue.component('cmd-file-entry', Vue.extend(entryExecutionMixin).extend(executable.CmdFileEntry));
Vue.component('cmd-sse-element', Vue.extend(elementExecutionMixin).extend(executable.CmdSseElement));
Vue.component('cmd-sse-entry', Vue.extend(entryExecutionMixin).extend(executable.CmdSseEntry));
Vue.component('cmd-scmf-element', Vue.extend(elementExecutionMixin).extend(executable.CmdScmfElement));
Vue.component('cmd-scmf-entry', Vue.extend(entryExecutionMixin).extend(executable.CmdScmfEntry));
Vue.component('manual-input-element', Vue.extend(elementExecutionMixin).extend(executable.ManualInputElement));
Vue.component('manual-input-entry', Vue.extend(entryExecutionMixin).extend(executable.ManualInputEntry));
Vue.component('manual-verification-element', Vue.extend(elementExecutionMixin).extend(executable.ManualVerificationElement));
Vue.component('manual-gds-element', Vue.extend(elementExecutionMixin).extend(executable.ManualGdsElement));
Vue.component('manual-gds-entry', Vue.extend(entryExecutionMixin).extend(executable.ManualGdsEntry));
Vue.component('queryevr-element', Vue.extend(elementExecutionMixin).extend(executable.QueryEvrElement));
Vue.component('wait-element', Vue.extend(elementExecutionMixin).extend(executable.WaitElement));
Vue.component('environment-element', Vue.extend(elementExecutionMixin).extend(executable.EnvironmentElement));
Vue.component('get-venue-config-element', Vue.extend(elementExecutionMixin).extend(executable.GetVenueConfigElement));
Vue.component('get-venue-config-entry', Vue.extend(entryExecutionMixin).extend(executable.GetVenueConfigEntry));
Vue.component('check-venue-config-element', Vue.extend(elementExecutionMixin).extend(executable.CheckVenueConfigElement));
Vue.component('check-venue-config-entry', Vue.extend(entryExecutionMixin).extend(executable.CheckVenueConfigEntry));
Vue.component('update-venue-config-element', Vue.extend(elementExecutionMixin).extend(executable.UpdateVenueConfigElement));
Vue.component('update-venue-config-entry', Vue.extend(entryExecutionMixin).extend(executable.UpdateVenueConfigEntry));
Vue.component('graph-eha-element', Vue.extend(elementExecutionMixin).extend(executable.GraphEhaElement));
Vue.component('verify-eha-element', Vue.extend(elementExecutionMixin).extend(executable.VerifyEhaElement));
Vue.component('verify-eha-entry', Vue.extend(entryExecutionMixin).extend(executable.VerifyEhaEntry));
Vue.component('time-reference-element', Vue.extend(elementExecutionMixin).extend(executable.TimeReferenceElement));
Vue.component('wait-eha-element', Vue.extend(elementExecutionMixin).extend(executable.WaitEhaElement));
Vue.component('wait-eha-entry', Vue.extend(entryExecutionMixin).extend(executable.WaitEhaEntry));
Vue.component('wait-evr-element', Vue.extend(elementExecutionMixin).extend(executable.WaitEvrElement));
Vue.component('wait-evr-entry', Vue.extend(entryExecutionMixin).extend(executable.WaitEvrEntry));
Vue.component('bus-1553-element', Vue.extend(elementExecutionMixin).extend(executable.Bus1553Element));
Vue.component('bus-1553-entry', Vue.extend(entryExecutionMixin).extend(executable.Bus1553Entry));
Vue.component('verification-item-element', Vue.extend(elementExecutionMixin).extend(nonExecutable.VerificationItemElement));
Vue.component('verification-item-status-element', Vue.extend(elementExecutionMixin).extend(executable.VerificationItemStatusElement));
Vue.component('custom-script-element', Vue.extend(elementExecutionMixin).extend(executable.CustomScriptElement));
Vue.component('custom-script-entry', Vue.extend(entryExecutionMixin).extend(executable.CustomScriptEntry));
Vue.component('custom-script-entry-outputs', Vue.extend(entryExecutionMixin).extend(executable.CustomScriptEntryOutputs));
Vue.component('custom-script-output-array', Vue.extend(entryExecutionMixin).extend(executable.CustomScriptOutputArray));
Vue.component('eip-element', Vue.extend(elementExecutionMixin).extend(executable.EipElement));
Vue.component('eip-entry', Vue.extend(entryExecutionMixin).extend(executable.EipEntry));
Vue.component('wait-dp-element', Vue.extend(elementExecutionMixin).extend(executable.WaitDPElement));
Vue.component('wait-dp-entry', Vue.extend(entryExecutionMixin).extend(executable.WaitDPEntry));
Vue.component('list-dp-element', Vue.extend(elementExecutionMixin).extend(executable.ListDPElement));
Vue.component('list-dp-entry', Vue.extend(entryExecutionMixin).extend(executable.ListDPEntry));

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/execute_spa/:venueId/:executionId',
            component: Execution
        }
    ]
});

new Vue({
    el: '#spa-execution',
    router,
    store,
    render: h => h(ExecutionRouter),
});
