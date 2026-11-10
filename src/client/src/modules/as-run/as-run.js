import Vue from 'vue';
import VueRouter from 'vue-router';
import VueSocketIO from 'vue-socket.io';
import store from '../common/store';
import AsRun from './AsRun.vue';
import AsRunRouter from './AsRunRouter.vue';
import IngElement from '../elements/IngElement.vue';
import IngElementWrapper from '../elements/IngElementWrapper.vue';
import EntryWrapper from '../elements/EntryWrapper.vue';
import IngSpinner from '../common/IngSpinner.vue';
import IngModal from '../common/IngModal.vue';
import IngPopover from '../common/IngPopover.vue';
import ExecutionStatusCheck from '../execution/ExecutionStatusCheck.vue';
import ExecutionFullResults from '../execution/ExecutionFullResults.vue';

import { getJwt, getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

import nonExecutable from '../elements/non-executable/index';
import executable from '../elements/executable/index';
import elementAsRunMixin from "../elements/mixins/element-as-run-mixin";
import entryAsRunMixin from "../elements/mixins/entry-as-run-mixin";
import asRunNestableMixin from "../elements/mixins/as-run-nestable-mixin";

import '../common/froala-import';

import Toasted from 'vue-toasted';
import VueFroala from 'ing-vue-froalav3-wysiwyg';
import VueClipboard from 'vue-clipboard2';

import '../common/froala-import';
import 'vue-datetime/dist/vue-datetime.css';
 
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
        actionPrefix: 'SOCKET_AS_RUN_'
    },
    options: {
        path:'/execution_monitor/socket.io',
        query: { token: getJwt() },
        transports: ['websocket'],
        autoConnect: false
    }
}));

// Initialize drag and drop directive with an empty object.
// This prevents any dragging and dropping on the page.
Vue.directive('drag-and-drop', {});

Vue.component('entries-wrapper', Vue.extend(entryAsRunMixin).extend(EntryWrapper));
Vue.component('section-element', nonExecutable.SectionElement);
Vue.component('paragraph-element', nonExecutable.ParagraphElement);
Vue.component('run-procedure-element', Vue.extend(elementAsRunMixin).extend(nonExecutable.RunProcedureElement));

Vue.component('ing-element', Vue.extend(asRunNestableMixin).extend(IngElement));
Vue.component('ing-element-wrapper', Vue.extend(asRunNestableMixin).extend(IngElementWrapper));
Vue.component('ing-spinner', IngSpinner);
Vue.component('ing-modal', IngModal);
Vue.component('ing-popover', IngPopover);
Vue.component('execution-status-check', ExecutionStatusCheck);
Vue.component('execution-full-results', ExecutionFullResults);

Vue.component('cmd-element', Vue.extend(elementAsRunMixin).extend(executable.CmdElement));
Vue.component('cmd-entry', Vue.extend(entryAsRunMixin).extend(executable.CmdEntry));
Vue.component('cmd-file-element', Vue.extend(elementAsRunMixin).extend(executable.CmdFileElement));
Vue.component('cmd-file-entry', Vue.extend(entryAsRunMixin).extend(executable.CmdFileEntry));
Vue.component('cmd-sse-element', Vue.extend(elementAsRunMixin).extend(executable.CmdSseElement));
Vue.component('cmd-sse-entry', Vue.extend(entryAsRunMixin).extend(executable.CmdSseEntry));
Vue.component('cmd-scmf-element', Vue.extend(elementAsRunMixin).extend(executable.CmdScmfElement));
Vue.component('cmd-scmf-entry', Vue.extend(entryAsRunMixin).extend(executable.CmdScmfEntry));

Vue.component('manual-input-element', Vue.extend(elementAsRunMixin).extend(executable.ManualInputElement));
Vue.component('manual-input-entry', Vue.extend(entryAsRunMixin).extend(executable.ManualInputEntry));
Vue.component('manual-gds-element', Vue.extend(elementAsRunMixin).extend(executable.ManualGdsElement));
Vue.component('manual-gds-entry', Vue.extend(entryAsRunMixin).extend(executable.ManualGdsEntry));

