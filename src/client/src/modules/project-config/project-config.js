import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../common/store';
import ProjectConfigRouter from './ProjectConfigRouter.vue';
import FlightDictionary from './flight-dictionary/FlightDictionary.vue';
import FlightDictionaryVersion from './flight-dictionary/FlightDictionaryVersion.vue';
import SseDictionary from './sse-dictionary/SseDictionary.vue';
import SseDictionaryVersion from './sse-dictionary/SseDictionaryVersion.vue';
import CmdVersion from "./common/CmdVersion.vue";
import EvrVersion from "./common/EvrVersion.vue";
import EhaVersion from "./common/EhaVersion.vue";
import Mil1553Version from "./common/Mil1553Version.vue";
import Vis from "./vis/Vis.vue";
import CustomScripts from "./custom-scripts/CustomScripts.vue";
import VueClipboard from "vue-clipboard2";

import { getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

Vue.use(VueRouter);
Vue.use(VueClipboard);

let abilities = defineAbilityFor(getUserScopes());
Vue.use(abilitiesPlugin, abilities);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/project_configuration/sse', 
            name: 'SseDictionary',
            component: SseDictionary
        },
        {
            path: '/project_configuration/sse/:version', 
            name: 'SseDictionaryVersion',
            component: SseDictionaryVersion,
            children: [
                {
                    path: '',
                    name: 'CmdVersion',
                    component: CmdVersion,
                    props: (route) => ({
                        dict_type: 'sse',
                        version: route.params.version,
                        type: 'cmds'
                    })
                },
                {
                    path: 'cmds',
                    name: 'CmdVersion',
                    component: CmdVersion,
                    props: (route) => ({
                        dict_type: 'sse',
                        version: route.params.version,
                        type: 'cmds'
                    })
                },
                {
                    path: 'evrs',
                    name: 'EvrVersion',
                    component: EvrVersion,
                    props: (route) => ({
                        dict_type: 'sse',
                        version: route.params.version,
                        type: 'evrs'
                    })
                },
                {
                    path: 'ehas',
                    name: 'EhaVersion',
                    component: EhaVersion,
                    props: (route) => ({
                        dict_type: 'sse',
                        version: route.params.version,
                        type: 'ehas'
                    })
                },
                {
                    path: 'mil1553',
                    name: 'Mil1553Version',
                    component: Mil1553Version,
                    props: (route) => ({
                        dict_type: 'sse',
                        version: route.params.version,
                        type: 'mil1553'
                    })
                }
            ]
        },
        {
            path: '/project_configuration/flight', 
            name: 'FlightDictionary',
            component: FlightDictionary
        },
        {
            path: '/project_configuration/flight/:version', 
            name: 'FlightDictionaryVersion',
            component: FlightDictionaryVersion,
            children: [
                {
                    path: '',
                    name: 'CmdVersion',
                    component: CmdVersion,
                    props: (route) => ({
                        dict_type: 'flight',
                        version: route.params.version,
                        type: 'cmds'
                    })
                },
                {
                    path: 'cmds',
                    name: 'CmdVersion',
                    component: CmdVersion,
                    props: (route) => ({
                        dict_type: 'flight',
                        version: route.params.version,
                        type: 'cmds'
                    })
                },
                {
                    path: 'evrs',
                    name: 'EvrVersion',
                    component: EvrVersion,
                    props: (route) => ({
                        dict_type: 'flight',
                        version: route.params.version,
                        type: 'evrs'
                    })
                },
                {
                    path: 'ehas',
                    name: 'EhaVersion',
                    component: EhaVersion,
                    props: (route) => ({
                        dict_type: 'flight',
                        version: route.params.version,
                        type: 'ehas'
                    })
                },
                {
                    path: 'mil1553',
                    name: 'Mil1553Version',
                    component: Mil1553Version,
                    props: (route) => ({
                        dict_type: 'flight',
                        version: route.params.version,
                        type: 'mil1553'
                    })
                }
            ]
        },
        {
            path: '/project_configuration/vis', 
            name: 'Vis',
            component: Vis
        },
        {
            path: '/project_configuration/custom_scripts', 
            name: 'CustomScripts',
            component: CustomScripts
        }
    ]
});

new Vue({
    el: '#spa-project-config',
    router,
    store,
    render: h => h(ProjectConfigRouter)
});


