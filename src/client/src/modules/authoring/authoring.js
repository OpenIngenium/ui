import Vue from 'vue';
import VueRouter from 'vue-router';
import VueSocketIO from 'vue-socket.io';
import store from './store';
import Authoring from './Authoring.vue';
import Procedures from './Procedures.vue';
import ProcedureVersions from './ProcedureVersions.vue';
import AuthoringRouter from './AuthoringRouter.vue';
import IngModal from '../common/IngModal.vue';
import IngPopover from '../common/IngPopover.vue';
import { DragAndDrop } from '../common/directives/DragAndDrop';
import { ContextMenu } from '../common/directives/ContextMenu';
import IngElement from '../elements/IngElement.vue';
import IngElementWrapper from '../elements/IngElementWrapper.vue';
import EntryWrapper from '../elements/EntryWrapper.vue';
import IngSpinner from '../common/IngSpinner.vue';

import { getJwt, getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

import nonExecutable from '../elements/non-executable/index';
import executable from '../elements/executable/index';
import elementAuthoringMixin from "../elements/mixins/element-authoring-mixin";
import entryAuthoringMixin from "../elements/mixins/entry-authoring-mixin";
import authoringNestableMixin from "../elements/mixins/authoring-nestable-mixin";

import '../common/froala-import';

import VueFroala from 'ing-vue-froalav3-wysiwyg';
import VueClipboard from 'vue-clipboard2';

import Toasted from 'vue-toasted';
import '../common/froala-import';
import 'vue-datetime/dist/vue-datetime.css';

// Turn on for performance profiling
// Vue.config.performance = true;

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
        actionPrefix: 'SOCKET_PROCEDURE_'
    },
    options: {
        path:'/execution_monitor/socket.io',
        query: { token: getJwt() },
        transports: ['websocket'],
        autoConnect: false
    }
}));

Vue.component('ing-element', Vue.extend(authoringNestableMixin).extend(IngElement));
Vue.component('ing-element-wrapper', Vue.extend(authoringNestableMixin).extend(IngElementWrapper));
Vue.component('ing-spinner', IngSpinner);

Vue.directive('drag-and-drop', DragAndDrop);
Vue.directive('click-outside', ContextMenu);

Vue.component('ing-modal', IngModal);
Vue.component('ing-popover', IngPopover);
Vue.component('entries-wrapper', Vue.extend(entryAuthoringMixin).extend(EntryWrapper));
Vue.component('section-element', nonExecutable.SectionElement);
Vue.component('paragraph-element', nonExecutable.ParagraphElement);
Vue.component('run-procedure-element', Vue.extend(elementAuthoringMixin).extend(nonExecutable.RunProcedureElement));