Vue.component('manual-verification-element', Vue.extend(elementAsRunMixin).extend(executable.ManualVerificationElement));
Vue.component('queryevr-element', Vue.extend(elementAsRunMixin).extend(executable.QueryEvrElement));
Vue.component('wait-element', Vue.extend(elementAsRunMixin).extend(executable.WaitElement));
Vue.component('environment-element', Vue.extend(elementAsRunMixin).extend(executable.EnvironmentElement));
Vue.component('venue-config-element', Vue.extend(elementAsRunMixin).extend(executable.VenueConfigElement));

Vue.component('venue-config-element', Vue.extend(elementAsRunMixin).extend(executable.VenueConfigElement));
Vue.component('get-venue-config-element', Vue.extend(elementAsRunMixin).extend(executable.GetVenueConfigElement));
Vue.component('get-venue-config-entry', Vue.extend(entryAsRunMixin).extend(executable.GetVenueConfigEntry));
Vue.component('check-venue-config-element', Vue.extend(elementAsRunMixin).extend(executable.CheckVenueConfigElement));
Vue.component('check-venue-config-entry', Vue.extend(entryAsRunMixin).extend(executable.CheckVenueConfigEntry));
Vue.component('update-venue-config-element', Vue.extend(elementAsRunMixin).extend(executable.UpdateVenueConfigElement));
Vue.component('update-venue-config-entry', Vue.extend(entryAsRunMixin).extend(executable.UpdateVenueConfigEntry));

Vue.component('verify-eha-element', Vue.extend(elementAsRunMixin).extend(executable.VerifyEhaElement));
Vue.component('verify-eha-entry', Vue.extend(entryAsRunMixin).extend(executable.VerifyEhaEntry));
Vue.component('wait-eha-element', Vue.extend(elementAsRunMixin).extend(executable.WaitEhaElement));
Vue.component('wait-eha-entry', Vue.extend(entryAsRunMixin).extend(executable.WaitEhaEntry));
Vue.component('graph-eha-element', Vue.extend(elementAsRunMixin).extend(executable.GraphEhaElement));

Vue.component('wait-evr-element', Vue.extend(elementAsRunMixin).extend(executable.WaitEvrElement));
Vue.component('wait-evr-entry', Vue.extend(entryAsRunMixin).extend(executable.WaitEvrEntry));

Vue.component('verification-item-element', Vue.extend(elementAsRunMixin).extend(nonExecutable.VerificationItemElement));
Vue.component('verification-item-status-element', Vue.extend(elementAsRunMixin).extend(executable.VerificationItemStatusElement));

Vue.component('bus-1553-element', Vue.extend(elementAsRunMixin).extend(executable.Bus1553Element));
Vue.component('bus-1553-entry', Vue.extend(entryAsRunMixin).extend(executable.Bus1553Entry));

Vue.component('custom-script-element', Vue.extend(elementAsRunMixin).extend(executable.CustomScriptElement));
Vue.component('custom-script-entry', Vue.extend(entryAsRunMixin).extend(executable.CustomScriptEntry));
Vue.component('custom-script-entry-outputs', Vue.extend(entryAsRunMixin).extend(executable.CustomScriptEntryOutputs));
Vue.component('custom-script-output-array', Vue.extend(entryAsRunMixin).extend(executable.CustomScriptOutputArray));

Vue.component('eip-element', Vue.extend(elementAsRunMixin).extend(executable.EipElement));
Vue.component('eip-entry', Vue.extend(entryAsRunMixin).extend(executable.EipEntry));

Vue.component('wait-dp-element', Vue.extend(elementAsRunMixin).extend(executable.WaitDPElement));
Vue.component('wait-dp-entry', Vue.extend(entryAsRunMixin).extend(executable.WaitDPEntry));

Vue.component('list-dp-element', Vue.extend(elementAsRunMixin).extend(executable.ListDPElement));
Vue.component('list-dp-entry', Vue.extend(entryAsRunMixin).extend(executable.ListDPEntry));

Vue.component('time-reference-element', Vue.extend(elementAsRunMixin).extend(executable.TimeReferenceElement));

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/execute/as_run/:executionId',
            component: AsRun
        }
    ]
});


new Vue({
    el: '#spa-execute-as-run',
    router,
    components: {
        'ing-element-wrapper': Vue.extend(asRunNestableMixin).extend(IngElementWrapper)
    },
    store,
    render: h => h(AsRunRouter)
});