Vue.component('venue-config-element', Vue.extend(elementAuthoringMixin).extend(executable.VenueConfigElement));
Vue.component('cmd-element', Vue.extend(elementAuthoringMixin).extend(executable.CmdElement));
Vue.component('cmd-entry', Vue.extend(entryAuthoringMixin).extend(executable.CmdEntry));
Vue.component('cmd-file-element', Vue.extend(elementAuthoringMixin).extend(executable.CmdFileElement));
Vue.component('cmd-file-entry', Vue.extend(entryAuthoringMixin).extend(executable.CmdFileEntry));
Vue.component('cmd-sse-element', Vue.extend(elementAuthoringMixin).extend(executable.CmdSseElement));
Vue.component('cmd-sse-entry', Vue.extend(entryAuthoringMixin).extend(executable.CmdSseEntry));
Vue.component('cmd-scmf-element', Vue.extend(elementAuthoringMixin).extend(executable.CmdScmfElement));
Vue.component('cmd-scmf-entry', Vue.extend(entryAuthoringMixin).extend(executable.CmdScmfEntry));
Vue.component('manual-input-element', Vue.extend(elementAuthoringMixin).extend(executable.ManualInputElement));
Vue.component('manual-input-entry', Vue.extend(entryAuthoringMixin).extend(executable.ManualInputEntry));
Vue.component('manual-verification-element', Vue.extend(elementAuthoringMixin).extend(executable.ManualVerificationElement));
Vue.component('manual-gds-element', Vue.extend(elementAuthoringMixin).extend(executable.ManualGdsElement));
Vue.component('manual-gds-entry', Vue.extend(entryAuthoringMixin).extend(executable.ManualGdsEntry));
Vue.component('queryevr-element', Vue.extend(elementAuthoringMixin).extend(executable.QueryEvrElement));
Vue.component('wait-element', Vue.extend(elementAuthoringMixin).extend(executable.WaitElement));
Vue.component('time-reference-element', Vue.extend(elementAuthoringMixin).extend(executable.TimeReferenceElement));
Vue.component('environment-element', Vue.extend(elementAuthoringMixin).extend(executable.EnvironmentElement));
Vue.component('get-venue-config-element', Vue.extend(elementAuthoringMixin).extend(executable.GetVenueConfigElement));
Vue.component('get-venue-config-entry', Vue.extend(entryAuthoringMixin).extend(executable.GetVenueConfigEntry));
Vue.component('check-venue-config-element', Vue.extend(elementAuthoringMixin).extend(executable.CheckVenueConfigElement));
Vue.component('check-venue-config-entry', Vue.extend(entryAuthoringMixin).extend(executable.CheckVenueConfigEntry));
Vue.component('update-venue-config-element', Vue.extend(elementAuthoringMixin).extend(executable.UpdateVenueConfigElement));
Vue.component('update-venue-config-entry', Vue.extend(entryAuthoringMixin).extend(executable.UpdateVenueConfigEntry));
Vue.component('graph-eha-element', Vue.extend(elementAuthoringMixin).extend(executable.GraphEhaElement));
Vue.component('verify-eha-element', Vue.extend(elementAuthoringMixin).extend(executable.VerifyEhaElement));
Vue.component('verify-eha-entry', Vue.extend(entryAuthoringMixin).extend(executable.VerifyEhaEntry));
Vue.component('wait-eha-element', Vue.extend(elementAuthoringMixin).extend(executable.WaitEhaElement));
Vue.component('wait-eha-entry', Vue.extend(entryAuthoringMixin).extend(executable.WaitEhaEntry));
Vue.component('wait-evr-element', Vue.extend(elementAuthoringMixin).extend(executable.WaitEvrElement));
Vue.component('wait-evr-entry', Vue.extend(entryAuthoringMixin).extend(executable.WaitEvrEntry));
Vue.component('bus-1553-element', Vue.extend(elementAuthoringMixin).extend(executable.Bus1553Element));
Vue.component('bus-1553-entry', Vue.extend(entryAuthoringMixin).extend(executable.Bus1553Entry));
Vue.component('verification-item-element', Vue.extend(elementAuthoringMixin).extend(nonExecutable.VerificationItemElement));
Vue.component('verification-item-status-element', Vue.extend(elementAuthoringMixin).extend(executable.VerificationItemStatusElement));
Vue.component('custom-script-element', Vue.extend(elementAuthoringMixin).extend(executable.CustomScriptElement));
Vue.component('custom-script-entry', Vue.extend(entryAuthoringMixin).extend(executable.CustomScriptEntry));
Vue.component('custom-script-entry-outputs', Vue.extend(entryAuthoringMixin).extend(executable.CustomScriptEntryOutputs));
Vue.component('custom-script-output-array', Vue.extend(entryAuthoringMixin).extend(executable.CustomScriptOutputArray));
Vue.component('eip-element', Vue.extend(elementAuthoringMixin).extend(executable.EipElement));
Vue.component('eip-entry', Vue.extend(entryAuthoringMixin).extend(executable.EipEntry));
Vue.component('wait-dp-element', Vue.extend(elementAuthoringMixin).extend(executable.WaitDPElement));
Vue.component('wait-dp-entry', Vue.extend(entryAuthoringMixin).extend(executable.WaitDPEntry));
Vue.component('list-dp-element', Vue.extend(elementAuthoringMixin).extend(executable.ListDPElement));
Vue.component('list-dp-entry', Vue.extend(entryAuthoringMixin).extend(executable.ListDPEntry));

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/authoring/:procedureId/:version',
            component: Authoring
        },
        {
            path: '/procedures/:procedureId',
            component: ProcedureVersions
        },
        {
            path: '/procedures',
            component: Procedures
        },
    ]
});

new Vue({
    el: '#spa-authoring',
    router,
    store,
    render: h => h(AuthoringRouter)
});
